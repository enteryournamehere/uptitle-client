<script lang="ts">
    import SnapshotListDialog from "./SnapshotListDialog.svelte";
    import IconButton, { Icon } from "@smui/icon-button";
    import SubtitleList from "./SubtitleList.svelte";
    import SnapshotListEntry from "./SnapshotListEntry.svelte";
    import Dialog, { Title, Content, Actions } from "@smui/dialog";
    import Button, { Label } from "@smui/button";
    import Textfield from "@smui/textfield";

    let show_snapshot_list = false;

    let selection = "none";

    let snapshot = {
        timestamp: "", // should be number maaaybe
        name: null,
        subtitles: [],
    };

    let snapshot_selected = false;
    let editPopup = false;
    let editing_name = "";

    export let projectInfo;

    function fetch_snapshot() {
        fetch(`/api/project/${projectInfo.id}/snapshot/${selection}`)
            .then((res) => res.json())
            .then((res) => {
                snapshot.subtitles = res.subtitles;
                snapshot.name = res.name;
                snapshot.timestamp = selection;
                snapshot_selected = true;
            });
    }

    function showEditPopup() {
        editing_name = snapshot.name;
        editPopup = true;
    }

    function completeEdit() {
        snapshot.name = editing_name;
        fetch(`/api/project/${projectInfo.id}/snapshot/${selection}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: snapshot.name,
            }),
        });
    }
</script>

<SnapshotListDialog
    bind:visible={show_snapshot_list}
    bind:selection
    {projectInfo}
    on:click={() => {
        fetch_snapshot();
    }}
/>

<Dialog
    bind:open={editPopup}
    aria-labelledby="simple-title"
    aria-describedby="simple-content"
>
    <Title id="simple-title">Edit name</Title>
    <Content id="simple-content">
        <Textfield bind:value={editing_name} label="New name" />
    </Content>
    <Actions>
        <Button>
            <Label>Cancel</Label>
        </Button>
        <Button
            on:click={() => {
                completeEdit();
            }}
        >
            <Label>Accept</Label>
        </Button>
    </Actions>
</Dialog>

<div class="snapshots-header">
    <IconButton
        on:click={() => {
            show_snapshot_list = true;
        }}
    >
        <Icon class="material-icons">restore</Icon>
    </IconButton>

    {#if snapshot_selected}
        <div class="center-section">
            <b><SnapshotListEntry {snapshot} /></b>
            <IconButton
                on:click={() => {
                    showEditPopup();
                }}
            >
                <Icon class="material-icons">edit</Icon>
            </IconButton>
        </div>
    {:else}
        <span class="snapshot-item-title">No snapshot selected</span>
    {/if}

    <IconButton
        on:click={() => {
            fetch(`/api/project/${projectInfo.id}/snapshot/create`, {
                method: "POST",
            });
        }}
    >
        <Icon class="material-icons">save</Icon>
    </IconButton>
</div>
<div class="snapshots-content">
    <SubtitleList subtitles={snapshot.subtitles} disabled={true} />
</div>

<style lang="sass">
.snapshots-header
    padding-left: 15px
    display: flex
    justify-content: space-between
    align-items: center

    .center-section
        display: flex
        align-items: center

.snapshots-content
    display: flex
    overflow-y: scroll
</style>
