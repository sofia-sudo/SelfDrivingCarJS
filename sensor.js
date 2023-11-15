//// Class for definition of a sensor unit
class Sensor
{
    constructor (car, rayCount=15, rayLength=150, raySpread = Math.PI / 2, correction= -89.5)
    {
        this.car = car;                 // Set the car to be established upon
        this.rayCount = rayCount;       // Set the number of rays to draw
        this.rayLength = rayLength;     // Set the ray length
        this.raySpread = raySpread;     // Set the angle of ray spread
        this.correction = correction;   // Correction is a variable found through trial and error to adjust the angle so that the sensors face the correct way

        this.rays = [];                 // Array to store the rays
        this.readings = [];             // Array to store the reading from each ray
    }

    /// Update the rays
    update(roadBorders, traffic)
    {
        // Cast rays
        this.#castRays();

        // Empty readings
        this.readings = [];

        // Iterate through each ray
        for (let i=0; i < this.rays.length; i++) 
        {
            // Append the reading from this ray to the readings[] array
            this.readings.push (
                this.#getReadings(this.rays[i], roadBorders, traffic)
            );
        }
    }

    /// Get the readings from a specific ray
    #getReadings(ray, roadBorders, traffic)
    {
        // Will store the co-ords of any collisions with the ray
        let collisions = [];

        // Iterate through the road borders
        for (let i=0; i < roadBorders.length; i++)
        {
            // Check for a collision
            const collision = getIntersection(ray[0], ray[1], roadBorders[i][0], roadBorders[i][1]);

            // Add any collision to the collision[] array
            if (collision)
            {
                collisions.push(collision);
            }
        }

        // Iterate through the traffic array
        for (let i=0; i < traffic.length; i++)
        {
            // Get the polygon of the car from the traffic array
            const poly = traffic[i].polygon;

            // Iterate through the polygon
            for (let j=0; j < poly.length; j++)
            {
                // Check for a collision
                const val = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1) % poly.length]
                );

                // Add any collision to the collision[] array
                if (val)
                {
                    collisions.push(val);
                }
            }
        }

        // If no collisions, return null
        if (collisions.length == 0)
        {
            return null;
        }
        else
        {
            // Find the offset of the collision (how close it is to the car)
            const offsets = collisions.map(e => e.offset);

            // Find the closest collision point to the car
            const minOffset = Math.min(...offsets);

            // Return the closest collision
            return (collisions.find(e => e.offset==minOffset));
        }
    }

    /// Calculate the positioning of each ray on the sensor unit
    #castRays()
    {
        // Reset the rays array
        this.rays = [];

        // Iterate through each ray
        for (let i=0; i < this.rayCount; i++)
        {
            // Linear interpolation to get ray angle
            const rayAngle = lerp(this.raySpread / 2, -this.raySpread / 2, i / this.rayCount - 1) + this.car.angle;
            
            // Calculate positioning of the ray
            const start = {x:this.car.x, y:this.car.y};
            const end = {x:this.car.x - (Math.sin(rayAngle + this.correction)) * this.rayLength,
                         y:this.car.y - (Math.cos(rayAngle + this.correction))* this.rayLength};

            // Append the ray into the rays[] array
            this.rays.push([start, end]);
        }
    }

    /// Renders the rays onscreen
    draw(ctx)
    {
        // Iterate through each ray
        for (let i=0; i < this.rayCount; i++)
        {
            // Check for intersection on this ray
            let end = this.rays[i][1];
            if (this.readings[i])
            {
                end = this.readings[i];
            }

            // Draw ray in yellow
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle= "yellow";
            ctx.moveTo
            (
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo
            (
                end.x,
                end.y
            );
            ctx.stroke();

            // Draw collision in red
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle= "red";
            ctx.moveTo
            (
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo
            (
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}