/// Class for controls of cars
class Controls 
{
    constructor(type)
    {
        // Establish the control variables 
        this.throttle=false;
        this.left=false;
        this.right=false;
        this.brake=false;

        // Identify the type of car & execute setup for each
        switch (type)
        {
            case "STARCAR" :
                break;
            case "DRIVEN" :
                this.#addKeyboardListeners();
                break;
            case "PEUGOT" :
                this.throttle = true;
                break;
            case "ISUZU" :
                this.throttle = true;
                break;
            case "CITROEN" :
                this.throttle = true;
                break;
        }
    }

    /// Function used to control car with keyboard
    /// Used for DRIVEN cars
    #addKeyboardListeners()
    {
        // Setup keypress listeners & assign output to each
        document.onkeydown=(event)=>{
            switch(event.key)
            {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp" :
                    this.throttle = true;
                    break;
                case "ArrowDown" :
                    this.brake = true;
                    break;
            }
        }

        // Setup key release listeners & assign output to each
        document.onkeyup=(event)=>{
            switch(event.key)
            {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp" :
                    this.throttle = false;
                    break;
                case "ArrowDown" :
                    this.brake = false;
                    break;
            }
        }
    }

}