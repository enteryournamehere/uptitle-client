<script lang="ts">
    export let snapshot;
</script>

<span class="snapshot-item-title">
    {#if snapshot.name != null}
        {snapshot.name}
    {:else}
        Untitled
    {/if}
</span>
<span class="snapshot-item-date">
    <time datetime={snapshot.timestamp}
        >{new Date(snapshot.timestamp * 1000).toLocaleString("sv-SV")}</time
    >
</span>

<style lang="sass">
    .snapshot-item-date
        color: #bbb
</style>
