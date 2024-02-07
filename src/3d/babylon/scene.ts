import { Scene } from "@babylonjs/core";
import { BInstance } from "./engine";

export class BScene {
    id: string;
    self?: Scene;
    instance: BInstance;
    active: boolean;
    
    constructor(id: string, instance: BInstance, active = true) {
        this.id = id;
        this.instance = instance;
        this.active = active;

        if(!instance.engine) {
            alert("instance not found!");
            return;
        }
        this.self = new Scene(instance?.engine);

        this.instance.registerScene(id, this);
    }
}