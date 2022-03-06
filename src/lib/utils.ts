export function millisecondsToTimestamp(milliseconds, showMs = true) {
    let seconds = Math.floor(milliseconds / 1000)
    let minutes = Math.floor(seconds / 60)
    let loose_seconds = Math.floor(seconds % 60)
    if (!showMs) return `${minutes}:${('00' + loose_seconds).slice(-2)}`

    let loose_milliseconds = Math.round(milliseconds % 1000)
    return `${minutes}:${('00' + loose_seconds).slice(-2)}:${('00' + loose_milliseconds).slice(-3)}`
}
