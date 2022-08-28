<script lang="ts">
    import Dialog, { Header, Title, Actions, Content } from "@smui/dialog";
    import Button, { Label } from "@smui/button";
    import IconButton from "@smui/icon-button";
    import { goto } from "@roxi/routify";
    import SnapshotListEntry from "../editor/SnapshotListEntry.svelte";

    export let visible = false;
    export let projectInfo;
    let secs = projectInfo.video.duration / 1000;
    let mins = Math.floor(secs / 60);
    let remaining_secs = Math.floor(secs % 60);

    let snapshot_list = [];
    function load_version_history() {
        fetch(`/api/project/${projectInfo.id}/snapshot/list`)
            .then((res) => res.json())
            .then((snapshots) => {
                snapshot_list = snapshots;
            });
    }
</script>

<Dialog
    bind:open={visible}
    fullscreen
    aria-labelledby="fullscreen-title"
    aria-describedby="fullscreen-content"
    on:SMUIDialog:closed={() => {}}
    on:SMUIDialog:opened={() => {
        load_version_history();
    }}
>
    <Header>
        <Title id="fullscreen-title">{projectInfo.name}</Title>
        <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content>
        <div id="content">
            <div class="flex-column">
                <div class="column-header">Information</div>
                <div class="column-content">
                    <b>Video source: </b>{projectInfo.source}<br />
                    <b>Video ID: </b>{projectInfo.video.id}<br />
                    <b>Duration: </b>{mins}:{remaining_secs}<br />
                    {#if projectInfo.source == "youtube"}
                        <b>Video URL: </b><a
                            href="https://youtube.com/watch?v={projectInfo.video
                                .id}">Link to YouTube</a
                        ><br />
                    {/if}
                    <b>Thumbnail:</b><br />
                    <img
                        class="thumbnail"
                        src={projectInfo.thumbnail}
                        alt="Thumbnail for this video"
                    />
                </div>
            </div>
            <div class="flex-column languages-column">
                <!-- To do: implement translation UI -->
                <div class="column-header">Languages</div>
                <div class="column-content">
                    <div class="language selected">English</div>
                </div>
            </div>
            <div class="flex-column">
                <div class="column-header">Version history</div>
                <div class="column-content">
                    {#each snapshot_list as snapshot}
                        <div class="snapshot-item">
                            <div class="snapshot-item-header">
                                <SnapshotListEntry {snapshot} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </Content>
    <Actions>
        <Button
            action="accept"
            defaultAction
            on:click={() => {
                $goto("/editor?project=" + projectInfo.id);
            }}
        >
            <Label>Open editor</Label>
        </Button>
    </Actions>
</Dialog>

<style lang="sass">
    #content
        display: flex
        justify-content: space-between

    .thumbnail
        width: 200px

    .flex-column
        display: flex
        flex-direction: column
        justify-content: start
        flex-grow: 1
        height: 300px

    .flex-column .column-header
        font-size: 1.2rem
        font-weight: bold
        color: #000
        padding-bottom: 10px

    .languages-column .column-content
        display: flex
        flex-wrap: wrap

    .language
        padding: 10px
        height: fit-content
        margin: 3px
        border-radius: 30px
        border: 1px solid #333

    .language.selected
        background: #eee
</style>
