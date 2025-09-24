import { ReactElement, useEffect, useState } from "react";
import Timer from "./Timer/Timer";

import "../../style.css";
import Menu from "./Menu/Menu";
import { ADJUSTIMER_WINDOW_PORT_PREFIX, ADJUSTIMER_WINDOW_TYPE_CHECK, ADJUSTIMER_WINDOW_TYPE_READY, CONTENT_SCRIPT_TYPE_UPDATE, STORAGE_KEY_BACKGROUND_COLOR, STORAGE_KEY_TEXT_COLOR } from "../../constants";
import { getBackgroundColor, getCurrentVideo, getPort, getTextColor } from "../atom";
import { useAtom } from "jotai";

export const AdjusTimerWindow = (): ReactElement => {
    const [ currentVideo, setCurrentVideo ] = useAtom(getCurrentVideo);
    const [ port, setPort ] = useAtom(getPort);
    const [ backgroundColor, setBackgroundColor ] = useAtom(getBackgroundColor);
    const [ textColor, setTextColor ] = useAtom(getTextColor);

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
                console.log("AdjusTimer Window: port interval access.");
                port.postMessage({action: ADJUSTIMER_WINDOW_TYPE_CHECK});
            }
        }, 25 * 1000);

        return  () => clearInterval(offscreen)
    }, [port])

    useEffect(() => {
        // カラーピッカーの情報を取得
        chrome.storage.local.get([STORAGE_KEY_BACKGROUND_COLOR, STORAGE_KEY_TEXT_COLOR], (value) => {
            setBackgroundColor(value[STORAGE_KEY_BACKGROUND_COLOR]);
            setTextColor(value[STORAGE_KEY_TEXT_COLOR]);
        });
    }, [])

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
                    isAdBreak: response.isAdBreak,
                    adBreakRemainTime: response.adBreakRemainTime,
                }
                setCurrentVideo(updateVideoState);
                break;
            default:
                break;
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <Timer />
            <Menu />
        </div>
    )
}