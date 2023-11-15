/// Class for a Neural Network
class NeuralNetwork
{
    constructor (neuronCounts)
    {
        // Establish the layers of the neural network
        this.layers = [];

        // Instantiate each layer of the network
        for (let i = 0; i < neuronCounts.length-1; i++)
        {
            this.layers.push(new Layer (neuronCounts[i], neuronCounts[i+1]));
        }
    }

    // Feed forward through the network
    static feedForward (givenInputs, network)
    {
        // Get the intermediary outputs by feeding forward the first layer
        let outputs = Layer.feedForward(givenInputs, network.layers[0]);

        // Repeat for each layer until the final output is obtained
        for (let i = 1; i < network.layers.length; i++)
        {
            outputs = Layer.feedForward(outputs, network.layers[i]);
        }

        // Return the final output
        return outputs;
    }

    /// Mutates the network by a given amount
    static mutate (network, amount=1)
    {
        // Iterate through each layer of the network
        network.layers.forEach(layer => 
        {
            // Iterate through each bias
            for(let i = 0; i < layer.biases.length; i++)
            {
                // Linearly Interpolate the bias
                layer.biases[i] = lerp(
                    layer.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }

            // Iterate through each weight (input / output)
            for(let i = 0; i < layer.weights.length; i++)
            {
                for(let j = 0; j < layer.weights[i].length; j++)
                {
                    // Linearly interpolate the weight
                    layer.weights[i][j]=lerp(
                        layer.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}

/// Class for one layer of a neural network
class Layer
{
    constructor (inputCount, outputCount)
    {
        // Declare inputs, outputs and biases
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        // Declare weights
        this.weights = [];

        // Define weights
        for (let i = 0; i < this.inputs.length; i++)
        {
            this.weights[i] = new Array(outputCount);
        }

        // Randomise layer
        Layer.#randomise(this);
    }

    /// Randomises the contents of a layer
    static #randomise (layer)
    {
        // Randomly generate all weights between -1 and 1
        for (let i = 0; i < layer.inputs.length; i++)
        {
            for (let j = 0; j < layer.outputs.length; j++)
            {
                layer.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        // Randomly generate biases between -1 and 1
        for (let i = 0; i < layer.biases.length; i++)
        {
            layer.biases[i] = Math.random() * 2 - 1;
        }
    }

    /// Feed forward all outputs into the next layer
    static feedForward(givenInputs, layer)
    {
        // Take given inputs and give to the the inputs of the layer
        for (let i = 0; i < layer.inputs.length; i++)
        {
            layer.inputs[i] = givenInputs[i];
        }

        // Iterate through outputs
        for (let i = 0; i < layer.outputs.length; i++)
        {
            let sum = 0;

            // Sum the total of inputs to each output node multiplied by the weight
            for (let j = 0; j < layer.inputs.length; j++)
            {
                sum += layer.inputs[j] * layer.weights[j][i];
            }

            // If this exceeds the bias, activate the node [1], else do not [0].
            if (sum > layer.biases[i])
            {
                layer.outputs[i] = 1;
            }
            else
            {
                layer.outputs[i] = 0;
            }
        }

        // Return the outputs
        return layer.outputs;
    }
}