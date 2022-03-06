<script lang="ts">
  import Timeline from "./lib/Timeline.svelte";
  import type SubtitleInfo from "./lib/SubtitleInfo";
  import SubtitleList from "./lib/SubtitleList.svelte";

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

  import { setContext } from "svelte";

  setContext("app", {
    refresh: () => {
      subtitles = subtitles;
    },
    getVideo: () => {
      // TODO: actual video info
      return {
        duration: 60000,
      };
    },
    getSettings: () => {
      // TODO: store and retrieve
      return {
        zoom: 0.1,
      };
    },
  });
</script>

<main>
  <h1>suptitle</h1>

  <Timeline {subtitles} />

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
    padding: 1em
    overflow: hidden
  
  h1
    color: colors.$main
    font-size: 2em
    font-weight: 100
</style>
