//// PRIMARY CONTROLLER FOR PROGRAM

// Define Car Canvas
const carCanvas = document.getElementById("mainCanvas");
carCanvas.width = 200;
const carCtx = carCanvas.getContext("2d");

// Define Network Canvas
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;
const networkCtx = networkCanvas.getContext("2d");

// Create road
const road = new Road(carCanvas.width/2, carCanvas.width*0.9);

// Intialise gen counter, pulling from memory if available
let genCounter = 0;
if (localStorage.getItem("genCounter"))
{
    genCounter = localStorage.getItem("genCounter");
}

// Update HTML element to display genCounter
updateGenCounter();

// Declare global variables for configuration
let cars;
let champion;
let traffic;
let telemetry = true;

// Configure environment
configure();

// Animate environment
animate();

// Update scoreboard to render starting scores
updateScoreBoard();

/// Updates the scoreboard element to reflect current scores
function updateScoreBoard()
{
    // Create new array and add each STARCAR into the array
    let scoreboard = [];
    cars.forEach(car => 
        {
            scoreboard.push(car);
        });

    // Sort the scoreboard such that the car with the highest score comes first, and the car with the lowest score comes last.
    scoreboard.sort((a, b) => (a.score < b.score) ? 1 : -1);
    
    // Get the scoreboard element from the HTML
    let table = document.getElementById("scoreboard");

    // If table is not null -
    if (table)
    {
        // Store the number of rows
        let rowCount = table.rows.length;

        // Iterate through each row of the table element
        for (let i = rowCount - 1; i > 0; i--) 
        {
            // Delete row element
            table.deleteRow(i);
        }

        // Iterate through the top 25 drivers
        for (let i = 0; i < 25; i++)
        {
            // Insert new row, and capture it with variable 'row'
            let row = table.insertRow();

            // Will display the current incentive
            let incentiveText = "";

            // If damaged
            if (scoreboard[i].damaged)
            {
                // Incentive text will appear orange to show the car is damaged and the fitness function is no longer being executed
                incentiveText = "🟧🟧🟧🟧🟧🟧";
            }
            else
            {
                // Add green / red squares to indicate the positive or negative incentive the car is currently experiencing.
                for (let j = 0; j < 6; j++)
                {
                    if (scoreboard[i].incentive > 0)
                    {
                        if (Math.round(scoreboard[i].incentive) > j)
                        {
                            incentiveText += "🟩";
                        }
                        else
                        {
                            incentiveText += "⬜";
                        }
                    }
                    else
                    {
                        if (Math.abs(Math.round(scoreboard[i].incentive)) > j)
                        {
                            incentiveText += "🟥";
                        }
                        else
                        {
                            incentiveText += "⬜";
                        }
                    }
                }  
            }      

            // Controls will store the current directional controls of the car as determined by the neural network
            let controls = "";


            // If damaged then display red squares to indicate that the car's controls are inactive
            if (scoreboard[i].damaged && telemetry)
            {
                controls = "🟥🟥🟥🟥";
            }
            else if (telemetry)
            {
                // Display the controls if they are activated, display a white square if not
                if (scoreboard[i].controls.throttle)
                {
                    controls += "⬆️"
                }
                else
                {
                    controls += "⬜";
                }

                if (scoreboard[i].controls.left)
                {
                    controls += "⬆️"
                }
                else
                {
                    controls += "⬅️";
                }

                if (scoreboard[i].controls.right)
                {
                    controls += "➡️"
                }
                else
                {
                    controls += "⬜";
                }
                
                if (scoreboard[i].controls.brake)
                {
                    controls += "⬇️"
                }
                else
                {
                    controls += "⬜";
                }
            }      

            // Add the incentive text to the table row
            let incentiveCell = row.insertCell(0);
            incentiveCell.innerHTML = incentiveText;

            // Add the current position of the car to the table row
            let rankCell = row.insertCell(1);
            rankCell.innerHTML = i;

            // Add the driver's ID/name to the table row
            let driverCell = row.insertCell(2);
            driverCell.innerHTML = scoreboard[i].driver;

            // Add the current score to the table row
            let scoreCell = row.insertCell(3);
            scoreCell.innerHTML = Math.ceil(scoreboard[i].score);
            
            // Add the curent status of the car (Speed or DNF) to the table row
            let statusCell = row.insertCell(4);
            if (scoreboard[i].damaged)
            {
                statusCell.innerHTML = "⛑️ " + scoreboard[i].overtaken;
                let speedCell = row.insertCell(5);
                speedCell.innerHTML = controls + " DNF";
            }
            else
            {
                statusCell.innerHTML = "🏁 " + scoreboard[i].overtaken;
                let speedCell = row.insertCell(5);
                speedCell.innerHTML = controls + " " + Math.ceil(scoreboard[i].speed * 26).toString();
            }

            
        }
    }
}

/// Updates the HTML element displaying the generation number
function updateGenCounter()
{
    // Update HTML element to display genCounter
    let genCounterElement = document.getElementById("genCounter");
    if (genCounterElement) 
    {
        genCounterElement.textContent = genCounter;
    }
}

