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
            this.position = this.getCurrentTime();
            this.dispatchEvent(new CustomEvent('playback', { detail: this.position }));
        }, 25);
    }

    stateUpdate(e) {
        if (e.detail == 1) { // playing
            this.onPlay();
        } else if (e.detail == 2 || e.detail == 0) { // paused or ended
            this.onPause();
        }
    }

    getCurrentTime() {
        return this.youtubePlayer.getCurrentTime();
    }

    seekTo(seconds, allowSeekAhead) {
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

    play() {
        this.youtubePlayer.play();
    }

    pause() {
        this.youtubePlayer.pause();
    }
}
