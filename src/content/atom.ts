import { atom } from "jotai";
import {
    REGEX_URL_AMAZON_PRIME,
    REGEX_URL_DANIME,
    REGEX_URL_NETFLIX,
    REGEX_URL_NICONICO,
    REGEX_URL_PRIME_VIDDEO,
    REGEX_URL_TVER,
    REGEX_URL_UNEXT,
    REGEX_URL_YOUTUBE,
    secondToTimeString,
    timeStringToSeconds,
    TITLE_NOT_FOUND,
    updateVideoPayload,
    URL_TYPE_NOT_FOUND,
    VIDEO_NAME_AMAZON_PRIME,
    VIDEO_NAME_DANIME,
    VIDEO_NAME_NETFLIX,
    VIDEO_NAME_NICONICO,
    VIDEO_NAME_TVER,
    VIDEO_NAME_UNEXT,
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
export const updateLocationSignalAtom = atom<number>(0);

export const getVideo = atom(
    (get) => get(videoAtom),
    (get, set, update: updateVideoPayload) => {
        const prevVideo = get(videoAtom);
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
                // タブ名前の変更
                if (targetVideoTitle) {
                    if (document.title !== `${targetVideoTitle} - ${targetVideoSubTitle} | ${newVideo.pageType}`) {
                        document.title = `${targetVideoTitle} - ${targetVideoSubTitle} | ${newVideo.pageType}`;
                    }
                }
                break;
            case REGEX_URL_AMAZON_PRIME.test(update.currentLocation.href):
            case REGEX_URL_PRIME_VIDDEO.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector(".atvwebplayersdk-title-text")
                                    ? document.querySelector(".atvwebplayersdk-title-text")?.textContent
                                    : TITLE_NOT_FOUND
                // 動画ページを開いておらず、詳細ページであればタイトルだけならとってこれる
                if (targetVideoTitle === TITLE_NOT_FOUND) {
                    const primeVideoTitle = document.querySelector('[data-automation-id="title"]');
                    targetVideoTitle = primeVideoTitle
                                    ? primeVideoTitle.textContent
                                    : document.title.match("Prime Video:")
                                        ? document.title.replace("Prime Video: ", "")
                                        : TITLE_NOT_FOUND;
                }
                targetVideoSubTitle = document.querySelector(".dv-player-fullscreen .atvwebplayersdk-episode-info")
                                    ? document.querySelector(".dv-player-fullscreen .atvwebplayersdk-episode-info")?.textContent
                                    : ""
                /**
                 * もしvideoAtom(更新前)とnewVideo(更新後)のタイトルとサブタイトルのどちらかが異なった場合
                 * VideoInfoのupdateLocationを実行する（SPAによるURL変更でタイトルのみが変わることがあるため）
                */
                if (
                    prevVideo.title !== targetVideoTitle ||
                    prevVideo.subTitle !== targetVideoSubTitle
                ) {
                    set(updateLocationSignalAtom, get(updateLocationSignalAtom) + 1);
                }

                // React内部stateをページコンテキストのloaderからhidden DOM経由で受け取る。
                // UIの時間表示は消えるため内部stateを優先し、DOM表示は旧UI向けfallbackにする。
                const adDom = document.querySelector(".atvwebplayersdk-ad-timer-remaining-time");
                const amazonPlaybackState = document.getElementById("adjustimer-amazon-playback-state");
                const amazonCurrentTimeMs = Number(amazonPlaybackState?.getAttribute("data-position-ms"));
                const hasAmazonCurrentTime = amazonPlaybackState?.hasAttribute("data-position-ms")
                    && Number.isFinite(amazonCurrentTimeMs);
                const amazonAdPlaying = amazonPlaybackState?.getAttribute("data-ad-playing") === "true";
                if (amazonAdPlaying || adDom) {
                    adBreakRemainTime = adDom?.textContent || "";
                    isAdBreak = true;
                } else {
                    if (hasAmazonCurrentTime) {
                        updateTime = amazonCurrentTimeMs / 1000;
                    }
                    const primeVideo = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")
                    if (!hasAmazonCurrentTime && primeVideo.length > 0) {
                        const playShowTime: string | null = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")[0].textContent;
                        if (playShowTime) {
                            updateTime = timeStringToSeconds(playShowTime.split("/")[0].trim());
                        }
                    }
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
                targetVideoTitle = document.querySelector("[class^=EpisodeDescription_seriesTitle]")
                                ? document.querySelector("[class^=EpisodeDescription_seriesTitle]")?.textContent
                                : TITLE_NOT_FOUND;
                targetVideoSubTitle = document.querySelector("[class^=EpisodeDescription_title]")
                                    ? document.querySelector("[class^=EpisodeDescription_title]")?.textContent
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
            case REGEX_URL_NETFLIX.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector(".netflixTitle")
                                ? document.querySelector(".netflixTitle")?.textContent
                                : TITLE_NOT_FOUND;
                targetVideoSubTitle = document.querySelector(".netflixSubTitle")
                                    ? document.querySelector(".netflixSubTitle")?.textContent
                                    : "";
                // 広告
                const netflixAdTime = document.querySelector("[data-uia=ads-info-time]");
                if (netflixAdTime && netflixAdTime.textContent) {
                    isAdBreak = true;
                    adBreakRemainTime = secondToTimeString(timeStringToSeconds(netflixAdTime.textContent));
                }
                // NetflixはvideoのcurrentTimeで時間を図っていないため、内部オブジェクトから再生時間を取得する
                const currentTimeNetflix = document.querySelector(".netflixCurrentTime");
                if (currentTimeNetflix) {
                    updateTime = Number(currentTimeNetflix.textContent);
                }

                /**
                 * もしvideoAtom(更新前)とnewVideo(更新後)のタイトルとサブタイトルのどちらかが異なった場合
                 * VideoInfoのupdateLocationを実行する（SPAによるURL変更でタイトルのみが変わることがあるため）
                */
                if (
                    prevVideo.title !== targetVideoTitle ||
                    prevVideo.subTitle !== targetVideoSubTitle
                ) {
                    set(updateLocationSignalAtom, get(updateLocationSignalAtom) + 1);
                }

                newVideo.pageType = VIDEO_NAME_NETFLIX;
                // タブ変更はnetflixはpublic/adjustimer-netflix-loader.jsで行う
                break;
            case REGEX_URL_UNEXT.test(update.currentLocation.href):
                targetVideoTitle = document.querySelector("h2[class^=styles__Title]")
                                ? document.querySelector("h2[class^=styles__Title]")?.textContent
                                : "";
                targetVideoSubTitle = document.querySelector("h3[class^=styles__SubTitle]")
                                ? document.querySelector("h3[class^=styles__SubTitle]")?.textContent
                                : "";
                newVideo.pageType = VIDEO_NAME_UNEXT;
                // タブ名前の変更
                if (targetVideoTitle) {
                    if (document.title === "再生 | U-NEXT") {
                        document.title = `${targetVideoTitle} - ${targetVideoSubTitle} | ${newVideo.pageType}`;
                    }
                }
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
