<script lang="ts">
    import type SubtitleInfo from "./SubtitleInfo";
    import { millisecondsToTimestamp } from "../utils";

    import IconButton from "@smui/icon-button";
    import type { MenuComponentDev } from "@smui/menu";
    import Menu from "@smui/menu";
    import List, { Item, Separator, Text, Graphic } from "@smui/list";

    export let info: SubtitleInfo;
    let menu: MenuComponentDev;

    $: startTimestamp = millisecondsToTimestamp(info.start);
    $: endTimestamp = millisecondsToTimestamp(info.end);

    import { getContext } from "svelte";
    const { refresh, uploadSubtitleEdit, insertAfter, insertBefore, remove } =
        getContext("app");

    function setFocus(value: boolean) {
        info.focus = value;
        refresh();
    }

    function insert_before() {
        insertBefore(info);
    }
    function insert_after() {
        insertAfter(info);
    }
    function remove_self() {
        remove(info);
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
    <div>
        <IconButton
            style="float:right"
            class="material-icons"
            on:click={() => menu.setOpen(true)}
        >
            more_horiz
        </IconButton>
    </div>
    <Menu
        bind:this={menu}
        style="width: 200px"
        anchorCorner="BOTTOM_RIGHT"
        anchorMargin={{ top: 0, bottom: 0, left: 0, right: 200 }}
    >
        <List dense>
            <Item on:SMUI:action={insert_before}>
                <Graphic class="material-icons">expand_less</Graphic>
                <Text>Insert before</Text>
            </Item>
            <Item on:SMUI:action={insert_after}>
                <Graphic class="material-icons">expand_more</Graphic>
                <Text>Insert after</Text>
            </Item>
            <Separator />
            <Item on:SMUI:action={remove_self}>
                <Graphic class="material-icons">delete</Graphic>
                <Text>Delete</Text>
            </Item>
        </List>
    </Menu>
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
