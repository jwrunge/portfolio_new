import { Scene } from "@babylonjs/core";
import { BEngine } from "./engine";

export class BScene {
    id: string;
    self: Scene;
    engine: BEngine;
    active: boolean;
    
    constructor(id: string, engine: BEngine, active = true) {
        this.id = id;
        this.engine = engine;
        this.self = new Scene(engine.self);
        this.active = active;

        this.engine.registerScene(id, this);
    }
}