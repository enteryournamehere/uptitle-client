import { writable } from 'svelte/store'
const loginStore = writable(undefined);

function refresh() {
    return fetch("/api/auth")
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
}

refresh();

export { loginStore, refresh }
