//// WORK IN PROGRESS ////

// Used to define a gantry over the road
class Gantry
{
    constructor(y, width, speedLimit)
    {
        this.y = y;
        this.width = width;
        this.speedLimit = speedLimit;
    }

    draw(ctx)
    {
        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}