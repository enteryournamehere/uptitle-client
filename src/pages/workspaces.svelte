<script>
    import WorkspaceTile from "../lib/workspaces/WorkspaceTile.svelte";
    import Header from "../lib/shared/Header.svelte";
    import { setContext } from "svelte";

    let workspaces = [];

    setContext("workspaces", {
        refresh: () => {
            return fetch("/api/workspace/list")
                .then((response) => response.json())
                .then((res) => {
                    if (res.error) return;
                    workspaces = res;
                })
                .catch((error) => {
                    console.error(error);
                });
        },
    });

    fetch("/api/workspace/list")
        .then((response) => response.json())
        .then((res) => {
            if (res.error) return;
            workspaces = res;
        })
        .catch(console.error);
</script>

<Header />
{#each workspaces as workspace}
    <WorkspaceTile workspaceInfo={workspace} />
{/each}

<style lang="sass">
    @use "../lib/global"
</style>
