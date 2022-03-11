<script lang="ts">

import { loginStore } from '../lib/shared/loginStore';
    import Header from '../lib/shared/Header.svelte';
    let user;
    loginStore.subscribe((e) => user = e)
</script>
<Header></Header>
<main>
    <br/>
    <span style="font-size: small">not much, what's up with you?</span>
    <br /><br />
    welcome! please
    {#if user}
        <a href="/workspaces">click here</a> to go to your workspaces.
    {:else}
        log in or register at the top right.
    {/if}
</main>

<style lang="sass">
    @use "../lib/global"

    main
        max-width: 500px
        margin: 0 auto
</style>
