import { atom } from "jotai";
import {
    REGEX_URL_AMAZON_PRIME,
    REGEX_URL_DANIME,
    REGEX_URL_YOUTUBE,
    secondToTimeString,
    TITLE_NOT_FOUND,
    updateVideoPayload,
    URL_TYPE_NOT_FOUND,
    VIDEO_NAME_AMAZON_PRIME,
    VIDEO_NAME_DANIME,
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
                newVideo.pageType = VIDEO_NAME_AMAZON_PRIME;
                break;
            case REGEX_URL_YOUTUBE.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector("h1.ytd-watch-metadata") && document.querySelector("h1.ytd-video-primary-info-renderer")
                                    ? document.querySelector("h1.ytd-video-primary-info-renderer")?.textContent
                                    : TITLE_NOT_FOUND;
                targetVideoSubTitle = "";
                newVideo.pageType = VIDEO_NAME_YOUTUBE;
                break;
            default:
                targetVideoTitle = TITLE_NOT_FOUND;
                break;
        }
        newVideo.title = targetVideoTitle;
        newVideo.subTitle = targetVideoSubTitle;
        newVideo.url = update.currentLocation.href;
        if (!update.isAdBreak) {
            newVideo.currentTime = secondToTimeString(
                update.currentTime ? update.currentTime : 0
            );
        }
        newVideo.isAdBreak = update.isAdBreak;
        newVideo.adBreakRemainTime = update.adBreakRemainTime;

        set(videoAtom, newVideo);
    },
);