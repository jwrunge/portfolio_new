<script lang="ts">
    import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, PBRMaterial, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
    import { elementSettings, type ElementSettings } from "./util";
    import { onMount } from "svelte";
    import "@babylonjs/loaders/glTF";

    let canvas: HTMLCanvasElement;
    export let settings: ElementSettings = {};

    $: elementSettings(canvas, settings);

    class App {
    constructor() {
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        window.addEventListener("resize", () => {
            engine.resize();
        });

        scene.clearColor = new Color4(0,0,0,0);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 1, 0), scene);
        camera.target = new Vector3(0, 0, 0);
        camera.minZ = 0.1;
        camera.attachControl(canvas, true);

        // SceneLoader.ImportMesh("", "/assets/model/dell_xps_13_plus_closed/", "scene.gltf");
        SceneLoader.Append("/assets/model/", "desktop.glb", scene, (scene) => {
            const root = scene.getMeshById("__root__");
            if(root) root.position = new Vector3(0, 0, 0);
            root?.scaling.scaleInPlace(2);
        });

        // camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(5, 5, 0), scene);
        light1.intensity = 0.5;

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I2
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}

onMount(()=> new App());
</script>

<canvas bind:this={canvas}></canvas>

<style>
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
