<script>
import WorkspaceTile from "../lib/workspaces/WorkspaceTile.svelte";
import Header from "../lib/shared/Header.svelte";

    let workspaces = [];

    fetch('/api/workspace/list')
        .then(response => response.json())
        .then(res => workspaces = res)
        .catch(console.error)
</script>
<Header />
{#each workspaces as workspace}
    <WorkspaceTile workspaceInfo={workspace}/>
{/each}

<style lang="sass">
    @use "../lib/global"
</style>
