<script lang="ts">
    export let playing;
    export let projectInfo;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function playBtnClick() {
        if (playing) {
            dispatch("pause");
        } else {
            dispatch("play");
        }
    }

    function dispatchSeek(e) {
        const relative = parseInt(e.target.value) / 100;
        const secs = relative * projectInfo.video.duration / 1000;
        dispatch("seek", {
            seconds: secs,
            allowSeekAhead: true
        });
    }

    export function seekTo(seconds) {
        const value = (seconds / (projectInfo.video.duration / 1000) * 100)
        const rangeInput = document.getElementById("player-progress") as HTMLInputElement;
        rangeInput.value = value.toString()
    }
</script>

<div id="player-controls">
    <button id="play-button" on:click={playBtnClick}>{playing ? "||" : ">"}</button>
    <input
        type="range"
        min="0"
        max="100"
        value="0"
        step="1"
        id="player-progress"
        on:input={dispatchSeek}
    />
    <span />
</div>

<style lang="sass">
    @use "../colors"

    #player-controls
        height: 40px
        width: 640px
        background: black
        display: flex
        justify-content: space-between

        #play-button
            height: 40px
            width: 40px
            background: colors.$main
            border: none
            outline: none
            cursor: pointer
            color: white
            font-weight: bold

        #player-progress
            width: 80%
            height: 100%
            background: colors.$main
            cursor: pointer
            outline: none
</style>
