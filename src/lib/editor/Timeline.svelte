<script lang="ts">
    import { millisecondsToTimestamp } from "../utils";

    import type SubtitleInfo from "./SubtitleInfo";
    import TimelineElement from "./TimelineElement.svelte";

    import { getContext, onMount, createEventDispatcher } from "svelte";

    import WaveformData from "waveform-data";

    const { getSettings } = getContext("app");
    const dispatch = createEventDispatcher();

    export let subtitles: SubtitleInfo[] = [];

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

    let waveformData;

    function load() {
        end_element = {
            start: projectInfo.video.duration,
            end: projectInfo.video.duration,
            text: "",
        };
        timeline_width = projectInfo.video.duration * getSettings().zoom;
        fetch("/api/waveform/" + projectInfo.video.id)
            .then((data) => data.arrayBuffer())
            .then((data) => {
                if (data.byteLength > 0)
                    waveformData = WaveformData.create(data);
                loaded = true;
                console.log("load: mounted =", mounted);
                if (mounted) {
                    setupCanvas();
                    drawCanvas();
                }
            });
    }

    onMount(() => {
        mounted = true;
        console.log("mount: loaded =", loaded);
        if (loaded) {
            setupCanvas();
            drawCanvas();
        }
    });

    let elements = {} as { [key: number]: TimelineElement };

    // Drag/scroll handling
    let dragging: boolean = false;
    let offset_from_left = 0;

    function moveTimeline(diff) {
        offset_from_left += diff;
        offset_from_left = Math.min(offset_from_left, 0);
        offset_from_left = Math.max(offset_from_left, -timeline_width);
        offset_from_left = Math.floor(offset_from_left);

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
        offset_from_left = Math.floor(offset_from_left);

        drawCanvas();
    }

    function onMouseMove(e) {
        if (dragging) {
            moveTimeline(e.movementX);
            dispatchSeek();
        } else {
            for (let element of Object.values(elements)) {
                if (!element) continue;
                element.onMouseMove(e);
            }
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
        for (let element of Object.values(elements)) {
            if (!element) continue;
            element.onMouseUp(e);
        }
    }

    function onMouseDown(e) {
        dragging = true;
    }

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    function setupCanvas() {
        canvas = document.getElementById(
            "timeline-canvas"
        ) as HTMLCanvasElement;

        canvas.width = document.body.scrollWidth;
        canvas.style.width = document.body.scrollWidth + "px";
        ctx = canvas.getContext("2d");

        if (waveformData)
            waveformData = waveformData.resample({
                scale: waveformData.scale * (0.4 / getSettings().zoom),
            });
    }

    function drawCanvas() {
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";

        let markingsY = 40;
        let waveformHeight = 60;
        const visible_width = document.body.scrollWidth;

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // calcualte drawing area
        let start = px_to_ms(0);
        let end = px_to_ms(
            Math.ceil(
                Math.min(
                    visible_width,
                    timeline_width + offset_from_left + visible_width / 2
                )
            )
        );
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
                    markingsY - 5
                );
            } else if (ms % 500 == 0) {
                ctx.beginPath();
                ctx.moveTo(ms_to_px(ms), (markingsY / 4) * 2);
                ctx.lineTo(ms_to_px(ms), markingsY);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(ms_to_px(ms), (markingsY / 4) * 3);
                ctx.lineTo(ms_to_px(ms), markingsY);
                ctx.stroke();
            }
        }

        // Waveform
        if (!waveformData) return;
        const channel = waveformData.channel(0);

        ctx.moveTo(
            document.body.scrollWidth / 2 + offset_from_left,
            markingsY + waveformHeight / 2
        );
        // offset_from_left is a negative number.
        // this we use to find out where to read the waveform.
        start = Math.floor(Math.max(0, offset_from_left + visible_width / 2));
        end = Math.ceil(
            Math.min(
                visible_width,
                timeline_width + offset_from_left + visible_width / 2
            )
        );

        // draw lower half
        for (let x = start; x <= end; x++) {
            const waveform_pixel = x - offset_from_left - visible_width / 2;
            if (waveform_pixel >= waveformData.length) continue;
            const val = channel.max_sample(waveform_pixel);
            ctx.lineTo(
                x,
                markingsY + waveformHeight / 2 + (val / 256) * waveformHeight
            );
        }

        // draw upper half
        for (let x = end; x >= start; x--) {
            const waveform_pixel = x - offset_from_left - visible_width / 2;
            if (waveform_pixel >= waveformData.length) continue;
            const val = -channel.max_sample(waveform_pixel);
            ctx.lineTo(
                x,
                markingsY + waveformHeight / 2 + (val / 256) * waveformHeight
            );
        }

        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    function ms_to_px(ms) {
        return (
            document.body.scrollWidth / 2 +
            offset_from_left +
            ms * getSettings().zoom
        );
    }

    function px_to_ms(px) {
        return (
            (px - document.body.scrollWidth / 2 - offset_from_left) /
            getSettings().zoom
        );
    }
</script>

<div
    id="timeline-area"
    on:mouseup={onMouseUp}
    on:mousemove={onMouseMove}
    on:mouseleave={onMouseUp}
    on:wheel={onScrollWheel}
>
    <div id="timeline-overlay" />
    <canvas id="timeline-canvas" on:mousedown={onMouseDown} height="100" />
    <div
        id="timeline-container"
        style="width: {timeline_width}px; left: calc(50% + {offset_from_left}px);"
    >
        <div id="timeline-subtitles">
            {#each subtitles as subtitle, i (subtitle)}
                <TimelineElement
                    bind:this={elements[subtitle.id]}
                    info={subtitle}
                    prev_sibling={i > 0 ? subtitles[i - 1] : start_element}
                    next_sibling={i < subtitles.length - 1
                        ? subtitles[i + 1]
                        : end_element}
                />
            {/each}
        </div>
    </div>
</div>

<style lang="sass">
    $total-height: 160px

    #timeline-container
        background: #333
        overflow: auto
        position: relative
        height: $total-height

    #timeline-subtitles
        z-index: 2
        padding-top: 10px

    #timeline-canvas
        position: absolute
        left: 0
        z-index: 1
        margin-top: 50px

        height: 100px
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
        z-index: 3

</style>
