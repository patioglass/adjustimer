import browser from 'webextension-polyfill';
import { ADJUSTIMER_WINDOW_SET_TAB_ID, ADJUSTIMER_WINDOW_TYPE_CLOSE, ADJUSTIMER_WINDOW_TYPE_READY, ADJUSTIMER_WINDOW_UPDATE, CONTENT_SCRIPT_TYPE_UPDATE, MODE_CREATE_WINDOW, REGEX_ADJUSTIMER_WINDOW_PORT } from '../constants';

let vid = -1;
let currentTabId: string | undefined;
let adjusTimerWindowPort: any;

browser.runtime.onInstalled.addListener(() => {
    // メニューを生成
    const parent_menu = chrome.contextMenus.create({
        type: "normal",
        id: "parent",
        title: "AdjusTimer(アジャスタイマー)v3",
        contexts: [ "all" ]
    });
});

// 右クリックメニューからAdjusTimerを起動
chrome.contextMenus.onClicked.addListener(async (item, tab) => {
    chrome.windows.get(vid, (chromeWindow) => {

        // エラーが無く、既に AdjusTimer が存在している場合は、
        // そのステータスを { focused: true } にすることで最前面に呼び出す
        if (!chrome.runtime.lastError && chromeWindow) {
            chrome.windows.update(vid, { focused: true });
            return;
        }

        // AdjusTimerのWindowを新規で作る
        chrome.windows.create({
                url : 'src/background/adjustimer.html',
                focused : true,
                type : 'popup',
                height : 940,
                width : 1000
            },
            (window: any) => {
                // 新規作成した AdjusTimer を使い回せるようにするため、
                // vid 変数に window の id を保持しておく
                vid = window.id;

                // AdjusTimerWindow側との通信(AdjusTimerWindow ⇒ service worker)
                chrome.runtime.onConnect.addListener(onConnectAdjusTimerWindow);

                // ウィンドウが閉じたらコネクションを切る
                chrome.windows.onRemoved.addListener((closeWindowId) => {
                    if (vid === closeWindowId) {
                        console.log("Close AdjusTimerWindow.");
                        adjusTimerWindowPort = undefined;
                        currentTabId = undefined;
                        if (adjusTimerWindowPort) {
                            adjusTimerWindowPort.onMessage.removeEventListener(onMessageAdjusTimer);
                        }
                    }
                })
            }
        );
    });
});

/**
 * chrome.runtime.onMessage.addListener(Content-Script ⇒ service worker)で実行する
 */
const onConnectContentScript = (message: any, sender: any, sendResponse: any) => {
    if (currentTabId && currentTabId != sender.tab.id) return;

    switch(message.action) {
        case CONTENT_SCRIPT_TYPE_UPDATE:
            // AdjusTimer Window側 に更新を伝える
            if (!adjusTimerWindowPort) {
                sendResponse();
                return;
            }
            adjusTimerWindowPort.postMessage({
                action: CONTENT_SCRIPT_TYPE_UPDATE,
                title: message.title,
                subTitle: message.subTitle,
                url: message.url,
                currentTime: message.currentTime,
                pageType: message.pageType
            });
            break;
        default:
            break;
    }
    sendResponse();
    return true;
}

// Content Script側との通信(Content-Script ⇒ service worker)
chrome.runtime.onMessage.addListener(onConnectContentScript);

/**
 * chrome.runtime.onMessage.addListener(AdjusTimer Window ⇒ service worker)で実行する
 */
const onMessageAdjusTimer = (message: any, sender: any, sendResponse: any) => {
    switch(message.action) {
        case ADJUSTIMER_WINDOW_TYPE_READY:
            // AdjusTimerが起動され、接続が確立したことを、content_scriptに伝える
            if (currentTabId) {
                // (service worker ⇒ Content-Script)で実行する
                console.log(`Service Worker: setup complete AdjusTimer.`);
                chrome.tabs.sendMessage(parseInt(currentTabId), message).then(() => {})
            }
            break;
        case ADJUSTIMER_WINDOW_SET_TAB_ID:
            // AdjusTimer側でウォッチするタブを決定
            // content_scriptのうち、指定したタブからの更新情報のみを受け取れるようにする
            currentTabId = message.tabId;
            console.log(`Service Worker: update currentTabId (${currentTabId})`);
            break;
        case ADJUSTIMER_WINDOW_UPDATE:
            if (currentTabId) {
                // (service worker ⇒ Content-Script)で実行する
                console.log(`Service Worker: update video to content script.`);
                chrome.tabs.sendMessage(parseInt(currentTabId), message).then(() => {})
            }
            break;
        default:
            break;
    }
    return true;
}

const onConnectAdjusTimerWindow = (port: any) => {
    if (port.name.match(REGEX_ADJUSTIMER_WINDOW_PORT)) {
        adjusTimerWindowPort = port;

        // AdjusTimerWindow側からの受信部
        adjusTimerWindowPort.onMessage.addListener(onMessageAdjusTimer);
        adjusTimerWindowPort.onDisconnect.addListener(() => {
            console.log("disconnect adjustimer")
            adjusTimerWindowPort = undefined;
            if (currentTabId) {
                // (service worker ⇒ Content-Script)で実行する
                console.log(`Service Worker: close AdjusTimer send to content script.`);
                chrome.tabs.sendMessage(parseInt(currentTabId), {action: ADJUSTIMER_WINDOW_TYPE_CLOSE}).then(() => {})
            }
            currentTabId = undefined;
        })
    }
    return true;
}
