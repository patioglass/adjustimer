import browser from 'webextension-polyfill';
import { CONTENT_SCRIPT_TYPE_UPDATE } from '../constants';

let vid = -1;
let currentTabId: number | undefined;

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
        currentTabId = tab?.id;
        // Content Script側との通信を切断する

        // AdjusTimerのWindowを新規で作る
        chrome.windows.create({
                url : 'src/background/adjustimer.html',
                focused : true,
                type : 'popup',
                height : 910,
                width : 1000
            },
            (window: any) => {
                // 新規作成した AdjusTimer を使い回せるようにするため、
                // vid 変数に window の id を保持しておく
                vid = window.id;

                // AdjusTimerWindow側との通信(AdjusTimerWindow ⇒ service worker)
                // Content Script側との通信(Content-Script ⇒ service worker)
                chrome.runtime.onMessage.addListener(onConnectContentScript);

                // ウィンドウが閉じたらコネクションを切る
                chrome.windows.onRemoved.addListener((vid) => {
                    console.log("Close AdjusTimerWindow.");
                })
            }
        );
    });
});

/**
 * chrome.runtime.onMessage.addListener(Content-Script ⇒ service worker)で実行する
 */
const onConnectContentScript = (message: any, sender: any, sendResponse: any) => {
    console.log(`recieve content script.Type: ${message.action}`);
    switch(message.action) {
        case CONTENT_SCRIPT_TYPE_UPDATE:
            // AdjusTimer Window側 に更新を伝える
            break;
        default:
            break;
    }
    sendResponse();
    return true;
}