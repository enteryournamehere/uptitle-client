export default interface SubtitleInfo {
    id?: number;
    focus?: boolean;
    start: number;
    end: number;
    text: string;
    prev_values?: {
        start: number;
        end: number;
        text: string;
    };
}
