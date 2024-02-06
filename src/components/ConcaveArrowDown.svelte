<script>
    export let isGray = false
</script>

<svg
    class='arrow-down'
    viewBox="0 0 300 100"
    height="100mm"
    width="300mm"
    preserveAspectRatio='none'>
    <g transform="translate(-1.1444091e-6,-197)">
        <path class:gray={isGray}
        id="rect815"
        d="m 0,205.52977 150,83.45374 150,-83.45374 V 297 H 0 Z"
        />
    </g>
</svg>

<style>
   svg {
      transform: translateY(0.75px);
      vertical-align: bottom;
      width: 100%;
      height: 5em;
   }

   #rect815 {
       opacity:1;
       fill:#0096d6;
       fill-opacity:1;
       stroke:none;
   }

   #rect815.gray {
       fill: #EEEEEE;
   }
</style>