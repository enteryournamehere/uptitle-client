<script lang="ts">
  import Timeline from "./lib/Timeline.svelte";
  import type SubtitleInfo from "./lib/SubtitleInfo";
  import SubtitleList from "./lib/SubtitleList.svelte";
  import Player from "./lib/Player.svelte";
  import { PlaybackController } from "./lib/PlaybackController";

  let subtitles: SubtitleInfo[] = [
    {
      start: 500,
      end: 3000,
      text: "Lorem ipsum dolor sit amet,",
    },
    {
      start: 3000,
      end: 5000,
      text: "consectetur adipiscing elit. ",
    },
    {
      start: 5500,
      end: 8000,
      text: "Ut luctus elit urna, ac varius leo tempor ut.",
    },
    {
      start: 8500,
      end: 10500,
      text: "Phasellus scelerisque tortor eros,",
    },
  ];

  import { setContext, onMount } from "svelte";

  setContext("app", {
    refresh: () => {
      subtitles = subtitles;
    },
    getVideo: () => {
      // TODO: actual video info
      return {
        duration: 60000,
        id: "grd-K33tOSM",
      };
    },
    getSettings: () => {
      // TODO: store and retrieve
      return {
        zoom: 0.1,
      };
    },
  });

  let playerComponent: Player;
  let timelineComponent: Timeline;
  let playbackController: PlaybackController = undefined;
  let playing = false;

  onMount(() => {
    playbackController = new PlaybackController(playerComponent);
    playbackController.addEventListener("playback", (e) => {
      timelineComponent.seekTo((e as CustomEvent).detail);
    });
    playbackController.addEventListener("play", (e) => {
      playing = true;
    });
    playbackController.addEventListener("pause", (e) => {
      playing = false;
    });
  });

  function debug() {
    console.log(playbackController.getCurrentTime());
  }
</script>

<main>
  <h1 on:click={debug}>uptitle</h1>

  <Player
    bind:this={playerComponent}
    on:stateChange={(e) => playbackController.stateUpdate(e)}
  />

  <Timeline
    bind:this={timelineComponent}
    {subtitles}
    {playing}
    on:seek={(e) =>
      playbackController.seekTo(e.detail.seconds, e.detail.allowSeekAhead)}
  />

  <br />

  <SubtitleList {subtitles} />

  <br />

  <button
    on:click={() => {
      console.log(subtitles);
      subtitles.push({
        start: subtitles[subtitles.length - 1].end + 500,
        end: subtitles[subtitles.length - 1].end + 2500,
        text: "subtitle",
      });
      subtitles = subtitles;
    }}>new</button
  >
</main>

<style lang="sass">
  @use "./lib/colors"

  :root
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif

  main
    overflow: hidden

  h1
    color: colors.$main
    font-size: 2em
    font-weight: 100
    padding-left: 30px
</style>
