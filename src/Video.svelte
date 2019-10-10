<script> 
   let vidRef 

   let navAny = navigator;
   navigator.getUserMedia = navigator.getUserMedia ||
   navAny.webkitGetUserMedia || 
   navAny.mozGetUserMedia || 
   navAny.msGetUserMedia;

   if(navigator.getUserMedia){
      navigator.mediaDevices.getUserMedia({video:true})
      .then(stream=>{
         vidRef.srcObject = stream
      })
      .catch(e=>{
         console.log(e)
      })
   }

   function adjustWebcamSize(){
        let aspectRatio = video.width / video.height

        if(video.width >= video.height){
            this.video.width = aspectRatio * video.height
        }
        else if(video.height > video.width){
            this.video.height = video.height / aspectRatio
        }
    }

    window.onbeforeunload = () => {
       vidRef.stop()
    }
</script>

<style>
   #vid {
   grid-row-start:2;
   grid-column-start:2;
   margin: 0 auto;
   transform: scaleX(-1)
}
</style>


<video id="vid" 
      autoplay={true} 
      bind:this={vidRef}
      on:LoadedData={() => adjustWebcamSize()} 
      width ="224"
      height="224"/>