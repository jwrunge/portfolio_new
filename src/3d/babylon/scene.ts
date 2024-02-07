import { Scene } from "@babylonjs/core";
import { BEngine } from "./engine";

export class BScene {
    id: string;
    self?: Scene;
    engine: BEngine;
    active: boolean;
    
    constructor(id: string, engine: BEngine, active = true) {
        this.id = id;
        this.engine = engine;
        this.active = active;

        if(!engine.self) {
            alert("Engine not found!");
            return;
        }
        this.self = new Scene(engine?.self);

        this.engine.registerScene(id, this);
    }
}