
<script>
   import { createEventDispatcher } from 'svelte';
   import { fly } from 'svelte/transition';
   
   var msg = `Control pacman with your camera. <br>
               <strong>1.</strong> Choose images for each direction<br>
               <strong>2.</strong> Train the model <br>
               <strong>3.</strong> Click play and recreate those images to control the pacman<br><br>
               Tips: Click and hold to add alot of images. The more distinct the images the easier it is to
               control the pacman`

	const dispatch = createEventDispatcher();
</script>

<style>
   .modal{
      position: absolute;
      width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
      top:50%;
      left: 50%;
      background: white;
      color: black;
      border-radius:5px;
      padding:1em;
      transform: translate(-50%,-50%);
   }

   .backdrop{
      top: 0;
		left: 0;
      position: fixed;
      width:100%;
      height:100%;
      background: #22222285;
   }

   h1 {
      text-align:center;
   }
</style>

<div class="backdrop"  on:click="{()=> dispatch("close")}"></div>
<div class="modal" transition:fly="{{ y: 200, duration: 1200 }}">
   <h1>Welcome!</h1>
   <p class="msg-modal">{@html msg}</p>
</div>