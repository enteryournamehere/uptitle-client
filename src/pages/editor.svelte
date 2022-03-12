<script lang="ts">
  import Timeline from "../lib/editor/Timeline.svelte";
  import type SubtitleInfo from "../lib/editor/SubtitleInfo";
  import SubtitleList from "../lib/editor/SubtitleList.svelte";
  import Player from "../lib/editor/Player.svelte";
  import { PlaybackController } from "../lib/editor/PlaybackController";

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

  import { setContext, onMount, onDestroy } from "svelte";
  import Header from "../lib/shared/Header.svelte";
  import Controls from "../lib/editor/Controls.svelte";

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project");
  if (!projectId) {
    document.location.href = "/workspaces/";
  }

  let projectInfo = undefined;

  setContext("app", {
    refresh: () => {
      subtitles = subtitles;
    },
    getSettings: () => {
      // TODO: store and retrieve
      return {
        zoom: 0.1,
      };
    },
  });

  fetch(`/api/project/${projectId}`)
    .then((res) => res.json())
    .then((project) => {
      console.log(project);
      project.subtitles = subtitles;
      projectInfo = project;
    });

  let playerComponent: Player;
  let timelineComponent: Timeline;
  let controlsComponent: Controls;
  let playbackController: PlaybackController = undefined;
  let playing = false;

  onMount(() => {
    playbackController = new PlaybackController(playerComponent);
    playbackController.addEventListener("playback", (e) => {
      timelineComponent.seekTo((e as CustomEvent).detail);
      controlsComponent.seekTo((e as CustomEvent).detail);
    });
    playbackController.addEventListener("play", (e) => {
      playing = true;
    });
    playbackController.addEventListener("pause", (e) => {
      playing = false;
    });
  });

  onDestroy(() => {
    clearInterval(playbackController.playbackInterval);
  });

  function debug() {}
</script>

<Header>
  <h2 on:click={debug}>{projectInfo ? projectInfo.name : "loading..."}</h2>
</Header>

<main>
  <div class="player-area">
    <Player
      bind:this={playerComponent}
      {projectInfo}
      on:stateChange={(e) => playbackController.stateUpdate(e)}
    />
    <Controls
      bind:this={controlsComponent}
      {projectInfo}
      {playing}
      on:seek={(e) => {
        playbackController.seekTo(e.detail.seconds, e.detail.allowSeekAhead);
        timelineComponent.seekTo(e.detail.seconds);
      }}
      on:play={(e) => playbackController.play()}
      on:pause={(e) => playbackController.pause()}
    />
  </div>

  <Timeline
    bind:this={timelineComponent}
    {projectInfo}
    {playing}
    {subtitles}
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
  @use "../lib/global"
  
  h1
    padding-left: 30px

  .player-area
    display: flex
    flex-direction: column
    justify-content: space-between
    align-items: center
    // height: 40px
    background: #111
    // width: 640px
</style>
