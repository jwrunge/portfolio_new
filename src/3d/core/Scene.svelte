<script lang="ts">
    import { BEngine } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";

    export let engine: BEngine | undefined = undefined;
    export let scene: BScene | undefined = undefined;
</script>

<slot {engine} {scene}></slot>