<script lang="ts">
    import { millisecondsToTimestamp } from "../utils";

    import type SubtitleInfo from "./SubtitleInfo";
    import TimelineElement from "./TimelineElement.svelte";

    import { getContext, onMount, createEventDispatcher } from "svelte";
    const { getSettings } = getContext("app");
    const dispatch = createEventDispatcher();

    let subtitles: SubtitleInfo[] = [];

    export let playing = false;

    export let projectInfo = undefined;

    let start_element: SubtitleInfo = {
        start: 0,
        end: 0,
        text: "",
    };

    let end_element: SubtitleInfo = {
        start: 0,
        end: 0,
        text: "",
    };

    $: projectInfo && load();

    let timeline_width = 0;

    let loaded = false;
    let mounted = false;

    function load() {
        subtitles = projectInfo.subtitles;
        end_element = {
            start: projectInfo.video.duration,
            end: projectInfo.video.duration,
            text: "",
        }
        timeline_width = projectInfo.video.duration * getSettings().zoom;
        loaded = true;
        console.log('load: mounted =', mounted);
        if (mounted) {
            setupCanvas();
            drawCanvas();
        }
    }

    onMount(() => {
        mounted = true;
        console.log('mount: loaded =', loaded);
        if (loaded) {
            setupCanvas();
            drawCanvas();
        }
    });

    let elements = [];

    // Drag/scroll handling
    let dragging: boolean = false;
    let offset_from_left = 0;

    function moveTimeline(diff) {
        offset_from_left += diff;
        offset_from_left = Math.min(offset_from_left, 0);
        offset_from_left = Math.max(offset_from_left, -timeline_width);

        drawCanvas();
    }

    function dispatchSeek(allowSeekAhead = false) {
        let secs = -offset_from_left / getSettings().zoom / 1000;

        dispatch("seek", {
            seconds: secs,
            allowSeekAhead,
        });
    }

    export function seekTo(seconds: number) {
        offset_from_left = -seconds * getSettings().zoom * 1000;
        offset_from_left = Math.min(offset_from_left, 0);
        offset_from_left = Math.max(offset_from_left, -timeline_width);
        
        drawCanvas();
    }

    function onMouseMove(e) {
        if (dragging) {
            moveTimeline(e.movementX);
            dispatchSeek();
        } else {
            for (let element of elements) element.onMouseMove(e);
        }
    }

    function onScrollWheel(e) {
        e.preventDefault();
        moveTimeline(-e.deltaY);

        dispatchSeek(true);
    }

    function onMouseUp(e) {
        if (dragging) {
            dragging = false;
            dispatchSeek(true);
        }
        for (let element of elements) element.onMouseUp(e);
    }

    function onMouseDown(e) {
        dragging = true;
    }

    function setupCanvas() {
        let canvas: HTMLCanvasElement = document.getElementById(
            "timeline-canvas"
        ) as HTMLCanvasElement;

        canvas.width = document.body.scrollWidth
        canvas.style.width = document.body.scrollWidth + "px";
    }

    function drawCanvas() {
        let canvas: HTMLCanvasElement = document.getElementById(
            "timeline-canvas"
        ) as HTMLCanvasElement;
        
        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // calcualte drawing area
        let start = px_to_ms(0);
        let end = px_to_ms(canvas.width);
        // start at multiple of 250
        start = Math.floor(start / 250) * 250;
        end = Math.ceil(end / 250) * 250;

        for (let ms = start; ms < end; ms += 250) {
            if (ms <= 0) continue;
            if (ms % 1000 == 0) {
                // Write time
                ctx.fillStyle = "#ccc";
                ctx.font = "12px Arial";
                ctx.fillText(
                    millisecondsToTimestamp(ms, false),
                    ms_to_px(ms),
                    canvas.height - 5
                );
            } else if (ms % 500 == 0) {
                ctx.beginPath();
                ctx.moveTo(ms_to_px(ms), (canvas.height / 4) * 2);
                ctx.lineTo(ms_to_px(ms), canvas.height);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(ms_to_px(ms), (canvas.height / 4) * 3);
                ctx.lineTo(ms_to_px(ms), canvas.height);
                ctx.stroke();
            }
        }
    }

    function ms_to_px(ms) {
        return document.body.scrollWidth / 2 + offset_from_left + ms * getSettings().zoom;
    }

    function px_to_ms(px) {
        return (px - document.body.scrollWidth / 2 - offset_from_left) / getSettings().zoom;
    }

</script>

<div id="timeline-area">
    <div id="timeline-overlay" />
    <div
        id="timeline-container"
        on:mouseup={onMouseUp}
        on:mousemove={onMouseMove}
        on:mouseleave={onMouseUp}
        on:wheel={onScrollWheel}
        style="width: {timeline_width}px; left: calc(50% + {offset_from_left}px); transition: {playing
            ? 'left 25ms linear'
            : 'none'}"
    >
        <div id="timeline-subtitles">
            {#each subtitles as subtitle, i}
                <TimelineElement
                    bind:this={elements[i]}
                    info={subtitle}
                    prev_sibling={i > 0 ? subtitles[i - 1] : start_element}
                    next_sibling={i < subtitles.length - 1
                        ? subtitles[i + 1]
                        : end_element}
                />
            {/each}
        </div>
        <canvas
            id="timeline-canvas"
            on:mousedown={onMouseDown}
            height="40"
        />
    </div>
</div>

<style lang="sass">
    $total-height: 100px

    #timeline-container
        background: #333
        overflow: auto
        position: relative
        height: $total-height

    #timeline-subtitles
        padding-top: 10px

    #timeline-canvas
        position: fixed
        left: 0

        height: 40px
        cursor: grab
        &:active
            cursor: grabbing

    #timeline-overlay
        position: absolute
        display: block
        left: 50%
        background: red
        width: 1px
        height: $total-height
        z-index: 1

</style>
