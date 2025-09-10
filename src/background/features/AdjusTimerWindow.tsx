import { ReactElement, useEffect, useState } from "react";
import Timer from "./Timer/Timer";

import "../../style.css";
import Menu from "./Menu/Menu";
import { ADJUSTIMER_WINDOW_PORT_PREFIX, ADJUSTIMER_WINDOW_TYPE_CHECK, ADJUSTIMER_WINDOW_TYPE_READY, CONTENT_SCRIPT_TYPE_UPDATE, VideoState } from "../../constants";
import { action } from "webextension-polyfill";
import { initialVideoState } from "../../content/atom";

export const AdjusTimerWindow = (): ReactElement => {
    const [ currentVideo, setCurrentVideo ] = useState<VideoState>(initialVideoState);
    const [ port, setPort ] = useState<any>();

    /**
     * service workerとのport接続
     */
    useEffect(() => {
        if (port) {
            port.postMessage({action: ADJUSTIMER_WINDOW_TYPE_READY});
            // service worker から受け取るイベント
            port.onMessage.addListener(onMessageServiceWorker);

            port.onDisconnect.addListener(() => {
                port.onMessage.removeListener(onMessageServiceWorker);
                setPort(undefined);
            })
        } else {
            // service workerとのポート接続
            setupPort();
        }
        // 25秒ごとにsendMessageを呼ぶ(AdjusTimer起動中、service workerの永続化のため)
        const offscreen = setInterval(() => {
            if (port) {
                port.postMessage({action: ADJUSTIMER_WINDOW_TYPE_CHECK});
            }
        }, 25 * 1000);

        return (
            clearInterval(offscreen)
        );
    }, [port])


    const setupPort = () => {
        if (!port) {
            // service workerとのポート接続
            console.log("AdjusTimer: connection port service worker");
            const updatePort = chrome.runtime.connect({name: `${ADJUSTIMER_WINDOW_PORT_PREFIX}_${getRandomInt()}`});
            setPort(updatePort);
        }
    }
    const getRandomInt = () => {
        return Math.floor(Math.random() * 1000);
    }
    // service workerからの受信部
    const onMessageServiceWorker = (response: any) => {
        switch(response.action) {
            case CONTENT_SCRIPT_TYPE_UPDATE:
                const updateVideoState = {
                    title: response.title,
                    subTitle: response.subTitle,
                    url: response.url,
                    currentTime: response.currentTime,
                    pageType: response.pageType,
                    tabTitle: response.tabTitle
                }
                setCurrentVideo(updateVideoState);
                break;
            default:
                break;
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <Timer currentVideo={currentVideo} port={port}/>
            <Menu currentVideo={currentVideo} port={port}/>
        </div>
    )
}