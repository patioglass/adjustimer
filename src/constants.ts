export interface VideoState {
    title: string | null | undefined,
    subTitle: string | null | undefined,
    currentTime: string,
    url: string,
    pageType: string,
    tabTitle: string,
}

export interface updateVideoPayload {
    currentLocation: Location,
    currentTime: number | undefined
}

export class TabInfo {
    id: number | undefined;
    title: string | undefined;
    activeTab: boolean | undefined;
}

export type videoProps = {
    currentVideo: VideoState,
    port: any
}

export const CONTENT_SCRIPT_TYPE_UPDATE = "update";
export const ADJUSTIMER_WINDOW_PORT_PREFIX = "event_AdjusTimer";
export const REGEX_ADJUSTIMER_WINDOW_PORT = new RegExp(ADJUSTIMER_WINDOW_PORT_PREFIX);
export const ADJUSTIMER_WINDOW_TYPE_READY = "ready_adjustimer";
export const ADJUSTIMER_WINDOW_SET_TAB_ID = "set_tab_id_adjustimer";
export const ADJUSTIMER_WINDOW_UPDATE = "update_adjustimer";
export const ADJUSTIMER_WINDOW_TYPE_CHECK = "check_service_worker";

export const VIDEO_NAME_DANIME = 'dAnime';
export const URL_TYPE_NOT_FOUND: string = 'notFound';

export const MODE_CREATE_WINDOW: string = 'CREATE_WINDOW';
export const MODE_RELOAD_WINDOW: string = 'MODE_RELOAD_WINDOW';
export const MODE_UPDATE_TO_CONTENT_SCRIPT: string = 'MODE_UPDATE_TO_CONTENT_SCRIPT';

export const REGEX_URL_DANIME = new RegExp("https://animestore.docomo.ne.jp/animestore/sc_d_pc=*");


export const isTargetUrl = (url: string | undefined) => {
    if (!url) return false;
    let isSuccess: boolean = false;
    switch(true) {
        case REGEX_URL_DANIME.test(url):
            isSuccess = true;
            break;
        default:
            isSuccess = false;
            break;
    }
    return isSuccess;
}

export const secondToTimeString = (sec: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = Math.floor(sec % 60);
    const result = `${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${result}`;
};