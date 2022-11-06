let adjusTimerWindow;
let connectionPort;
let adjusTimerWindowPort;

checkPort();

chrome.runtime.onInstalled.addListener(function(){
    // メニューを生成
    const parent_menu = chrome.contextMenus.create({
        type: "normal",
        id: "parent",
        title: "AdjusTimer(アジャスタイマー)"
    });
});

chrome.contextMenus.onClicked.addListener(async function(item, tab){
    const window = chrome.windows.create({
        url : './adjustimer.html',
        focused : true,
        type : 'popup',
        height : 1000,
        width : 1000
    });
});

// content_script, adjustimer側の2つのコネクションをはる
chrome.runtime.onConnect.addListener((port) => {
    if (port.name.match(/contentScript/)) {
        if (connectionPort) {
            connectionPort.disconnect();
        }
        // init_connection時にポートを記録する
        connectionPort = port;
        // content_scriptからpostを受け取る
        port.onMessage.addListener((request) => {
            if (request.name === "update") {
                updateTimerDom(request);
            }
        })
        port.onDisconnect.addListener(() => {
            connectionPort = undefined;
            if (adjusTimerWindowPort) {
                adjusTimerWindowPort.postMessage({
                    name: "init"
                });
            }
            checkPort();
        })
    } else {
        if (adjusTimerWindowPort) {
            adjusTimerWindowPort.disconnect()
        }
        adjusTimerWindowPort = port;
        port.onMessage.addListener((request) => {
            if (request.type === "get_video_info") {
                connectionPort.postMessage({
                    name: "sync_video_info",
                    pageType: request.pageType
                })
            }
        })
        port.onDisconnect.addListener(() => {
            adjusTimerWindowPort = undefined;
            checkPort();
        })
    }
});

function checkPort() {
    const check = setInterval(() => {
        if (connectionPort && adjusTimerWindowPort) {
            // adjusTimer起動をcontent_scriptに送信
            connectionPort.postMessage({
                name: "create_adjustimer"
            });
            clearInterval(check);
        }
    }, 500);
}

/**
 * 
 * @param {Object} update
 * name
 * title
 * totalPlayTime
 * currentTime 
 */
function updateTimerDom(update) {
    if (!adjusTimerWindowPort) {
        return;
    }

     // adjustimerのDOM変更
    if (update.type === "init_page") {
        adjusTimerWindowPort.postMessage({
            name: "sync_video_ready",
            pageType: update.pageType
        });

    } else if (update.status === "set_video_info") {
        adjusTimerWindowPort.postMessage({
            name: "set_video_info",
            videoTitle: update.videoTitle,
            videoUrl: update.videoUrl,
            pageType: update.pageType
        })
    } else if (update.status === "time_update") {
        adjusTimerWindowPort.postMessage({
            name: "update_video_time",
            title: update.title,
            currentTime: update.currentTime
        })
    }
}