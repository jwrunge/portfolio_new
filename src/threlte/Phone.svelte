<script>
    import { T } from '@threlte/core';
    import { interactivity } from "@threlte/extras";
    import { spring, tweened } from "svelte/motion";

    interactivity();
    const scale = spring(1);
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.Mesh 
    position.y={1}
    scale={$scale}
    rotation.y={$scale * 5}

    on:pointerenter={()=> { $scale = 1.5; }}
    on:pointerleave={()=> { $scale = 1; }}
>
    <T.BoxGeometry args={[1, 2, 1]} />
    <T.MeshBasicMaterial color="purple" />
</T.Mesh>