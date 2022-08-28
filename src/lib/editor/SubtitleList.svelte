<script lang="ts">
    import SubtitleListElement from "./SubtitleListElement.svelte";
    import type SubtitleInfo from "./SubtitleInfo";

    export let subtitles: SubtitleInfo[];

    export let disabled = false;
</script>

<div class="subtitle-list">
    {#each subtitles as subtitle}
        <SubtitleListElement info={subtitle} {disabled} />
    {/each}
</div>

<style lang="sass">
    .subtitle-list
        display: flex
        flex-direction: column
        align-items: stretch
        width: 100%

        overflow-y: scroll
</style>
