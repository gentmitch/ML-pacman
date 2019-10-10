<script>
  import Video from "./Video.svelte";
  import Modal from "./Modal.svelte"
  import {tidy, browser, nextFrame,dispose,scalar} from "@tensorflow/tfjs";
  import { truncMobileNet, train_model, predict } from "./model.js";
  import { onMount } from "svelte";
  import {longpress} from "./actions.js"
  import {guess, loss, playing} from "./stores.js"
  import {initGame} from "./Game.svelte"
  import Game from "./Game.svelte"
  import {fly, draw } from 'svelte/transition';

  let modalOpen = false
  let training_images = [];
  let training_labels = [];

  let bindings = { up: 0, right: 1, down: 2, left: 3 };
  let count = { "up": 0, "down": 0, "left": 0, "right": 0 };
  let vid;

  onMount(async () => {
    vid = document.getElementById("vid");
    return () => {
      vid.stop();
    };
    modalOpen = true
  });

  function addImage(label) {
    let img = takePhoto();
    img = truncMobileNet.predict(img);
    img = img.reshape([7, 7, 256]);

    training_images = [...training_images, img];
    training_labels = [...training_labels, bindings[label]];

    // console.log(training_images);
    // console.log(training_labels);
    img.dispose();
    count[label]++;
  }

  function takePhoto() {
    let vid = document.getElementById("vid");

    return tidy(() => {
      let data = browser.fromPixels(vid);
      data = cropImage(data);

      data = data.expandDims(0);
      data
        .toFloat()
        .div(scalar(127))
        .sub(scalar(1));

      return data;
    });
  }

  function cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - size / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - size / 2;
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  async function playGame(){
      playing.set(true)
      while($playing){
        try{
          let p = takePhoto()
          let predictions = predict(p)
          let g = (await predictions.data())[0]
          guess.set(g)
          predictions.dispose()
        }
        catch (error){
          console.log(error)
        }
        await nextFrame()
    }
  }

  function train() {
    if(training_images.length !== 0){
      train_model(training_images, training_labels)
    }
    else{
      alert("No Training Data")
    }
  }
</script>

<style>
 *{
   font-family:"Lucida Sans Unicode", "Lucida Grande", sans-serif;
 }
  .page{
    height:100%;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 100%;
    background:black;
    padding:15px;
  }

  .video-controls{
    display:grid;
    grid-template-rows: 80px 270px 80px 100px;
    grid-template-columns: 100px 270px 100px ;
    align-items: center;
  }
  .controls{
    display:grid;
    grid-template-rows: 100%;
    grid-template-columns: 50% 50%;

    grid-row-start: 4;
    grid-column-end: 3;
  }

  button{
    font-size: 1.2vw;
    width: 100px;
    height:60px;
    margin: 0 auto;
    cursor:pointer;
    white-space:nowrap;
  }

  .active{
    background: blue;
    transition: background .3s 
  }

  #up{
    grid-row-start: 1;
    grid-column-start:2;
  }
  #right {
    grid-row-start: 2;
    grid-column-start:3;
  }
  #down {
    grid-row-start: 3;
    grid-column-start:2;
  }
  #left {
    grid-row-start: 2;
    grid-column-start:1;
  }
</style>

<svelte:head>
  <link href="/node_modules/@fortawesome/fontawesome-free/css/solid.css" rel="stylesheet">
</svelte:head>


{#if modalOpen}
  <Modal
   on:close='{()=> modalOpen = false}'></Modal>
{/if}

<div class="page">
  <div class = "video-controls">
    <Video/>

    {#each Object.entries(bindings) as [id, value]}
      <button id="{id}" 
              use:longpress on:longpress="{() => addImage(id)}" 
              on:click="{() => addImage(id)}"
              class="{($guess === value) && $playing ? "active": ""}"
              >
        {id.toUpperCase()}: {count[id]}
      </button>
    {/each}

    <div class="controls">
      <button on:click="{()=> {$playing ? playing.set(false): playGame()}}">
        {#if $playing}
          <i class="fas fa-play"></i>
        {:else}
           <i class="fas fa-pause"></i>
        {/if}
      </button>
      <button on:click="{() => train()}">
        Train
      </button>
    </div>

    <div style="grid-row-start:4; grid-column-start: 3;">
      <label style="color:white;"> Loss: {$loss}</label>
      <label style="color:white;"> Guess: {$guess}</label>
    </div>
  </div>

  <div class="info">
    <Game/>
  </div>
</div>
