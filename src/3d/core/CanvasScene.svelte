<script lang="ts">
    import type { BEngine } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";
    import Canvas from "./Canvas.svelte";
    import Scene from "./Scene.svelte";

    export let init: (( canvas?: HTMLCanvasElement )=> void ) | undefined = undefined;
    export let onResize: (( canvas?: HTMLCanvasElement )=> void ) | undefined = undefined;
    export let canvas: HTMLCanvasElement | undefined = undefined;
    export let engine: BEngine | undefined = undefined;
    export let scene: BScene | undefined = undefined;
</script>

<Canvas {init} {onResize} bind:canvas bind:engine>
    <Scene {engine} bind:scene></Scene>
</Canvas>