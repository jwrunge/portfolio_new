import { Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder } from "@babylonjs/core";
import { BInstance } from "./engine";

export class BScene {
    id: string;
    self?: Scene;
    instance?: BInstance;
    active: boolean;
    
    constructor(id: string, instance?: BInstance, active = true) {
        this.id = id;
        this.instance = instance;
        this.active = active;

        if(!instance?.engine) {
            alert("instance not found!");
            return;
        }
        this.self = new Scene(instance?.engine);

        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), this.self);
        camera.attachControl(instance.getCanvas("default"), true);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.self);
        const box = MeshBuilder.CreateBox("box", { size: 1 }, this.self);

        this.instance?.registerScene(id, this);
        console.log(this.self, this.instance?.canvases, this.instance?.scenes);
    }
}