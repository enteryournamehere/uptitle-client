import { writable } from 'svelte/store'
const loginStore = writable(undefined);

function refresh() {
    return fetch("/api/auth")
        .then((res) => {
            if (!res.ok) {
                loginStore.set(false);
                return
            }
            res.json().then(data => {
                loginStore.set(data)
            })
        })
}

refresh();

export { loginStore, refresh }
