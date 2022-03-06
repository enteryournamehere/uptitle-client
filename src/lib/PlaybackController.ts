import type Player from './Player.svelte';
import type Timeline from './Timeline.svelte';

export class PlaybackController extends EventTarget {
    position: number;
    duration: number;

    youtubePlayer: Player;
    timeline: Timeline;

    playbackInterval;

    playing: boolean = false;

    constructor(player: Player) {
        super();
        this.position = 0;
        this.youtubePlayer = player;

        this.playbackInterval = setInterval(() => {
            if (this.playing == false) return;
            console.log('playbackTick')
            this.position = this.getCurrentTime();
            this.dispatchEvent(new CustomEvent('playback', { detail: this.position }));
        }, 100);
    }

    stateUpdate(e) {
        if (e.detail == 1) { // playing
            this.onPlay();
        } else if (e.detail == 2) { // paused
            this.onPause();
        }
    }

    getCurrentTime() {
        // @ts-ignore (type info doesn't come through idk why)
        return this.youtubePlayer.getCurrentTime();
    }

    seekTo(seconds, allowSeekAhead) {
        // @ts-ignore
        this.youtubePlayer.seekTo(seconds, allowSeekAhead);
    }

    onPlay() {
        this.playing = true;
        this.dispatchEvent(new CustomEvent('play'));
    }

    onPause() {
        this.position = this.getCurrentTime();
        this.dispatchEvent(new CustomEvent('playback', { detail: this.position }));
        this.dispatchEvent(new CustomEvent('pause'));
        this.playing = false;
    }
}
