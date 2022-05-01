<script>
    import WorkspaceTile from "../lib/workspaces/WorkspaceTile.svelte";
    import Header from "../lib/shared/Header.svelte";
    import { setContext } from "svelte";

    let workspaces = [];

    setContext("workspaces", {
        refresh: () => {
            return fetch("/api/workspace/list")
                .then((res) => {
                    if (!res.ok) return;
                    return res.json();
                })
                .then((data) => {
                    workspaces = data;
                })
                .catch((error) => {
                    console.error(error);
                });
        },
    });

    fetch("/api/workspace/list")
        .then((res) => {
            if (!res.ok) return;
            return res.json();
        })
        .then((data) => {
            workspaces = data;
        })
        .catch((error) => {
            console.error(error);
        });
</script>

<Header />
{#each workspaces as workspace}
    <WorkspaceTile workspaceInfo={workspace} />
{/each}

<style lang="sass">
    @use "../lib/global"
</style>
