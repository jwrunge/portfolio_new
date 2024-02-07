<script lang="ts">
    import { BInstance } from "../babylon/engine";
    import type { BScene } from "../babylon/scene";

    export let instance: BInstance | undefined = undefined;
    export let scene: BScene | undefined = undefined;
</script>

<slot {instance} {scene}></slot>