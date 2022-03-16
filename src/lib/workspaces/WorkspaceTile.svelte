<script lang="ts">
    import ProjectTile from "./ProjectTile.svelte";
    import Button, { Icon, Label } from "@smui/button";
    import IconButton from "@smui/icon-button";
    import Textfield from "@smui/textfield";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import { getContext } from "svelte";
    export let workspaceInfo;

    let showNewProjectPopup = false;

    const { refresh } = getContext("workspaces");

    let project_video = "";
    let project_name = "";

    function create_project() {
        // convert url to youtube video id, if applicable
        const matches = project_video.match(/[\w-]+$/);
        if (!matches) {
            alert("Invalid video URL");
            return;
        }
        const video_id = matches[0];
        fetch("/api/project/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: project_name,
                workspace: workspaceInfo.id,
                video: video_id,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.message);
                } else {
                    showNewProjectPopup = false;
                }
                refresh();
            })
            .catch((error) => {
                console.error(error);
            });
    }
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
            <Button
                variant="raised"
                on:click={() => {
                    showNewProjectPopup = true;
                }}
            >
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
    </div>
</div>

<Dialog
    bind:open={showNewProjectPopup}
    aria-labelledby="simple-title"
    aria-describedby="simple-content"
>
    <Title id="simple-title">Create project</Title>
    <Content id="simple-content">
        <form
            on:submit={(e) => {
                e.preventDefault();
                create_project();
            }}
        >
            <Textfield bind:value={project_name} label="Project name" />
            <br />
            <Textfield bind:value={project_video} label="Video URL or ID" />
            <br />
            <Button style="float:right; margin-top: 10px;">create</Button>
        </form>
    </Content>
</Dialog>

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
