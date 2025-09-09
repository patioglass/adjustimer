import { useAtom } from "jotai";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getVideo } from "../atom";
import {
    REGEX_URL_DANIME,
} from "../../constants";
import { useMutationObserver } from "../hooks";

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
        console.log("Content script: Reflesh video.")
        // 現在のページのvideo要素を取得しなおす
        const currentVideoElement = getVideoElement(currentLocation);
        if (currentVideoElement) {
            if (videoElement) {
                // すでに、videoElementが定義されている場合、eventlisnerを削除する
                console.log("Content script: close timeupdate.")
                videoElement.removeEventListener("timeupdate", updateVideo);
            }
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
        setVideo({
            currentLocation: currentLocation,
            currentTime: videoElement?.currentTime
        });
        console.log("Content script: video update.")
        chrome.runtime.sendMessage(
            {
                action: "update",
                title: video.title,
                subTitle: video.subTitle,
                url: video.url,
                currentTime: video.currentTime,
                pageType: video.pageType
            }
        );
    }
    /**
     *
     * 動画の対象 videoElement が変わった際に、時間の更新 timeupdate の eventListener 登録しなおす
     * addEventListener('timeupdate')
     *
     */
      useEffect(() => {
        console.log("Content script: start timeupdate.")

        if (videoElement) {
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
        chrome.runtime.onMessage.addListener(onMessageServiceWorker);
        return () => {
            chrome.runtime.onMessage.removeListener(onMessageServiceWorker);
        }
    }, []);

    const onMessageServiceWorker = async (message: any) => {
        // service workerからのtype別に処理する
    }
    return (
        <>
        </>
    )
}

export default VideoInfo;