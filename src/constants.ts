export interface VideoState {
    title: string | null | undefined,
    subTitle: string | null | undefined,
    currentTime: string,
    url: string,
    pageType: string,
}

export interface updateVideoPayload {
    currentLocation: Location,
    currentTime: number | undefined
}

export const CONTENT_SCRIPT_TYPE_UPDATE = "update";

export const VIDEO_NAME_DANIME = 'dAnime';
export const URL_TYPE_NOT_FOUND: string = 'notFound';

export const MODE_CREATE_WINDOW: string = 'CREATE_WINDOW';
export const MODE_RELOAD_WINDOW: string = 'MODE_RELOAD_WINDOW';
export const MODE_UPDATE_TO_CONTENT_SCRIPT: string = 'MODE_UPDATE_TO_CONTENT_SCRIPT';

export const REGEX_URL_DANIME = new RegExp("https://animestore.docomo.ne.jp/animestore/sc_d_pc*");

export const secondToTimeString = (sec: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = Math.floor(sec % 60);
    const result = `${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${result}`;
};