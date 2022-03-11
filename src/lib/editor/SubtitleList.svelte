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
        justify-content: center

        width: 100%
        max-width: 500px
        height: 100%

        border: 1px solid black
</style>
