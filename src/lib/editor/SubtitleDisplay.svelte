<script lang="ts">
    export let text;
</script>
{#if text != ''}
<div class="subtitle-overlay">
    {text}
</div>
{/if}

<style lang="sass">
    .subtitle-overlay
        position: absolute
        bottom: 40px // hardcoded :( should link this to the controls height somehow. or figure out how the relative position should work.
        margin-bottom: 10px
        color: white
        background: rgba(0,0,0,0.6)
        white-space: pre-line
        text-align: center
        padding: 8px
        border-radius: 5px
        max-width: 400px
</style>
