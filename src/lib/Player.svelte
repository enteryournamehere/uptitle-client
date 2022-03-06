<script>
    let player = undefined;
    import { createEventDispatcher, onMount, getContext } from "svelte";
    const dispatch = createEventDispatcher();
    let videoId = getContext("app").getVideo().id;
    let height = "360";
    let width = "640";

    onMount(() => {
        // load YT API script
        let ytScriptUrl = "https://www.youtube.com/iframe_api";
        var tag = document.createElement("script");
        tag.src = ytScriptUrl;
        var firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // @ts-ignore
        window.onYouTubeIframeAPIReady = function () {
            createPlayer();
        };

        function createPlayer() {
            // @ts-ignore
            player = new YT.Player("yt-player", {
                height,
                width,
                videoId: videoId,
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    modestbranding: 1, // does not seem to do anything
                },
                events: {
                    onReady: (event) => {
                        dispatch("ready", event);
                    },
                    onStateChange: onPlayerStateChange,
                },
            });
        }
    });

    function onPlayerStateChange({ data }) {
        dispatch("stateChange", data);
    }
    export function play() {
        return player?.playVideo();
    }
    export function pause() {
        return player?.pauseVideo();
    }
    export function getCurrentTime() {
        return player?.getCurrentTime();
    }
    export function seekTo(seconds, allowSeekAhead = true) {
        console.log(allowSeekAhead);
        player?.seekTo(seconds, allowSeekAhead);
    }
</script>

<div class="yt-component">
    <div id="yt-player" />
</div>

<style lang="sass">
    .yt-component
        display: flex
        justify-content: center
        height: 360px
        background: #111
</style>
