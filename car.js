class Car 
{
    constructor (x, y, width, height, controlType, topSpeed=3)
    {
        // Positional variables
        this.x = x;                     // X position
        this.y = y;                     // Y position
        this.width = width;             // Width of the vehicle
        this.height = height;           // Height of the vehicle
        this.angle=0;                   // Current angle of the car relative to road

        // Motion variables
        this.speed = 0;                 // Current speed of the car
        this.acceleration = 0.2;        // Acceleration rate of the car
        this.topSpeed = topSpeed;       // Top speed of the car
        this.friction = 0.1;            // 

        // General variables
        this.AIPowered = false;         // Whether to use AI controls or automatic controls
        this.controlType = controlType; // Control type of car
        this.damaged = false;           // When true, car is destroyed and cannot move

        // AI variables
        this.score = 0;                 // Score as according to fitness function
        this.previousY = y;             // Y position from previous tick; used in fitness function
        this.incentive = 0;             // Reward / Punishment for reinforcement learning
        this.overtaken = 0;             // Number of cars overtaken
        this.bonus = 0;                 // Bonus score to be added at end of the generation's lifespan

        // STARCARS are AI controlled
        if (controlType == "STARCAR")
        {
            this.AIPowered = true; // Set AI powered to true
            this.sensor = new Sensor(this); // Instantiate a new sensor
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]); // Instantiate a new Neural Network
            this.driver = "TEST DRIVER 01"; // Name the neural network (used for tracking networks between generations)
        }

        // Instantiate a new controller
        this.controls = new Controls(controlType);

    }

    /// FUNCTION FOR RENDERING THE CAR
    /// ctx = js context
    /// colour = colour to render the car (default black)
    /// drawSensors = boolean on whether or not to render the sensors as well (default no)
    draw (ctx, colour="black", drawSensors=false)
    {
        // If the car is damaged it should be rendered in grey to signify this
        if (this.damaged)
        {
            ctx.fillStyle = "gray";
        }
        else
        {
            ctx.fillStyle = colour;
        }

        // Construct a polygon for the car
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++)
        {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        
        // Fill the polygon we have constructed
        ctx.fill();

        // If applicable, also render the sensors by calling the sensor.draw() function
        if (this.sensor && drawSensors)
        {
            this.sensor.draw(ctx);
        }
    }

    /// Function to update the car each tick
    /// roadBorders = the borders of the road that it is possible to collide with
    /// traffic = array of other cars on the road
    update(roadBorders, traffic)
    {
        // Check the car is not damaged
        if (!this.damaged)
        {
            this.#updateMovement();                                     // Update the movement for the car
            this.polygon = this.#createPolygon();                       // Update the polygon for the car to reflect new position
            this.damaged = this.#assessDamage(roadBorders, traffic);    // Check the car has not crashd
        }

        // If the car is equipped with a sensor...
        if (this.sensor)
        {
            // Update the sensor
            this.sensor.update(roadBorders, traffic);

            // Invert the readings to create offsets
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );

            // Feed the offsets into the neural network
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            
            // If the car is AI controlled
            if (this.AIPowered)
            {
                // Update the controls as per the directions of the neural network
                this.controls.throttle = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.brake = outputs[3];
            }
        }
    }

    /// Function for assessing the performance of a neural network
    /// road = the Road variable from main.js (necessary only in future updates; hence defaults to null)
    /// traffic = an array of all cars on the road
    fitnessFunction(road=null, traffic)
    {
        // Set incentive to 0 for this tick.
        this.incentive = 0;

        // If the car is undamaged
        if (!this.damaged)
        {
            // Reward distance travelled and speed
            this.incentive += -(this.y - this.previousY);
            this.incentive += this.speed;

            // Punish excessive braking
            if (this.controls.brake)
            {
                this.incentive -= (this.topSpeed - this.speed) * 3;
            }
            
            // Reward overtaking
            let overtaken = 0;
            for (let i = 0; i < traffic.length; i++)
            {
                if (this.y < traffic[i].y)
                {
                    overtaken += 1;
                    this.score += 2;
                }
            }

            // If the car has just overtaken another, add a reward of 100.
            if (this.overtaken < overtaken)
            {
                this.overtaken = overtaken;
                this.incentive += 100;
            }

            // Add the Incentive to the car's score
            this.score += this.incentive;
        }

        ///// FUTURE UPDATE /////

        // Punish for deviation from lane centre
        /*let laneDistance = [];
        for(let i = 0; i < this.road.laneCount; i++)
        {
            laneDistance.push(Math.abs(this.x - this.road.getLaneCenter(i)));
        }
        console.log(Math.min(...laneDistance));*/

        ///// FUTURE UPDATE /////

        // Update previous y position to this tick's position
        this.previousY = this.y;
        
        // Score must not be negative
        if (this.score <= 0)
        {
            this.score = 0;
        }
    }

    /// Function to assess whether the car has crashed or not
    /// roadBorders = the borders of the road
    /// traffic = array of all other cars on the road
    #assessDamage(roadBorders, traffic)
    {
        // Iterate through the road borders
        for (let i=0; i < roadBorders.length; i++)
        {
            // Check for an intersection
            if (polysIntersect(this.polygon, roadBorders[i]))
            {
                return true;
            }
        }

        // Iterate through the traffic
        for (let i=0; i < traffic.length; i++)
        {
            // Check for an intersection
            if (polysIntersect(this.polygon, traffic[i].polygon))
            {
                return true;
            }
        }

        // Default to false - no collision
        return false;
    }

    /// Function to update the polygon to represent the cars present position
    #createPolygon()
    {
        const points = []; // Array to hold the points of the polygon
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        // Populate the array
        points.push(
            {
                x:this.x - Math.sin(this.angle - alpha) * rad,
                y:this.y - Math.cos(this.angle - alpha) * rad
            }
        );
        points.push(
            {
                x:this.x - Math.sin(this.angle + alpha) * rad,
                y:this.y - Math.cos(this.angle + alpha) * rad
            }
        );
        points.push(
            {
                x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            }
        );
        points.push(
            {
                x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            }
        );

        // Return the array
        return (points);
    }

    /// Responsible for interpreting the controls and producing movement as a result.
    #updateMovement()
    {
        // Used for controlling AUTO cars with irregular movement
        this.#customMovementCalls();

        // Throttle speed control
        if(this.controls.throttle)
        {
            this.speed += this.acceleration;
        }
        // Brake/Reverse speed control
        if(this.controls.brake)
        {
            this.speed -= this.acceleration;
        }
        // Invert reverse speed to keep controls consistent
        if (this.speed !=0)
        {
            const flip = this.speed > 0 ? 1 : -1;

            // Adjust angle left (increase)
            if(this.controls.left)
            {
                this.angle += 0.03 * flip;
            }
            // Adjust angle right (decrese)
            if(this.controls.right)
            {
                this.angle -= 0.03 * flip;
            }
        }

        // Limit top speed in forward and reverse directions
        if (this.speed >= this.topSpeed)
        {
            this.speed = this.topSpeed;
        }
        if (this.speed <= (this.topSpeed * -0.5))
        {
            this.speed = this.topSpeed * -0.5;
        }

        // Reduce acceleration by friction
        if (this.speed > 0)
        {
            this.speed -= this.friction;
        }
        if (this.speed < 0)
        {
            this.speed += this.friction;
        }

        // Halt the car if speed is below friction to stop kangarooing.
        if (Math.abs(this.speed) < this.friction)
        {
            this.speed = 0;
        }

        // Translate car according to speed. Angles used to control direction
        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    /// Calls the appropriate function to affect cars with unique movement patterns
    #customMovementCalls()
    {
        if (this.controlType == "CITROEN")
        {
            this.#citroenPattern();
        }
    }

    /// CITROEN type cars will adjust their speed at random
    #citroenPattern()
    {
        // Generate a random number between -0.1 and 0.1
        let ran = (Math.random() * 2 - 1) * 0.1;

        // Adjust top speed accordingly
        this.topSpeed += ran;

        // Enforce Min / Max of top speed
        if (this.topSpeed >= 3.1)
        {
            this.topSpeed = 3.1;
        }
        else if (this.topSpeed <= 1)
        {
            this.topSpeed = 1;
        }
    }
}