<script>
    import { T, useTask, useThrelte } from '@threlte/core';
    import { interactivity } from "@threlte/extras";
    import { spring, tweened } from "svelte/motion";

    const { mainStage, renderStage } = useThrelte();

    interactivity();
    const scale = spring(1);
    const rotAround = spring(1);

    let rotation = 0;
    let deltaFactor = tweened(1);

    useTask(delta=> rotation += (delta * $deltaFactor));
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.DirectionalLight position={[20, 10, 0]} castShadow />

<T.Mesh 
    position.y={1}
    scale={$scale}
    rotation.y={rotation + ($rotAround * 5)}
    castShadow

    on:pointerenter={()=> { 
        $scale = 1.5; 
        $rotAround += .5;
        $deltaFactor = 0.2;
    }}
    on:pointerleave={()=> { 
        $scale = 1;
        $rotAround += .5;
        setTimeout(()=> $deltaFactor = 1, 300);
    }}
>
    <T.BoxGeometry args={[1, 2, 1]} />
    <T.MeshStandardMaterial color="#3283a8" />
</T.Mesh>

<T.Mesh
    rotation.x={-Math.PI / 2}
    receiveShadow
>
    <T.CircleGeometry args={[6, 40]} />
    <T.MeshStandardMaterial color="gray" />
</T.Mesh>