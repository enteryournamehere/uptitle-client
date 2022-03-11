let user = undefined;
import { writable } from 'svelte/store'
const loginStore = writable(undefined);

fetch("/api/auth")
    .then((res) => res.json())
    .then((res) => {
        console.log(res);
        if (res.statusCode === 401) {
            loginStore.set(false);
        }
        else {

        loginStore.set(res.user);
        }
    });

    export { loginStore };
