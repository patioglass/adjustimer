import { useAtom } from "jotai";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getVideo } from "../atom";
import {
    ADJUSTIMER_WINDOW_TYPE_CLOSE,
    ADJUSTIMER_WINDOW_TYPE_READY,
    ADJUSTIMER_WINDOW_UPDATE,
    REGEX_URL_DANIME,
    VideoState,
} from "../../constants";
import { useMutationObserver } from "../hooks";

let isAdjusTimer = false;

const VideoInfo = (): ReactElement => {
    const [ video, setVideo ] = useAtom(getVideo); // AdjusTimer側に送るvideo情報
    const [ videoElement, setVideoElement ] = useState<HTMLVideoElement>(); // 現在ウォッチしているvideo要素

    const [ updateFlag, setUpdateFlag ] = useState<boolean>(false); // 何かしらの更新をAdjusTimerから受け取った場合にスイッチ
    const urlRef = useRef(location);
    const [ currentLocation, setCurrentLocation ] = useState<Location>(urlRef.current); // 現在のページ

    // headタグの変化でページ移動を検出、変化があった場合に updateFlag を更新
    const updateLocation = (): void => {
        setCurrentLocation(location);
    }
    useMutationObserver(document.head, updateLocation);

    /**
     *
     * ・ページ移動が起きる(Locationの変更) 
     * ・updateFlagの更新(service workerからの更新通知) 
     * ⇒ video の 更新を行う
     *
     */
    useEffect(() => {
        // 現在のページのvideo要素を取得しなおす
        const currentVideoElement = getVideoElement(currentLocation);
        if (currentVideoElement) {
            console.log("Content script: Reflesh video.")
            // videoElement の更新
            setVideoElement(currentVideoElement);
            updateVideo();
        }
    }, [currentLocation, updateFlag]);

    /**
     *
     * video の 更新があった際に
     * content script ⇒ service workerに動画情報を送信する
     *
     */
    const updateVideo = (): void => {
        if (!isAdjusTimer) return;

        setVideo({
            currentLocation: currentLocation,
            currentTime: videoElement?.currentTime
        });
        const updateVideoState: VideoState = {
            title: video.title,
            subTitle: video.subTitle,
            url: video.url,
            currentTime: video.currentTime,
            pageType: video.pageType,
            tabTitle: video.tabTitle
        }
        chrome.runtime.sendMessage(
            Object.assign({action: "update"}, updateVideoState)
        );
    }
    /**
     *
     * 動画の対象 videoElement が変わった際に、時間の更新 timeupdate の eventListener 登録しなおす
     * addEventListener('timeupdate')
     *
     */
      useEffect(() => {
        console.log("Content script: update video Element.");
        if (videoElement) {
            console.log("Content script: start timeupdate.")
            videoElement.removeEventListener('timeupdate', updateVideo);
            videoElement.addEventListener('timeupdate', updateVideo);
        }
    }, [videoElement]);

    /**
     * 現ページのvideo要素を取得する
     * @param {Location} location 現在のlocation情報
     * @param {HTMLVideoElement | null | undefined} targetVideo 取得できたvideo要素
     */
    const getVideoElement = (location: Location): HTMLVideoElement | null | undefined => {
        let targetVideo: HTMLVideoElement | null | undefined;
        switch(true) {
            case REGEX_URL_DANIME.test(location.href):
                targetVideo = document.querySelector("video");
                break;
            default:
                break;
        }
        return targetVideo;
    }

    /**
     * content script ⇐ service workerから受信部を最初に定義
     * AdjusTimerが起動する
     * AdjusTimerから「情報を取得する」が押下される etc...
     */
    useEffect(() => {
        setVideo({
            currentLocation: currentLocation,
            currentTime: 0
        });
        chrome.runtime.onMessage.addListener(onMessageServiceWorker);
        return () => {
            chrome.runtime.onMessage.removeListener(onMessageServiceWorker);
        }
    }, []);

    useEffect(() => {
        if (video.title) {
            document.title = `${video.title} | ${video.subTitle}`;
        }
    }, [video])

    const onMessageServiceWorker = (message: any) => {
        // service workerからのaction別に処理する
        console.log(`Content Script: receive service worker.Type: ${message.action}`);
        switch(message.action) {
            case ADJUSTIMER_WINDOW_TYPE_READY:
                isAdjusTimer = true;
                break;
            case ADJUSTIMER_WINDOW_UPDATE:
                isAdjusTimer = true;
                // videoElementを更新させ、updateVideoを発火させる
                setUpdateFlag((updateFlag) => !updateFlag);
                break;
            case ADJUSTIMER_WINDOW_TYPE_CLOSE:
                isAdjusTimer = false;
                break;
            default:
                break;
        }
    }
    return (
        <>
        </>
    )
}

export default VideoInfo;