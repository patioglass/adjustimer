let adjusTimerWindow;
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
        "width=500, height=500"
    );
});

// Receive message from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === "update") {
        updateTimerDom(request);
    }
    return true;
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
    const alertDom = adjusTimerWindow.document.getElementById("alert"); // 未取得時の文
    const videoTitleDom = adjusTimerWindow.document.getElementById("video__title"); // ビデオタイトル
    const currentTimeDom = adjusTimerWindow.document.getElementById("video__time_current"); // 現在時間
    // const remainingTimeDom = adjusTimerWindow.document.getElementById("video__time_remaining"); // 残り時間

    alertDom.innerText = "";
    videoTitleDom.innerText = update.title;
    currentTimeDom.innerText = update.currentTime;
    // remainingTimeDom.innerText = update.remainingTime;
}