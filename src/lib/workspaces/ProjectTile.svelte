<script lang="ts">
import { url } from "@roxi/routify";

    export let projectInfo;
</script>

<a href={$url("/editor?project=" + projectInfo.id)}>
<div class="project-tile">
    <div class="tile-header">{projectInfo.name}</div>

    <img src={projectInfo.thumbnail} alt="project thumbnail"/>

</div>
</a>
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

    a:link, a:visited, a:hover, a:active
        text-decoration: none
</style>
