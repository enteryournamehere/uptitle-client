<script>
    import Login from "./Login.svelte";
    import IconButton from "@smui/icon-button";

    export let back_button = false;
</script>

<div class="header">
    <div class="box">
        {#if back_button}
            <IconButton
                class="material-icons"
                on:click={() => {
                    window.history.back();
                }}>arrow_back</IconButton
            >
        {/if}
        <h1>uptitle</h1>
    </div>
    <div class="box">
        <slot />
    </div>
    <div class="box">
        <Login />
    </div>
</div>

<style lang="sass">
    @use "../global"
    @use "../colors"

    .header
        height: 60px
        background-color: #fff
        border-bottom: 1px solid colors.$main
        padding: 0 20px
        display: flex
        box-shadow: 0 0px 3px 0px colors.$main
        align-items: center
        justify-content: space-between

        .box
            display: flex
            align-items: center
            flex: 1 1 0
            justify-content: center

        .box:first-child
            justify-content: left

        .box:last-child
            justify-content: right

        h1
            padding-bottom: 4px
</style>
