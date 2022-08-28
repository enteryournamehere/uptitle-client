<script lang="ts">
    import Dialog, { Header, Title, Actions, Content } from "@smui/dialog";
    import Button, { Label } from "@smui/button";
    import List, { Item, Graphic, Text } from "@smui/list";
    import Radio from "@smui/radio";
    import SnapshotListEntry from "./SnapshotListEntry.svelte";

    export let visible = false;
    export let projectInfo;
    export let selection = "none";

    let snapshot_list = [];
    function select_snapshot() {
        fetch(`/api/project/${projectInfo.id}/snapshot/list`)
            .then((res) => res.json())
            .then((snapshots) => {
                snapshot_list = snapshots;
            });
    }
</script>

<Dialog
    bind:open={visible}
    selection
    aria-labelledby="fullscreen-title"
    on:SMUIDialog:closed={() => {}}
    on:SMUIDialog:opened={() => {
        select_snapshot();
    }}
>
    <Header>
        <Title id="fullscreen-title">Pick snapshot</Title>
    </Header>
    <Content>
        <List radioList>
            {#each snapshot_list as snapshot}
                <Item>
                    <Graphic>
                        <Radio
                            bind:group={selection}
                            value={snapshot.timestamp}
                        />
                    </Graphic>
                    <Text>
                        <SnapshotListEntry {snapshot} />
                    </Text>
                </Item>
            {/each}
        </List>
    </Content>
    <Actions>
        <Button>Cancel</Button>
        <Button defaultAction on:click>
            <Label>Load</Label>
        </Button>
    </Actions>
</Dialog>

<style lang="sass">

</style>
