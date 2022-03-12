export default interface SubtitleInfo {
    id?: number;
    start: number;
    end: number;
    text: string;
    prev_values?: SubtitleInfo;
}
