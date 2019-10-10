import * as tf from "@tensorflow/tfjs"
import {loss} from "./stores.js"

export let truncMobileNet
let model;


/*
* Will Load the pre-trained mobilenet model.
* Our images will first go through this model before our model makes a prediction
*/
async function loadTruncatedMobileNet() {
    const mobilenet = await tf.loadLayersModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    // console.log(mobilenet.summary())

    // Return a model that outputs an internal activation.
    const layer = mobilenet.getLayer('conv_pw_13_relu');
    return tf.model({inputs: mobilenet.inputs, outputs: layer.output})
}

export function buildModel(){
    model = tf.sequential({layers:[ 
        tf.layers.flatten({inputShape: truncMobileNet.outputs[0].shape.slice(1)}),
        tf.layers.dense({units:128, activation:"relu",kernelInitializer: 'varianceScaling',useBias:true}),
        tf.layers.dense({units:32, activation:"relu"}),
        tf.layers.dense({units:4, activation:"softmax"})
    ]})
    
    model.compile({metrics:["accuracy"], 
                    loss:"categoricalCrossentropy", 
                    optimizer:"adam"})
    // console.log(model.summary())
}


export async function train_model(image,label){
    let xs = tf.stack(image)
    let ys = tf.oneHot(tf.tensor1d(label).toInt(),4)

    await  model.fit(xs,ys,{epochs:10,callbacks:{
        onBatchEnd: async  (batch, logs) =>{ 
            loss.set(logs.loss.toFixed(5))
        }
    }})
    tf.dispose(xs)
    tf.dispose(ys)
}


export function predict(img){
   return tf.tidy(() => {

       let embeddings = truncMobileNet.predict(img)
        const predictions = model.predict(embeddings);

        // console.log(predictions)
        return predictions.as1D().argMax();
    })
}


export async function init(){
    try{
        truncMobileNet = await loadTruncatedMobileNet()
        truncMobileNet.predict(tf.zeros([1,224,224,3]))
        buildModel()
    }
    catch{
        console.log("Error in init")
    }
}

init()