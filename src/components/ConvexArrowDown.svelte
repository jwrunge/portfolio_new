<script>
   export let isGray = false
</script>

<svg
   class='arrow-down'
   version="1.1"
   viewBox="0 0 300 100"
   height="100mm"
   width="300mm"
   preserveAspectRatio='none'>
  <path class:gray={isGray}
     d="M 1.1450559e-4,0 150.00026,83.45382 299.99988,0 Z"
     id="rect817"
   />
</svg>

<style>
   svg {
      transform: translateY(-0.5px);
      vertical-align: top;
      width: 100%;
      height: 5em;
   }

   #rect817 {
      opacity:1;
      fill:#03587c;
      fill-opacity:1;
      stroke:none;
   }

   #rect817.gray {
      fill: #EEEEEE;
   }

</style>