import { Engine, Scene } from "@babylonjs/core";

export class BEngine {
    self: Engine;
    canvas: HTMLCanvasElement;
    scenes: Map<string, Scene> = new Map();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.self = new Engine(canvas, true);

        this.self.runRenderLoop(() => {
            this.scenes.forEach((scene) => {
                if(scene.active) scene.render();
            });
        });
    }

    getScene(id: string) {
        return this.scenes.get(id);
    }

    registerScene(id: string, scene: Scene) {
        this.scenes.set(id, scene);
    }

    removeScene(id: string) {
        this.scenes.get(id)?.dispose();
        this.scenes.delete(id);
    }
}
