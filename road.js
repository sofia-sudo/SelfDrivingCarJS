//// Class to define the Road environment
class Road 
{
    constructor (x, width, laneCount=3)
    {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2;
        this.right = x + width / 2;

        const inf = 10000000;
        this.top = -inf;
        this.bottom = inf;

        // Establish the corners of the road
        const topLeft = {x:this.left, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const topRight = {x:this.right, y:this.top};
        const bottomRight = {x:this.right, y:this.bottom};

        // Declare the vertical borders of the road
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ]
    }

    /// Return the x axis value of the centre of the lane
    getLaneCenter (laneIndex)
    {
        // Calculate lane width
        const laneWidth = this.#getLaneWidth();

        // Calculate & return the middle of the lane
        return (this.left + laneWidth/2 + laneIndex * laneWidth);
    }

    /// Get lane width
    #getLaneWidth ()
    {
        // Calculate & return the lane width
        const laneWidth = this.width /  this.laneCount;
        return (laneWidth);
    }

    /// Render the road on the given context
    draw (ctx)
    {
        // Set the brush style
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // Linear Interpolation to calculate lane boundaries
        for (let i=1; i <= this.laneCount-1; i++)
        {
            // Linear interpolation to get lane width
            const x = lerp(this.left, this.right, i/this.laneCount);
        
            // Dashed line for lane boundaries
            ctx.setLineDash([20,20]);

            // Draw lane boundary
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        // Render borders
        ctx.setLineDash([]);
        this.borders.forEach (border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y)
            ctx.stroke();
        });

    }
}

