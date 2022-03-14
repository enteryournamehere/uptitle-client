<script lang="ts">
    import type SubtitleInfo from "./SubtitleInfo";
    import { millisecondsToTimestamp } from "../utils";

    export let info: SubtitleInfo;

    $: startTimestamp = millisecondsToTimestamp(info.start);
    $: endTimestamp = millisecondsToTimestamp(info.end);

    import { getContext } from "svelte";
    const { refresh, uploadSubtitleEdit } = getContext("app");

    function setFocus(value: boolean) {
        info.focus = value;
        refresh();
    }
</script>

<div class="outer" class:focused={info.focus}>
    <div class="left-part">
        <span>{startTimestamp}</span>
        <br />
        <span>{endTimestamp}</span>
    </div>
    <div class="right-part">
        <textarea
            type="text"
            on:focusin={() => setFocus(true)}
            on:focusout={() => setFocus(false)}
            bind:value={info.text}
            on:input={refresh}
            on:change={uploadSubtitleEdit(info)}
        />
    </div>
    <div class="menu-button">
        <button>menu</button>
    </div>
</div>

<style lang="sass">
    @use "../fonts"
    @use "../colors"

    .outer
        display: flex
        margin: 0px
        
        &:not(:last-child)
            border-bottom: 1px solid #eee

        &.focused
            outline: 2px solid colors.$main
            outline-offset: -2px

        > div
            padding: 5px

    .left-part
        flex-basis: 50px
        background: #eee
        text-align: left

    .right-part
        flex: 1
        text-align: left
        padding:10px

        > textarea
            width: 100%
            height: 80%
            border: none
            resize: none
            font-family: fonts.$main
            outline: none

</style>
