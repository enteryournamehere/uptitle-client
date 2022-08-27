<script lang="ts">
  import ProjectInfoDialog from "./ProjectInfoDialog.svelte";
  export let projectInfo;
  let showProjectInfoPopup = false;
</script>

<div
  class="project-tile"
  on:click={() => {
    showProjectInfoPopup = true;
  }}
>
  <div class="tile-header">{projectInfo.name}</div>

  <img src={projectInfo.thumbnail} alt="project thumbnail" />
</div>

<ProjectInfoDialog bind:visible={showProjectInfoPopup} {projectInfo} />

<style lang="sass">
    $width: 300px
    $total: 200px
    $header: 30px
    $image: $total - $header
    
    .project-tile
        width: $width
        height: $total
        margin: 10px
        border: 1px solid black
        border-radius: 10px
        background: black
        font-size: 1.2rem
        display: flex
        flex-direction: column
        align-items: center
        overflow: hidden

        .tile-header
            height: $header
            display: flex
            align-items: center
            background: white
            color: black
            text-decoration: none
            width: 100%
            padding-left: 10px

        img
            height: $image
</style>
