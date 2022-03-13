<script lang="ts">
    import { loginStore } from "./loginStore";
    import Button, {Icon} from "@smui/button";
    import Textfield from "@smui/textfield";
    import IconButton from "@smui/icon-button";
    let user;
    loginStore.subscribe((e) => {
        user = e;
        // not sure this is the best place for this
        if (user === false && window.location.pathname != "/")
            window.location.href = "/";
    });

    function logout() {
        fetch("/api/logout", { method: "POST" })
            .then(() => loginStore.set(null))
            .then(() => (window.location.href = "/"));
    }

    function login(user, password) {
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: user,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    window.location.href = "/workspaces";
                }
            })
            .catch((error) => console.error(error));
    }
    let loginPopup = false;
    let registerPopup = false;
    let input_user='';
    let input_pass='';
</script>

<div class="login-area">
    {#if user}
        <span class="logged-in-text"
            >Logged in as <span class="username">{user.name}</span></span
        >
        <Button variant="raised" on:click={logout}>log out</Button>
    {:else}
        <Button variant="raised" on:click={() => (loginPopup = true)}
            >log in</Button
        >
    {/if}
</div>

{#if loginPopup}
    <div class="popup">
        <div class="popup-content">
            <div class="popup-header">
                <h1>log in</h1>
                <IconButton class="material-icons" on:click={() => (loginPopup = false)}>close</IconButton>
            </div>
            <div class="popup-body">
                <form
                    on:submit={(e) => {
                        e.preventDefault();
                        login(input_user, input_pass);
                    }}
                >
                    <Textfield bind:value={input_user} label="Username"></Textfield><br/>
                    <Textfield bind:value={input_pass} label="Password" type="password"></Textfield>
                    <br />
                    <Button style="float: right">log in</Button>
                </form>
            </div>
        </div>
    </div>
{/if}

<style lang="sass">
    @use "../global"
    @use "../colors"
    .username
        color: colors.$main
        font-weight: bold

    .logged-in-text
        margin-right: 10px

    .popup
        position: fixed
        top: 0
        left: 0
        right: 0
        bottom: 0
        background: rgba(0, 0, 0, 0.5)
        z-index: 100
        display: flex
        justify-content: center
        align-items: center

    .popup-content
        background: white
        padding: 20px
        border-radius: 5px
        width: 500px
        max-width: 500px
        display: flex
        flex-direction: column
        justify-content: space-between
    
    .popup-header
        display: flex
        justify-content: space-between
        align-items: center
</style>
