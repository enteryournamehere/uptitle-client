<script lang="ts">
    export let playing;
    export let projectInfo;

    import { createEventDispatcher } from "svelte";

    import IconButton, {Icon} from "@smui/icon-button"
    import Slider from "@smui/slider"

    const dispatch = createEventDispatcher();

    function playBtnClick() {
        if (playing) {
            dispatch("pause");
        } else {
            dispatch("play");
        }
    }

    function dispatchSeek() {
        const secs = slider_value * projectInfo.video.duration / 1000;
        dispatch("seek", {
            seconds: secs,
            allowSeekAhead: true
        });
    }

    export function seekTo(seconds) {
        slider_value = seconds / (projectInfo.video.duration / 1000)
    }

    let slider_value = 0;
</script>

<div id="player-controls">
    <IconButton style="color: white" on:click={playBtnClick} toggle color="secondary" pressed={playing}>
        <Icon class="material-icons" on>pause</Icon>
        <Icon class="material-icons">play_arrow</Icon>
    </IconButton>
    <Slider 
        style="flex-grow: 1"
        id="player-progress"
        max={1}
        step={0.001}
        bind:value={slider_value} 
        on:SMUISlider:input={dispatchSeek}
    />
</div>

<style lang="sass">
    @use "../colors"

    #player-controls
        height: 40px
        width: 640px
        background: black
        display: flex
        justify-content: space-between
        align-items: center
</style>
