import { useAtom } from "jotai";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getVideo } from "../atom";
import {
    ADJUSTIMER_WINDOW_TYPE_CLOSE,
    ADJUSTIMER_WINDOW_TYPE_READY,
    ADJUSTIMER_WINDOW_UPDATE,
    CONTENT_SCRIPT_TYPE_UPDATE,
    diffTimeFormat,
    REGEX_URL_AMAZON_PRIME,
    REGEX_URL_DANIME,
    REGEX_URL_YOUTUBE,
    timeStringToSeconds,
    VIDEO_NAME_AMAZON_PRIME,
    VIDEO_NAME_YOUTUBE,
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
        console.log("Content Script: change location.");
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

        let updateTime: number | undefined = 0;
        let isAdBreak: boolean = false;
        let adBreakRemainTime: string = "";

        // 広告の有無、amazon primeの特殊処理などの分岐
        switch(video.pageType) {
            case VIDEO_NAME_AMAZON_PRIME:
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
                break;
            case VIDEO_NAME_YOUTUBE:
                if (document.querySelector(".video-ads")?.innerHTML) {
                    adBreakRemainTime = diffTimeFormat(
                        document.querySelector(".ytp-time-current")?.textContent,
                        document.querySelector(".ytp-time-duration")?.textContent
                    );
                    isAdBreak = true;
                }
                updateTime = videoElement?.currentTime;
                break;
            default:
                updateTime = videoElement?.currentTime;
                break;

        }

        setVideo({
            currentLocation: currentLocation,
            currentTime: updateTime,
            isAdBreak: isAdBreak,
            adBreakRemainTime: adBreakRemainTime
        });
        const updateVideoState: VideoState = {
            title: video.title,
            subTitle: video.subTitle,
            url: video.url,
            currentTime: video.currentTime,
            pageType: video.pageType,
            isAdBreak: video.isAdBreak,
            adBreakRemainTime: video.adBreakRemainTime,
        }
        chrome.runtime.sendMessage(
            Object.assign({action: CONTENT_SCRIPT_TYPE_UPDATE}, updateVideoState)
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
            case REGEX_URL_YOUTUBE.test(location.href):
                targetVideo = document.querySelector("video");
                break;
            case REGEX_URL_AMAZON_PRIME.test(location.href):
                const primeVideo = document.querySelector(".dv-player-fullscreen");
                if (primeVideo) {
                    targetVideo = primeVideo.querySelector("video");
                }
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
            currentTime: 0,
            isAdBreak: false,
            adBreakRemainTime: "0:00"
        });
        chrome.runtime.onMessage.addListener(onMessageServiceWorker);
        return () => {
            chrome.runtime.onMessage.removeListener(onMessageServiceWorker);
        }
    }, []);

    useEffect(() => {
        // dアニメは「動画再生」がデフォルトなので、名前を変える
        if (video.title) {
            if (REGEX_URL_DANIME.test(currentLocation.href)) {
                document.title = `${video.title} | ${video.subTitle}`;
            }
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