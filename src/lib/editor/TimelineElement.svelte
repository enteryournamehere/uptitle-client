<script lang="ts">
    import type SubtitleInfo from "./SubtitleInfo";
    export let info: SubtitleInfo;
    export let prev_sibling: SubtitleInfo;
    export let next_sibling: SubtitleInfo;

    import { getContext } from "svelte";
    const { refresh, getSettings, uploadSubtitleEdit } = getContext("app");

    const zoom: number = getSettings().zoom;

    let init_x: number = 0;

    $: init_start = info.start * zoom;
    $: init_end = info.end * zoom;

    enum DragState {
        Start,
        Main,
        End,
        None,
    }

    let drag_state: DragState = DragState.None;

    function onMouseDown(e) {
        init_x = e.clientX;
        if (e.target.classList.contains("left")) {
            drag_state = DragState.Start;
        } else if (e.target.classList.contains("right")) {
            drag_state = DragState.End;
        } else {
            drag_state = DragState.Main;
        }
    }

    export function onMouseUp(e) {
        if (drag_state == DragState.None) {
            return;
        }
        drag_state = DragState.None;
        init_start = info.start * zoom;
        init_end = info.end * zoom;

        uploadSubtitleEdit(info)

        refresh();
    }

    export function onMouseMove(e) {
        if (drag_state != DragState.None) {
            let delta = e.clientX - init_x;

            // Restrict movement to sibling edges
            if (delta < 0 && drag_state != DragState.End)
                delta = Math.max(delta, prev_sibling.end * zoom - init_start);
            // Max because the values are negative
            else if (drag_state != DragState.Start)
                delta = Math.min(delta, next_sibling.start * zoom - init_end);

            // Don't allow moving start handle past end handle
            if (delta > 0 && drag_state == DragState.Start)
                delta = Math.min(delta, init_end - init_start - 30);
            // ... or vice versa
            if (delta < 0 && drag_state == DragState.End)
                delta = Math.max(delta, init_start - init_end + 30);

            switch (drag_state) {
                case DragState.Main:
                    info.start = (init_start + delta) / zoom;
                    info.end = (init_end + delta) / zoom;
                    break;
                case DragState.Start:
                    info.start = (init_start + delta) / zoom;
                    break;
                case DragState.End:
                    info.end = (init_end + delta) / zoom;
                    break;
            }
        }
    }
</script>

<div
    class="timeline-subtitle"
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:mousemove={onMouseMove}
    draggable="false"
    style="left: {info.start * zoom}px; width: {info.end * zoom -
        info.start * zoom}px"
>
    <div class="handle left" draggable="false" />
    <span class="text">{info.text}</span>
    <div class="handle right" draggable="false" />
</div>

<style lang="sass">
    @use "../colors"

    .timeline-subtitle
        background: #eee
        color: black

        position: sticky
        display: inline-flex
        justify-content: space-between
        cursor: grab
        &:active
            cursor: grabbing
        height: 40px

        border-radius: 5px
        overflow: hidden
    
    .handle
        background: colors.$main

        &:hover
            background: colors.$main-lighter
        
        flex: 0 0 10px
        &.left
            cursor: w-resize
        
        &.right
            cursor: e-resize

    .text
        // aligned centre-left, max 2 lines, cut off with ellipsis
        display: -webkit-box
        overflow: hidden
        -webkit-line-clamp: 2
        -webkit-box-orient: vertical
        text-align: left
        align-self: center
        user-select: none
        flex: 1
        padding: 0px 5px
        white-space: pre-line
</style>
