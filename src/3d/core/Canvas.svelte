<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { BInstance } from "../babylon/engine";
    import { elementSettings, type ElementSettings } from "./util";

    export let canvas: HTMLCanvasElement | undefined = undefined;
    export let instance: BInstance | undefined = undefined;
    export let settings: ElementSettings = {};

    onMount(() => {
        instance = new BInstance(canvas);
    });

    onDestroy(()=> {
        for(let [_, scene] of instance?.scenes || []) {
            scene?.self?.dispose();
        }
        instance?.engine?.dispose();
    });
</script>

<canvas bind:this={canvas} use:elementSettings={settings}></canvas>
<slot {instance}></slot>