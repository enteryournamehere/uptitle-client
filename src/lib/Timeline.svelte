<script lang="ts">
    import { millisecondsToTimestamp } from "./utils";

    import type SubtitleInfo from "./SubtitleInfo";
    import TimelineElement from "./TimelineElement.svelte";

    import { getContext, onMount, createEventDispatcher } from "svelte";
    const { getVideo, getSettings } = getContext("app");
    const dispatch = createEventDispatcher();

    export let subtitles: SubtitleInfo[];

    export let playing = false;

    let start_element: SubtitleInfo = {
        start: 0,
        end: 0,
        text: "",
    };

    let end_element: SubtitleInfo = {
        start: getVideo().duration,
        end: getVideo().duration,
        text: "",
    };

    let timeline_width = getVideo().duration * getSettings().zoom;

    let elements = [];

    // Drag/scroll handling
    let dragging: boolean = false;
    let offset_from_left = 0;

    function moveTimeline(diff) {
        offset_from_left += diff;
        offset_from_left = Math.min(offset_from_left, 0);
        offset_from_left = Math.max(offset_from_left, -timeline_width);
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

    // Draw timeline
    onMount(() => {
        drawCanvas();
    });

    function drawCanvas() {
        let canvas: HTMLCanvasElement = document.getElementById(
            "timeline-canvas"
        ) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d");
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";

        for (let ms = 250; ms < getVideo().duration; ms += 250) {
            if (ms % 1000 == 0) {
                // Write time
                ctx.fillStyle = "#ccc";
                ctx.font = "12px Arial";
                ctx.fillText(
                    millisecondsToTimestamp(ms, false),
                    ms * getSettings().zoom,
                    canvas.height - 5
                );
            } else if (ms % 500 == 0) {
                ctx.beginPath();
                ctx.moveTo(ms * getSettings().zoom, (canvas.height / 4) * 2);
                ctx.lineTo(ms * getSettings().zoom, canvas.height);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(ms * getSettings().zoom, (canvas.height / 4) * 3);
                ctx.lineTo(ms * getSettings().zoom, canvas.height);
                ctx.stroke();
            }
        }
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
            width={timeline_width}
            height="40"
            style="width: {timeline_width}px"
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
