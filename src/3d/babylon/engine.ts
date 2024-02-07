import { Engine, type EngineOptions } from "@babylonjs/core";
import type { BScene } from "./scene";

export class BInstance {
    engine: Engine;
    canvases: Map<string, HTMLCanvasElement> = new Map();
    scenes: Map<string, BScene> = new Map();
    antialias = true;
    options?: EngineOptions;
    adaptToDeviceRatio = true;

    constructor(
        canvases?: HTMLCanvasElement | {[key: string]: HTMLCanvasElement},
        antialias = true,
        options?: EngineOptions,
        adaptToDeviceRatio = true,
    ) {
        if(canvases instanceof HTMLCanvasElement) {
            this.canvases.set("default", canvases);
        }
        else if(canvases instanceof Map) {
            for(let [key, value] of canvases) {
                this.canvases.set(key, value);
            }
        }

        this.engine = new Engine(null, antialias, options, adaptToDeviceRatio);

        this.engine.runRenderLoop(() => {
            this.scenes.forEach((scene) => {
                if(scene.active) scene.self?.render();
            });
        });
    }

    getCanvas(id: string) {
        return this.canvases.get(id);
    }

    registerCanvas(id: string, canvas: HTMLCanvasElement) {
        this.canvases.set(id, canvas);
    }

    removeCanvas(id: string) {
        this.canvases.delete(id);
    }

    getScene(id: string) {
        return this.scenes.get(id);
    }

    registerScene(id: string, scene: BScene) {
        this.scenes.set(id, scene);
    }

    removeScene(id: string) {
        this.scenes.get(id)?.self?.dispose();
        this.scenes.delete(id);
    }
}
