let adjusTimerWindow;
let connectionPort;

chrome.runtime.onInstalled.addListener(function(){
    // メニューを生成
    const parent_menu = chrome.contextMenus.create({
        type: "normal",
        id: "parent",
        title: "AdjusTimer(アジャスタイマー)"
    });
});
chrome.contextMenus.onClicked.addListener(function(item){
    adjusTimerWindow = window.open(
        "/adjustimer.html",
        "adjustimer",
        "width=1000, height=1000"
    );
    if (connectionPort) {
        // adjusTimer起動をcontent_scriptに送信
        connectionPort.postMessage({
            name: "create_adjustimer"
        });
    }
});

// content_scriptとコネクションをはる
chrome.runtime.onConnect.addListener((port) => {
    // init_connection時にポートを記録する
    connectionPort = port;
    // content_scriptからpostを受け取る
    port.onMessage.addListener((request) => {
        if (request.name === "update") {
            updateTimerDom(request);
        }
    })
});

/**
 * 
 * @param {Object} update
 * name
 * title
 * totalPlayTime
 * currentTime 
 */
function updateTimerDom(update) {
    if (!adjusTimerWindow) {
        return;
    }

    if (update.type === "init_page") {
        const syncButtonDom = adjusTimerWindow.document.querySelector(".button__sync");
        syncButtonDom.setAttribute("id", "button__get_video_info");
        const currentPageDom = adjusTimerWindow.document.querySelector("#current_page_name");
        currentPageDom.innerText = update.pageType;

        // 情報取得ボタンを押すことでcontent_scriptから情報をもらうようにする
        syncButtonDom.removeEventListener("click", syncVideoInfo);
        syncButtonDom.addEventListener("click", syncVideoInfo, false);
        syncButtonDom.port = connectionPort;
        syncButtonDom.pageType = update.pageType;

    } else if (update.status === "set_video_info") {
        const videoTitleDom = adjusTimerWindow.document.getElementById("video__title"); // ビデオタイトル
        const currentTimeDom = adjusTimerWindow.document.getElementById("video__time_current"); // 現在時間

        videoTitleDom.innerText = update.videoTitle;
        currentTimeDom.innerText = "00:00";
        adjusTimerWindow.document.getElementById("remaining_time_wrapper").style.display = "block";

    } else if (update.status === "time_update") {
        const videoTitleDom = adjusTimerWindow.document.getElementById("video__title"); // ビデオタイトル
        const currentTimeDom = adjusTimerWindow.document.getElementById("video__time_current"); // 現在時間

        videoTitleDom.innerText = update.title;
        currentTimeDom.innerText = update.currentTime;
    }

}

function syncVideoInfo(e) {
    e.target.port.postMessage({
        name: "sync_video_info",
        pageType: e.target.pageType
    })
}