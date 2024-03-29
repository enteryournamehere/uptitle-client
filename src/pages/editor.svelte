<script lang="ts">
  import Timeline from "../lib/editor/Timeline.svelte";
  import type SubtitleInfo from "../lib/editor/SubtitleInfo";
  import SubtitleList from "../lib/editor/SubtitleList.svelte";
  import SubtitleDisplay from "../lib/editor/SubtitleDisplay.svelte";
  import Player from "../lib/editor/Player.svelte";
  import { PlaybackController } from "../lib/editor/PlaybackController";
  import Button from "@smui/button";
  import SnapshotSection from "../lib/editor/SnapshotSection.svelte";

  let subtitles: SubtitleInfo[] = [];
  let subtitles_secondary: SubtitleInfo[] = [];

  import { setContext, onMount, onDestroy } from "svelte";
  import Header from "../lib/shared/Header.svelte";
  import Controls from "../lib/editor/Controls.svelte";

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project");
  if (!projectId) {
    document.location.href = "/workspaces/";
  }

  let projectInfo = undefined;

  function uploadSubtitleEdit(info: SubtitleInfo) {
    const patch = {};
    if (info.text != info.prev_values.text) patch["text"] = info.text;
    if (info.start != info.prev_values.start) patch["start"] = info.start;
    if (info.end != info.prev_values.end) patch["end"] = info.end;

    // Copy info to info.prev_values
    info.prev_values = { text: info.text, start: info.start, end: info.end };

    // Send patch to server
    fetch(`/api/project/${projectId}/subtitle/${info.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((text) => console.error(text));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  setContext("app", {
    refresh: () => {
      subtitles = subtitles;
      subtitles_secondary = subtitles_secondary;
    },
    getSettings: () => {
      // TODO: store and retrieve
      return {
        zoom: 0.1,
      };
    },
    uploadSubtitleEdit: uploadSubtitleEdit,
    insertAfter: (info) => {
      let result = insertSubtitle({
        start: info.start + (info.end - info.start) / 2,
        end: info.end,
        text: "subtitle",
      });
      if (!result)
        alert("There's not enough space here to create a new subtitle");
    },
    insertBefore: (info) => {
      let result = insertSubtitle({
        start: info.start - 1000,
        end: info.start,
        text: "subtitle",
      });
      if (!result)
        alert("There's not enough space here to create a new subtitle");
    },
    remove: (info) => {
      let index = subtitles.indexOf(info);
      if (index == -1) return;
      subtitles.splice(index, 1);
      subtitles = subtitles;
      fetch(`/api/project/${projectId}/subtitle/${info.id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) return res.text().then((text) => console.error(text));
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  fetch(`/api/project/${projectId}`)
    .then((res) => res.json())
    .then((project) => {
      if (project.error) return;
      projectInfo = project;
    });

  fetch(`/api/project/${projectId}/subtitle/list`)
    .then((res) => res.json())
    .then((subtitles2) => {
      if (subtitles2.error) return;
      console.log(subtitles2);
      subtitles2.forEach((info) => {
        info.prev_values = {
          text: info.text,
          start: info.start,
          end: info.end,
        };
      });
      subtitles = subtitles2;
    });

  interface SubtitleEvent extends Event {
    data: string;
  }

  const eventSource = new EventSource(`/api/project/${projectId}/events`);

  eventSource.addEventListener("subtitle_edit", (e) => {
    const data = JSON.parse((<SubtitleEvent>e).data).info.SubtitleEdit;
    const info = subtitles.find((s) => s.id == data.subtitle);
    if (!info) return;
    if ("text" in data && data["text"] !== null) info.text = data["text"];
    if ("start" in data && data["start"] !== null) info.start = data["start"];
    if ("end" in data && data["end"] !== null) info.end = data["end"];
    subtitles = subtitles;
  });

  eventSource.addEventListener("subtitle_create", (e) => {
    const data = JSON.parse((<SubtitleEvent>e).data);
    insertSubtitle(data.info.SubtitleCreate, data.info.SubtitleCreate.subtitle);
  });

  eventSource.addEventListener("subtitle_delete", (e) => {
    const data = JSON.parse((<SubtitleEvent>e).data);
    const info = subtitles.find(
      (s) => s.id == data.info.SubtitleDelete.subtitle
    );
    if (!info) return;
    subtitles.splice(subtitles.indexOf(info), 1);
    subtitles = subtitles;
  });

  eventSource.addEventListener("waveform_ready", (e) => {
    timelineComponent.fetchWaveform();
  });

  eventSource.onmessage = console.log;
  eventSource.onerror = console.error;

  let playerComponent: Player;
  let timelineComponent: Timeline;
  let controlsComponent: Controls;
  let playbackController: PlaybackController = undefined;
  let playing = false;
  let currentSubtitleText = "";

  function updateSubtitleDisplay(current_time_seconds) {
    const currentTime = current_time_seconds * 1000;
    const currentSubtitle = subtitles.find((subtitle) => {
      return currentTime >= subtitle.start && currentTime <= subtitle.end;
    });
    if (currentSubtitle) {
      currentSubtitleText = currentSubtitle.text;
    } else {
      currentSubtitleText = "";
    }
  }

  function playbackEventListener(e) {
    timelineComponent.seekTo((e as CustomEvent).detail);
    controlsComponent.seekTo((e as CustomEvent).detail);
    updateSubtitleDisplay((e as CustomEvent).detail);
  }

  function playEventListener(e) {
    playing = true;
  }

  function pauseEventListener(e) {
    playing = false;
  }

  onMount(() => {
    playbackController = new PlaybackController(playerComponent);
    playbackController.addEventListener("playback", playbackEventListener);
    playbackController.addEventListener("play", playEventListener);
    playbackController.addEventListener("pause", pauseEventListener);
  });

  onDestroy(() => {
    clearInterval(playbackController.playbackInterval);
    playbackController.removeEventListener("playback", playbackEventListener);
    playbackController.removeEventListener("play", playEventListener);
    playbackController.removeEventListener("pause", pauseEventListener);
    eventSource.close();
  });

  function createSubtitle(start, end = -1, text = "subtitle", id = -1) {
    if (end == -1) {
      end = start + 1000;
    }
    start = Math.floor(start);
    end = Math.floor(end);
    let startCollision: SubtitleInfo, endCollision: SubtitleInfo;
    let startCollisionEdited = false;
    let newStartCollisionEnd: number;

    subtitles.sort((a, b) => a.start - b.start);
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      if (subtitle.start <= start && subtitle.end > start) {
        startCollision = subtitle;
        break;
      }
    }

    subtitles.sort((a, b) => a.end - b.end);
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      if (subtitle.start >= start && subtitle.start < end) {
        endCollision = subtitle;
        break;
      }
    }

    if (startCollision) {
      newStartCollisionEnd = start;
      startCollisionEdited = true;
      uploadSubtitleEdit(startCollision);
    }
    if (endCollision) {
      end = endCollision.start;
    }
    if (
      end - start < 200 ||
      (startCollisionEdited &&
        newStartCollisionEnd - startCollision.start < 200)
    ) {
      return false;
    }
    if (startCollisionEdited) {
      startCollision.end = newStartCollisionEnd;
      uploadSubtitleEdit(startCollision);
    }
    return {
      id: id,
      start,
      end,
      text,
      prev_values: {
        start,
        end,
        text,
      },
    };
  }

  function insertSubtitle(info, id = -1) {
    const new_obj = createSubtitle(info.start, info.end, info.text, id);
    if (!new_obj) return false;
    let insert_index = subtitles.length;
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      if (subtitle.start > new_obj.start) {
        insert_index = i;
        break;
      }
    }
    if (id != -1) {
      subtitles.splice(insert_index, 0, new_obj);
      subtitles = subtitles;
      return;
    }
    fetch(`/api/project/${projectId}/subtitle/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: new_obj.start,
        end: new_obj.end,
        text: new_obj.text,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          console.error(res.error);
          return;
        }
        // new_obj.id = res.id;

        // subtitles.splice(insert_index, 0, new_obj);
        // subtitles = subtitles;
      });
    return true;
  }

  function debug() {
    console.log(subtitles_secondary);
  }
</script>

<main>
  <Header back_button={true}>
    <h2 on:click={debug}>{projectInfo ? projectInfo.name : "loading..."}</h2>
  </Header>

  <div class="player-area">
    <Player
      bind:this={playerComponent}
      {projectInfo}
      on:stateChange={(e) => playbackController.stateUpdate(e)}
    />
    <SubtitleDisplay text={currentSubtitleText} />
    <Controls
      bind:this={controlsComponent}
      {projectInfo}
      {playing}
      on:seek={(e) => {
        playbackController.seekTo(e.detail.seconds, e.detail.allowSeekAhead);
        timelineComponent.seekTo(e.detail.seconds);
        updateSubtitleDisplay(e.detail.seconds);
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
    {subtitles_secondary}
    on:seek={(e) => {
      playbackController.seekTo(e.detail.seconds, e.detail.allowSeekAhead);
      controlsComponent.seekTo(e.detail.seconds);
      updateSubtitleDisplay(e.detail.seconds);
    }}
  />

  <div class="bottom-area">
    <div class="bottom-section section-snapshots">
      <!-- section for comparing with other snapshots -->
      <SnapshotSection {projectInfo} bind:subtitles={subtitles_secondary} />
    </div>
    <div class="bottom-section section-subtitles">
      <SubtitleList {subtitles} />
    </div>
    <div class="bottom-section section-settings">
      <Button
        style="margin: 20px"
        variant="raised"
        on:click={() => {
          console.log(subtitles);
          const prev_end =
            subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 0;
          insertSubtitle({
            start: prev_end + 500,
            end: prev_end + 2500,
            text: "subtitle",
          });
        }}>add subtitle at end</Button
      >

      <Button
        style="margin: 20px"
        variant="raised"
        on:click={() => {
          console.log(subtitles);
          const start = playbackController.getCurrentTime() * 1000;
          const end = start + 1000;

          // Insert at the right place
          let done = insertSubtitle({
            start: start,
            end: end,
            text: "subtitle",
          });
          if (!done) alert("There's not enough space here for a new subtitle");
        }}>add subtitle here</Button
      >
    </div>
  </div>
</main>

<style lang="sass">
  @use "../lib/global"
  
  main
    display: flex
    flex-direction: column
    height: 100vh

  .player-area
    display: flex
    flex-direction: column
    justify-content: space-between
    align-items: center
    background: #111
    position: relative

  .bottom-area
    display: flex
    overflow: hidden
    align-items: stretch

    .bottom-section
      flex: 1 1 0
      max-height: 100%
      display: flex
      justify-content: center

    .section-snapshots
      display: flex
      flex-direction: column
      align-items: stretch
      justify-content: start
      width: 100%
      height: 100%
</style>
