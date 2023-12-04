# Neural Network Demonstration Project

## Overview

A project to explore making a neural network from scratch. I made this to deepen my understanding of how a neural network works under the hood, and to explore genetic algorithms.

![image](https://github.com/sofia-sudo/SelfDrivingCarJS/assets/66554514/4b9d7193-2299-4495-922b-aa2fd746d003)


## Table of Contents

1. [Getting Started](#getting-started)
    - [Technologies](#technologies)
    - [Prerequisites](#prerequisites)
2. [Operation](#usage)
3. [Project Structure](#project-structure)
4. [Genetic Algorithms](#data)
5. [Future Enhancements](#future-enhancements)
6. [License](#license)
7. [Acknowledgements](#acknowledgements)

## Getting Started

### Technologies

- JavaScript
- HTML
- JSON
  
### Prerequisites

Visual Studio Code is recommended to view and run the code
A Chromium browser is recommended to execute the code, but it should work in Firefox and pre-Chromium builds of Edge as well.

## Operation

Upon execution, a generation will automatically form and begin to drive.
- Black cars are automatically controlled with pre-programmed movement
- Blue cars are controlled by a neural network
- A scoreboard on the left keeps track of the performance of each AI
- On the right, the neural network of the leading AI is visualised

The AI works by casting 15 sensors out in front of the vehicle, which report back the distance between the car and any collision. Each car can accelerate, brake and steer left and right. These inputs can be executed simultaneously.

Each AI is judged by a fitness function designed to reward speed, distance travelled and overtaking cars, and is punished for tailgating other cars, driving slowly and braking unnecessarily

Parallelisation is employed so that 50 neural networks will compete simultaneously. At the end of a generation, the highest scoring network is applied to all 50 new cars, with each mutating slightly. The champion will always carry over exactly to the next generation.

-🔁 - Launches the next generation
-💾 - Save the current lead driver to local storage
-🗑️ - Discard the current saved data in local storage
-📡 - Toggles telemetry (the display of control inputs for each car).

![image](https://github.com/sofia-sudo/SelfDrivingCarJS/assets/66554514/13b28902-347e-4a92-8134-6940ad8fb92e)


## Project Structure

### Index.html
- The interface for the application
- Contains two canvases, one for the road and one for the neural network visualiser
- Contains a scoreboard for tracking performance of each driver

### Main.js
- Main file, runs the program
- Handles updates for each element
- Co-ordinates the rendering for each tick
- Handles the scoreboard

### Road.js
- Defines the road environment
- Handles lane count
- Contains relevant utility functions
- Renders the road

### Car.js
- Contains a class used to represent each car, AI controlled or automatically controlled.
- Holds the position & motion of the car
- Instantiates the Neural Network of the car (if applicable)
- Instantiates the Sensor unit of the car (if applicable)
- Instantiates the Control unit of the car

### Controls.js
- Represents a control unit
- Responsible for controlling the car

### Sensor.js
- Represents a sensor unit
- Handles the rendering of sensors
- Checks for collisions between the sensors and an object into which the car could crash
- Generates & stores readings for the sensors

### Network.js
- Contains two classes; Network and Layer

#### Layer class
- Represents a single layer of a neural network
- Accepts an input and output count
- Generates & stores weights and biases for each connection

#### Network class
- Represents a complete neural network
- Stores a collection of layers that feed into each other
- Contains a function for mutating itself by a given degree

### Visualizer.js
- Visualises the Neural Network

### Utils.js
- Contains utility functions;
- Linear Interpolation
- Check for intersection between two lines
- Check for intersection between two polygons

## Genetic Algorithms
This was my first time experimenting with genetic algorithms. The algorithm here is configured such that there are 50 networks in a generation, and upon advancing to the next generation only the champion is retained. The top-performing network is copied over, and then mutated 49 times by a variable degree to create the next generation of networks. 

## Future Enhancements

### Changes to the Fitness Function
- Punish for deviation from lane centre, reward driving in centre of lane
- Reward a quick, effective lane change, punish a slow lane change
- Punish harsh braking

### Changes to the Environment
- Addition of gantries to enable temporary speed limits and lane closures, as seen on smart motorways such as the M1
- Addition of cars that change lanes unexpectedly to simulate the everyday experience of driving on the M25
- Addition of junctions that allow new cars to join the road
- Add sections of motorway in which another lane joins the road, and is removed from the road

### Changes to the AI
- Modification to the genetic algorithm to experiment with other forms of carrying over the neural network, for example taking the top two performing models and splicing them together instead of mutating from the top performer

## License
Published under a Mozilla 2.0 Public License

## Acknowledgements
Produced using Dr. Radu Mariescu-Istodor's course accessible via FreeCodeCamp.
His course can be found at the link below and accessed for free.
https://www.youtube.com/watch?v=Rs_rAxEsAvI
