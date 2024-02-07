<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { BEngine } from "../babylon/engine";

    export let init: (( canvas: HTMLCanvasElement )=> void ) | undefined;
    export let onResize: (( canvas: HTMLCanvasElement )=> void ) | undefined;
    export let canvas: HTMLCanvasElement;
    export let engine: BEngine;

    function resizeHook() {
        onResize?.(canvas);
    }

    onMount(() => {
        init?.(canvas);
        canvas.addEventListener("resize", resizeHook);
        engine = new BEngine(canvas)
    });

    onDestroy(()=> {
        canvas.removeEventListener("resize", resizeHook);
    });
</script>

<canvas bind:this={canvas}></canvas>
<slot {engine}></slot>