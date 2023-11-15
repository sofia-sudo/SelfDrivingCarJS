//// WORK IN PROGRESS ////

// Used by a Gantry to close a lane of the road & adjust road borders accordingly
class LaneClosure
{
    constructor (road, lane, start, end)
    {
        this.road = road;
        this.lane = lane;
        this.start = start;
        this.end = end;

        this.#calculateDimensions();
    }

    #calculateDimensions()
    {
        let centre = this.road.getLaneCenter();
        let width = this.road.getLaneWidth();

        // Get base dimensions
        this.x = centre;
        this.width = width;

        // Calculate lateral points
        this.left = this.x - this.width / 2;
        this.right = this.x + this.width / 2;

        // Calculate vertical points
        this.top = this.end;
        this.bottom = this.start;

        const topLeft = {x:this.left, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const topRight = {x:this.right, y:this.top};
        const bottomRight = {x:this.right, y:this.bottom};

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ]
    }

    draw (ctx)
    {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";

        ctx.setLineDash([]);
        this.borders.forEach (border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });

    }
}