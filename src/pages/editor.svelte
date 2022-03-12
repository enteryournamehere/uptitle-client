<script lang="ts">
  import Timeline from "../lib/editor/Timeline.svelte";
  import type SubtitleInfo from "../lib/editor/SubtitleInfo";
  import SubtitleList from "../lib/editor/SubtitleList.svelte";
  import Player from "../lib/editor/Player.svelte";
  import { PlaybackController } from "../lib/editor/PlaybackController";

  let subtitles: SubtitleInfo[] = [];

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
    uploadSubtitleEdit: (info: SubtitleInfo) => {
      const patch = {}
      if (info.text != info.prev_values.text)
          patch['text'] = info.text;
      if (info.start != info.prev_values.start)
          patch['start'] = info.start;
      if (info.end != info.prev_values.end)
          patch['end'] = info.end;
      
      // Copy info to info.prev_values
      info.prev_values = { text: info.text, start: info.start, end: info.end };

      // Send patch to server
      fetch(`/api/project/${projectId}/subtitle/${info.id}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(patch)
      })
          .then(res => res.json())
          .then(res => {
              if (res.error) {
                  console.error(res.error);
                  return;
              }
          })
          .catch(err => {
              console.error(err);
          });
    }
  });

  fetch(`/api/project/${projectId}`)
    .then((res) => res.json())
    .then((project) => {
      console.log(project);
      projectInfo = project;
    });

  fetch(`/api/project/${projectId}/subtitle/list`)
    .then((res) => res.json())
    .then((subtitles2) => {
      console.log(subtitles2);
      subtitles2.forEach(info => {
        info.prev_values = { text: info.text, start: info.start, end: info.end };
      });
      subtitles = subtitles2;
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
      const prev_end = (subtitles.length > 0)
        ? subtitles[subtitles.length - 1].end
        : 0
      subtitles.push({
        start: prev_end + 500,
        end: prev_end + 2500,
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
