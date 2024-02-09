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

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.minZ = 0.1;
        var table: Mesh = MeshBuilder.CreateBox("table", { width: 63, height:23, depth: .2 }, scene);
        table.position.z = -15;
        let tableMaterial = new PBRMaterial("tableMaterial", scene);

        let woodTexturePack = {
            albedo: new Texture("/assets/tex/WoodFineDark003/WoodFineDark003_COL_2K.jpg", scene),
            emissive: new Texture("/assets/tex/WoodFineDark003/WoodFineDark003_GLOSS_2K.jpg", scene),
            bump: new Texture("/assets/tex/WoodFineDark003/WoodFineDark003_NRM_2K.jpg", scene),
            reflectance: new Texture("/assets/tex/WoodFineDark003/WoodFineDark003_REFL_2K.jpg", scene),
            displacement: new Texture("/assets/tex/WoodFineDark003/WoodFineDark003_DISP_2K.jpg", scene)
        }

        for(let t in woodTexturePack) {
            woodTexturePack[t as keyof typeof woodTexturePack].uScale = 5;
            woodTexturePack[t as keyof typeof woodTexturePack].vScale = 3;
        }

        tableMaterial.albedoTexture = woodTexturePack.albedo;
        tableMaterial.emissiveTexture = woodTexturePack.emissive;
        tableMaterial.bumpTexture = woodTexturePack.bump;
        tableMaterial.reflectanceTexture = woodTexturePack.reflectance;
        tableMaterial.metallic = 0;
        tableMaterial.roughness = 0.1;
        table.material = tableMaterial;

        // SceneLoader.ImportMesh("", "/assets/model/dell_xps_13_plus_closed/", "scene.gltf");
        SceneLoader.Append("/assets/model/apple_ipad_pro/", "scene.glb", scene, (scene) => {
            console.log(scene);
            console.log(scene.getMeshById("__root__"));
            if(scene.getMeshById("__root__") !== null) scene.getMeshById("__root__").position = new Vector3(0, 0, 0);
        });

        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

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
