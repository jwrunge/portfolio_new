<script lang="ts">
    import { BEngine } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";

    export let engine: BEngine;
    export let scene: BScene;
</script>

<slot {engine} {scene}></slot>