import { atom } from "jotai";
import {
    REGEX_URL_AMAZON_PRIME,
    REGEX_URL_DANIME,
    REGEX_URL_NICONICO,
    REGEX_URL_TVER,
    REGEX_URL_YOUTUBE,
    secondToTimeString,
    timeStringToSeconds,
    TITLE_NOT_FOUND,
    updateVideoPayload,
    URL_TYPE_NOT_FOUND,
    VIDEO_NAME_AMAZON_PRIME,
    VIDEO_NAME_DANIME,
    VIDEO_NAME_NICONICO,
    VIDEO_NAME_TVER,
    VIDEO_NAME_YOUTUBE,
    VideoState
} from "../constants";

export const initialVideoState: VideoState = {
    title: '動画ページを開いてください。',
    subTitle: '',
    currentTime: '00:00:00',
    url: '',
    pageType: URL_TYPE_NOT_FOUND,
    isAdBreak: false,
    adBreakRemainTime: "0:00"
}

export const currentUrl = atom<string>();
export const videoAtom = atom<VideoState>(initialVideoState);

export const getVideo = atom(
    (get) => get(videoAtom),
    (get, set, update: updateVideoPayload) => {
        let newVideo = get(videoAtom);
        // タイトルを取得する
        let targetVideoTitle;
        let targetVideoSubTitle;
        let updateTime: number | undefined = update.currentTime;
        let isAdBreak: boolean = false;
        let adBreakRemainTime: string = "";

        switch(true) {
            case REGEX_URL_DANIME.test(update.currentLocation.href):
                const backInfo = document.querySelector('#backInfo');
                const title = backInfo?.querySelector('.backInfoTxt1')?.textContent;
                const epNum = backInfo?.querySelector('.backInfoTxt2')?.textContent;
                const epTitle = backInfo?.querySelector('.backInfoTxt3')?.textContent;

                targetVideoTitle = `${title}`;
                targetVideoSubTitle = `${epNum} ${epTitle}`
                newVideo.pageType = VIDEO_NAME_DANIME;
                break;
            case REGEX_URL_AMAZON_PRIME.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector(".dv-player-fullscreen .atvwebplayersdk-title-text")
                                    ? document.querySelector(".dv-player-fullscreen .atvwebplayersdk-title-text")?.textContent
                                    : TITLE_NOT_FOUND
                targetVideoSubTitle = document.querySelector(".dv-player-fullscreen .atvwebplayersdk-subtitle-text")
                                    ? document.querySelector(".dv-player-fullscreen .atvwebplayersdk-subtitle-text")?.textContent
                                    : ""

                // メモ: ウォッチパーティのように他の人と同期したい場合、一度currentTime合わせた後に、表示時間のずれた分をさらに再計算して再配置するしかなさそう
                // Amazonは広告がない場合に、表示時間のDOMを取得して表示する
                const adDom = document.querySelector(".atvwebplayersdk-ad-timer-remaining-time");
                if (!adDom) {
                    const primeVideo = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")
                    if (primeVideo.length > 0) {
                        const playShowTime: string | null = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")[0].textContent;
                        if (playShowTime) {
                            updateTime = timeStringToSeconds(playShowTime.split("/")[0].trim());
                        }
                    }
                } else {
                    adBreakRemainTime = adDom.textContent ? adDom.textContent : "";
                    isAdBreak = true;
                }
                if (targetVideoTitle === TITLE_NOT_FOUND) {
                    isAdBreak = false;
                }
                newVideo.pageType = VIDEO_NAME_AMAZON_PRIME;
                break;
            case REGEX_URL_YOUTUBE.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector("h1.ytd-watch-metadata") && document.querySelector("h1.ytd-video-primary-info-renderer")
                                    ? document.querySelector("h1.ytd-video-primary-info-renderer")?.textContent
                                    : TITLE_NOT_FOUND;
                targetVideoSubTitle = "";

                // 広告
                if (document.querySelector(".video-ads")?.innerHTML && targetVideoTitle != TITLE_NOT_FOUND) {
                    const adVideo: HTMLVideoElement | null = document.querySelector("video")
                    if (adVideo) {
                        adBreakRemainTime = secondToTimeString(adVideo.duration - adVideo.currentTime);
                    }
                    isAdBreak = true;
                }
                newVideo.pageType = VIDEO_NAME_YOUTUBE;
                break;
            case REGEX_URL_NICONICO.test(update.currentLocation.href):
                const titleMeta: HTMLMetaElement | null = document.querySelector("[property$=title][content]");
                targetVideoTitle = titleMeta?.content;
                targetVideoSubTitle = "";

                // 広告
                const nicoAdVideos = document.querySelectorAll<HTMLVideoElement>("video[title='Advertisement']");
                for (const ad of nicoAdVideos) {
                    if (!ad.paused && ad.duration) {
                        adBreakRemainTime = secondToTimeString(ad.duration - ad.currentTime);
                    }
                }
                if (document.querySelectorAll("#nv_watch_VideoAdContainer div div[style='display: block;']").length > 0) {
                    isAdBreak = true;
                } else {
                    isAdBreak = false;
                }

                newVideo.pageType = VIDEO_NAME_NICONICO;
                break;
            case REGEX_URL_TVER.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector("[class^=titles_seriesTitle]")
                                ? document.querySelector("[class^=titles_seriesTitle]")?.textContent
                                : TITLE_NOT_FOUND;
                targetVideoSubTitle = document.querySelector("[class^=titles_title]")
                                    ? document.querySelector("[class^=titles_title]")?.textContent
                                    : "";
                // 広告
                const tverAdVideos = document.querySelectorAll<HTMLVideoElement>("video[title='Advertisement']");
                for (const ad of tverAdVideos) {
                    if (!ad.paused && ad.duration) {
                        adBreakRemainTime = secondToTimeString(ad.duration - ad.currentTime);
                    }
                }
                if (document.querySelectorAll(".strp-ad-player div div[style='display: block;']").length > 0) {
                    isAdBreak = true;
                } else {
                    isAdBreak = false;
                }
                newVideo.pageType = VIDEO_NAME_TVER;
                break;
            default:
                targetVideoTitle = TITLE_NOT_FOUND;
                break;
        }
        newVideo.title = targetVideoTitle;
        newVideo.subTitle = targetVideoSubTitle;
        newVideo.url = update.currentLocation.href;
        if (!isAdBreak) {
            newVideo.currentTime = secondToTimeString(
                updateTime ? updateTime : 0
            );
        }
        newVideo.isAdBreak = isAdBreak;
        newVideo.adBreakRemainTime = adBreakRemainTime;

        set(videoAtom, newVideo);
    },
);