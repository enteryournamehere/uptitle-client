<script lang="ts">
    import ProjectTile from "./ProjectTile.svelte";
    import Button, { Icon, Label } from "@smui/button";
    import IconButton from "@smui/icon-button";
    export let workspaceInfo;

    let showNewProjectPopup = false;
</script>

<div class="card">
    <div class="card-header">
        <h3 class="card-title">
            {workspaceInfo.name}
        </h3>

        <div class="card-tools">
            <span>
                {workspaceInfo.members.length}
                {workspaceInfo.members.length == 1 ? "member" : "members"}
            </span>
            <Button variant="raised">
                <Icon class="material-icons">add</Icon>
                <Label>Add project</Label>
            </Button>
            <IconButton class="material-icons" on:click={() => {}}>
                settings
            </IconButton>
        </div>
    </div>
    <div class="card-body">
        <!-- several tiles here (flexbox) -->
        {#each workspaceInfo.projects as project}
            <ProjectTile projectInfo={project} />
        {/each}
        <div class="card-tile see-more"><i>more...</i></div>
    </div>
</div>

{#if showNewProjectPopup}

{/if}

<style lang="sass">
    @use "../colors"

    .card
        margin: 10px
        border-radius: 10px
        overflow: hidden
        border: 1px solid black

        .card-header
            background: white
            border-bottom: 1px solid black
            display: flex
            align-items: center
            justify-content: space-between
            height: 50px
            padding: 0 20px
            h3
                font-size: 1.5rem
                font-weight: bold

            *
                display: flex
                align-items: center

            .card-tools
                span
                    margin-right: 10px

        .card-body
            padding: 10px
            display: flex
            flex-wrap: wrap
            justify-content: left
            align-items: center
            overflow: hidden


</style>
