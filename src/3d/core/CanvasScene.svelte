<script lang="ts">
    import type { BInstance } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";
    import Canvas from "./Canvas.svelte";
    import Scene from "./Scene.svelte";
    import type { ElementSettings } from "./util";

    export let canvas: HTMLCanvasElement | undefined = undefined;
    export let instance: BInstance | undefined = undefined;
    export let scene: BScene | undefined = undefined;
    export let settings: ElementSettings = {};
</script>

<Canvas settings={settings} bind:canvas bind:instance>
    <Scene {instance} bind:scene></Scene>
</Canvas>