/// Configures the environment for the start of a new generation
function configure()
{
    // Increment generation counter & update text
    genCounter++;
    updateGenCounter();

    // Generate 50 AI cars
    cars = generateCars(50);
    champion = cars[0];

    // Instantiate the neural networks for each car
    if (localStorage.getItem("bestBrain"))
    {
        // Iterate through each car
        for (let i=0; i < cars.length; i++)
        {
            // Assign champion's neural network to new car
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            
            // Generate driver name from list
            cars[i].driver = drivers[i];

            if (i != 0)
            {
                // Mutate the neural network
                NeuralNetwork.mutate(cars[i].brain, 0.1);
            }
            else
            {
                // For the first car, do not mutate the network and carry over the champion's name for easy identification
                cars[i].driver = localStorage.getItem("bestDriver");
            }

            // Do not allow the same name as the champion to be generated
            if (localStorage.getItem("bestDriver").includes(cars[i].driver) && i != 0)
            {
                cars[i].driver = drivers[51];
            }
        }
    }
    else
    {
        for (let i=0; i < cars.length; i++)
        {
            cars[i].driver = drivers[i];
        }
    }

    // Array which stores all non-AI cars
    traffic = [
        // 1: 3x Peugots 200 apart
        new Car(road.getLaneCenter(0), -100, 30, 50, "PEUGOT", 2),
        new Car(road.getLaneCenter(1), -300, 30, 50, "PEUGOT", 2),
        new Car(road.getLaneCenter(2), -100, 30, 50, "PEUGOT", 2),
        // 2: 3x Peugots 150 apart
        new Car(road.getLaneCenter(0), -450, 30, 50, "PEUGOT", 2),
        new Car(road.getLaneCenter(1), -600, 30, 50, "PEUGOT", 2),
        new Car(road.getLaneCenter(2), -450, 30, 50, "PEUGOT", 2),
        // 3: 3x Citroens 200 apart
        new Car(road.getLaneCenter(0), -800, 30, 50, "CITROEN", 2),
        new Car(road.getLaneCenter(1), -1000, 30, 50, "CITROEN", 2),
        new Car(road.getLaneCenter(2), -900, 30, 50, "CITROEN", 2),
        // 3: 2x Peugots 1x Citroen 100/200 apart
        new Car(road.getLaneCenter(0), -1200, 30, 50, "PEUGOT", 2),
        new Car(road.getLaneCenter(1), -1400, 30, 50, "CITROEN", 2),
        new Car(road.getLaneCenter(2), -1300, 30, 50, "PEUGOT", 2),
        // 4: 2 Isuzu, 1 Citroen
        new Car(road.getLaneCenter(0), -1600, 30, 125, "ISUZU", 2),
        new Car(road.getLaneCenter(1), -1900, 30, 50, "CITROEN", 2),
        new Car(road.getLaneCenter(2), -1700, 30, 125, "ISUZU", 2)
    ];
}

/// Saves the best driver, their ID and the generation counter to the browser's local storage
function save()
{
    localStorage.setItem("bestBrain", JSON.stringify(champion.brain));
    localStorage.setItem("bestDriver", ("👑" + champion.driver));
    localStorage.setItem("genCounter", genCounter);
}

/// Discards the saved data in local storage
function discard()
{
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("genCounter");
    localStorage.removeItem("bestDriver");
}

/// Saves the generation's data and starts a new generation
function reset()
{
    discard();
    save();
    configure();
}

/// Generates N new starcars in an array
function generateCars(N)
{
    let cars = [];
    for (let i = 1; i < N; i++)
    {
        cars.push(new Car(road.getLaneCenter(0), 100, 30, 50, "STARCAR"));
    }
    return (cars);
}

/// Responsible for animating the next tick
function animate(time)
{
    // Iterate through the traffic array
    for (let i = 0; i < traffic.length; i++)
    {
        // call update on each car in the traffic array
        traffic[i].update(road.borders, []);
    }

    // Iterate through the star cars array
    for (let i = 0; i < cars.length; i++)
    {
        // call update and fitness function on each car
        cars[i].update(road.borders, traffic);
        cars[i].fitnessFunction(road, traffic);
    }

    // Find the champion (car with highest score)
    champion = cars.find(
        c => c.score==Math.max(...cars.map(c => c.score))
    );

    // Get the height of the car and network canvasses for rendering
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    // Camera controls
    carCtx.save();
    carCtx.translate(0, -champion.y+carCanvas.height*0.7);

    // Draw the car context onto the road
    road.draw(carCtx);

    // Iterate through the traffic array & render each car
    for (let i = 0; i < traffic.length; i++)
    {
        traffic[i].draw(carCtx);
    }

    // Reduce alpha to render cars as translucent
    carCtx.globalAlpha = 0.2;

    // Iterate through the star cars and render each car
    for (let i = 0; i < cars.length; i++)
    {
        cars[i].draw(carCtx, "blue");
    }

    // Reset alpha to draw the highest scoring car as solid colour
    carCtx.globalAlpha = 1;

    // Render sensors on champion car
    champion.draw(carCtx, "blue", true);

    // Render the neural network of the champion car
    networkCtx.lineDashOffset = -time / 30
    Visualizer.drawNetwork(networkCtx, champion.brain);
    
    // Update timer
    document.getElementById("timer").innerHTML = time;

    // Update the scoreboard
    updateScoreBoard();

    // Update rendering
    requestAnimationFrame(animate);
}

// Telemetry determines whether or not to display the car's controls in the HTML
function toggleTelemetry()
{
    telemetry = !telemetry;
}
