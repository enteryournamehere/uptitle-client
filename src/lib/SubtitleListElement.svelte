<script lang="ts">
    import type SubtitleInfo from "./SubtitleInfo";
    import { millisecondsToTimestamp } from "./utils";

    export let info: SubtitleInfo;

    $: startTimestamp = millisecondsToTimestamp(info.start);
    $: endTimestamp = millisecondsToTimestamp(info.end);

    import { getContext } from "svelte";
    const { refresh } = getContext("app");
</script>

<div class="outer">
    <div class="left-part">
        <span>{startTimestamp}</span>
        <br />
        <span>{endTimestamp}</span>
    </div>
    <div class="right-part">
        <input type="text" bind:value={info.text} on:input={refresh} />
    </div>
    <div class="menu-button">
        <button>menu</button>
    </div>
</div>

<style lang="sass">
    .outer
        display: flex
        margin: 0px

        > div
            padding: 5px

    .left-part
        flex-basis: 50px
        background: lightgrey
        text-align: left

    .right-part
        flex: 1
        text-align: left
        padding:10px

</style>
