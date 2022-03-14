<script lang="ts">
    import SubtitleListElement from "./SubtitleListElement.svelte";
    import type SubtitleInfo from "./SubtitleInfo";

    export let subtitles: SubtitleInfo[];
</script>

<div class="subtitle-list">
    {#each subtitles as subtitle}
        <SubtitleListElement info={subtitle} />
    {/each}
</div>

<style lang="sass">
    .subtitle-list
        display: flex
        flex-direction: column
        align-items: stretch
        width: 100%
        max-width: 500px

        border: 1px solid black

        overflow-y: scroll
</style>
