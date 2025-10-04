export interface VideoState {
    title: string | null | undefined,
    subTitle: string | null | undefined,
    currentTime: string,
    url: string,
    pageType: string,
    isAdBreak: boolean,
    adBreakRemainTime: string,
}

export interface updateVideoPayload {
    currentLocation: Location,
    currentTime: number | undefined,
    isAdBreak: boolean,
    adBreakRemainTime: string,
}

export class TabInfo {
    id: number | undefined;
    title: string | undefined;
    activeTab: boolean | undefined;
}

export const CONTENT_SCRIPT_TYPE_UPDATE = "update";
export const ADJUSTIMER_WINDOW_PORT_PREFIX = "event_AdjusTimer";
export const REGEX_ADJUSTIMER_WINDOW_PORT = new RegExp(ADJUSTIMER_WINDOW_PORT_PREFIX);
export const ADJUSTIMER_WINDOW_TYPE_READY = "ready_adjustimer";
export const ADJUSTIMER_WINDOW_TYPE_CLOSE = "close_adjustimer";
export const ADJUSTIMER_WINDOW_SET_TAB_ID = "set_tab_id_adjustimer";
export const ADJUSTIMER_WINDOW_UPDATE = "update_adjustimer";
export const ADJUSTIMER_WINDOW_TYPE_CHECK = "check_service_worker";

export const VIDEO_NAME_DANIME = 'dAnime';
export const VIDEO_NAME_AMAZON_PRIME = 'AmazonPrime';
export const VIDEO_NAME_YOUTUBE = 'Youtube';
export const URL_TYPE_NOT_FOUND: string = 'notFound';
export const TITLE_NOT_FOUND = "動画の更新等をお試しください。";

export const MODE_CREATE_WINDOW: string = 'CREATE_WINDOW';
export const MODE_RELOAD_WINDOW: string = 'MODE_RELOAD_WINDOW';
export const MODE_UPDATE_TO_CONTENT_SCRIPT: string = 'MODE_UPDATE_TO_CONTENT_SCRIPT';

export const REGEX_URL_DANIME = new RegExp("https://animestore.docomo.ne.jp/animestore/sc_d_pc=*");
export const REGEX_URL_AMAZON_PRIME = new RegExp("https://www.amazon.co.jp/gp/video/*");
export const REGEX_URL_YOUTUBE = new RegExp("https://www.youtube.com/watch*");

export const STORAGE_KEY_BACKGROUND_COLOR = "AdjusTimer_backgroundColor";
export const STORAGE_KEY_TEXT_COLOR = "AdjusTimer_textColor";

export const DEFAULT_BACKGROUND_COLOR = "#e2e8f0";
export const DEFAULT_TEXT_COLOR = "#000000";

export const isTargetUrl = (url: string | undefined) => {
    if (!url) return false;
    let isSuccess: boolean = false;
    switch(true) {
        case REGEX_URL_DANIME.test(url):
        case REGEX_URL_AMAZON_PRIME.test(url):
        case REGEX_URL_YOUTUBE.test(url):
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

/**
 * "hh:mm:ss" 形式の文字列を秒数に変換する
 * @param {string} timeStr - "xx:yy:zz" 形式の文字列
 * @returns {number} 秒数
 */
export const timeStringToSeconds = (timeStr: string) => {
  const parts = timeStr.split(":").map(Number);

  // 桁数に応じて計算 (例: "mm:ss", "hh:mm:ss" 両対応)
  if (parts.length === 3) {
    const [hh, mm, ss] = parts;
    return hh * 3600 + mm * 60 + ss;
  } else if (parts.length === 2) {
    const [mm, ss] = parts;
    return mm * 60 + ss;
  } else if (parts.length === 1) {
    return parts[0]; // 秒だけ
  } else {
    throw new Error("Invalid time format: " + timeStr);
  }
}

const diffMinutes = (currentTime: string, durationTime: string) => {
  const [ch, cm] = currentTime.split(':').map(Number);
  const [fh, fm] = durationTime.split(':').map(Number);

  const currentTotal = ch * 60 + cm;
  const fullTotal = fh * 60 + fm;

  return fullTotal - currentTotal;
}

export const diffTimeFormat = (currentTime: string | undefined | null, durationTime: string | undefined | null) => {
  if (!currentTime || !durationTime) return "00:00";

  const diff = diffMinutes(currentTime, durationTime);

  const sign = diff < 0 ? "-" : "";
  const abs = Math.abs(diff);

  const h = Math.floor(abs / 60);
  const m = abs % 60;

  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}