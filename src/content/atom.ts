import { atom } from "jotai";
import {
    REGEX_URL_DANIME,
    secondToTimeString,
    updateVideoPayload,
    URL_TYPE_NOT_FOUND,
    VIDEO_NAME_DANIME,
    VideoState
} from "../constants";

export const initialVideoState: VideoState = {
    title: '「情報を更新」か、ページを更新してAdjusTimerを再起動をしてください.',
    subTitle: '',
    currentTime: '00:00:00',
    url: '',
    pageType: URL_TYPE_NOT_FOUND
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
            default:
                targetVideoTitle = '未取得';
                break;
        }
        newVideo.title = targetVideoTitle;
        newVideo.subTitle = targetVideoSubTitle;
        newVideo.url = update.currentLocation.href;
        newVideo.currentTime = secondToTimeString(
            update.currentTime ? update.currentTime : 0
        );

        set(videoAtom, newVideo);
    },
);