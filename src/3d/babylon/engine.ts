import { Engine, Scene } from "@babylonjs/core";
import type { BScene } from "./scene";

export class BEngine {
    self: Engine;
    canvas: HTMLCanvasElement;
    scenes: Map<string, BScene> = new Map();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.self = new Engine(canvas, true);

        this.self.runRenderLoop(() => {
            this.scenes.forEach((scene) => {
                if(scene.active) scene.self?.render();
            });
        });
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
