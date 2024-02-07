<script lang="ts">
    import type { BEngine } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";
    import Canvas from "./Canvas.svelte";
    import Scene from "./Scene.svelte";

    export let init: (( canvas: HTMLCanvasElement )=> void ) | undefined;
    export let onResize: (( canvas: HTMLCanvasElement )=> void ) | undefined;
    export let canvas: HTMLCanvasElement;
    export let engine: BEngine;
    export let scene: BScene;
</script>

<Canvas {init} {onResize} bind:canvas bind:engine>
    <Scene {engine} bind:scene></Scene>
</Canvas>