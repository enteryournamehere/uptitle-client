<script>
    let player = undefined;
    import { createEventDispatcher, onMount, getContext } from "svelte";
    const dispatch = createEventDispatcher();
    let videoId = "xx";
    let height = "360";
    let width = "640";

    export let projectInfo;

    let mounted = false;

    $: (projectInfo && mounted) && load();

    function load() {
        videoId = projectInfo.video.id;

        // @ts-ignore
        window.onYouTubeIframeAPIReady = function () {
            createPlayer();
        };

        // load YT API script
        // check if it already exists
        let ytScriptUrl = "https://www.youtube.com/iframe_api";
        let ytScript = document.querySelector('script[src="' + ytScriptUrl + '"]');
        if (ytScript) {
            // @ts-ignore
            window.onYouTubeIframeAPIReady();
        } else {
            var tag = document.createElement("script");
            tag.src = ytScriptUrl;
            var firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        function createPlayer() {
            // @ts-ignore
            player = new YT.Player("yt-player", {
                height,
                width,
                videoId: videoId,
                host: 'http://www.youtube-nocookie.com',
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    modestbranding: 1, // does not seem to do anything
                    cc_load_policy: 3,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: (event) => {
                        dispatch("ready", event);
                    },
                    onStateChange: onPlayerStateChange,
                },
            });
        }
    }

    onMount(() => {
        mounted = true;
    })

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
</style>
