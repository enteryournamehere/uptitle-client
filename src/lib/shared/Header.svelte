<script>
import Login from "./Login.svelte";

</script>
<div class="header">
    <h1>uptitle</h1>
    <slot></slot>
    <Login/>
</div>

<style lang="sass">
    @use "../global"
    @use "../colors"

    .header
        height: 60px
        background-color: #fff
        border-bottom: 1px solid colors.$main
        padding: 0 20px
        display: flex
        box-shadow: 0 0px 3px 0px colors.$main
        align-items: center
        justify-content: space-between

    .username
        color: colors.$main
        font-weight: bold
</style>
