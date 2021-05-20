const PAGE_TYPE_NAMES = {
    "PrimeVideo": "PrimeVideo",
    "Tver": "Tver"
}
let target;
let isAdjusTimerPage = false;
// video要素の監視
let watchVideo;

// eventとコネクションをはる
const port = chrome.runtime.connect({name: "event"});
port.postMessage({status: "connect_init"});

window.onload = () => {
    // 右クリック禁止解除 
    document.addEventListener("contextmenu",function(e){e.stopPropagation();},true);

    // eventから受け取るイベント
    port.onMessage.addListener((response) => {
        console.log(response);
        if (response.name === "create_adjustimer") {
            urlCheck();
            // adjusTimerが起動
            isAdjusTimerPage = true;
        } else if (response.name === "close_adjustimer") {
            // adjusTimerが終了
            isAdjusTimerPage = false;
            clearInterval(watchVideo);
        } else if (response.name === "sync_video_info") {
            // 情報同期（タイトルやvideo要素の取得）
            const videoTitle = getVideoTitle(response.pageType);

            port.postMessage({
                name: "update",
                status: "set_video_info",
                videoTitle: videoTitle
            });
            switch(response.pageType) {
                case PAGE_TYPE_NAMES["PrimeVideo"]:
                    watchVideo = setInterval(() => {
                        const target = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")[0];
                        if (target) {
                            clearInterval(watchVideo);
                            // observer起動
                            startObserver(target, videoTitle);
                        }
                    }, 500);
                    break;
                case PAGE_TYPE_NAMES["Tver"]:
                    // 右クリック解除しないとAdjusTimerが起動できない
                    document.addEventListener("contextmenu",function(e){e.stopPropagation();},true);
                    watchVideo = setInterval(() => {
                        const target = document.querySelector(".vjs-current-time");
        
                        if (target) {
                            clearInterval(watchVideo);
                            startObserver(target, videoTitle);
                        }
                    }, 500)
                    break;
                default:
                    break;
            }
        }
    });
}

function startObserver(target, videoTitle) {
    const title = videoTitle;
    let observer = new MutationObserver(records => {
        records.forEach((record, index) => {
            if (record.target && index === 0) {
                port.postMessage({
                    name: "update",
                    status: "time_update",
                    title: title,
                    currentTime: record.target.textContent
                }, (response) =>{});
            }
        })
    })
    if (target) {
        observer.observe(target, {
            characterData: true,
            childList: true,
            subtree: true
        });
    } else {
        console.log("取得に失敗しました.");
    }
}

function urlCheck() {
    const currentPageUrl = location.href;
    if (currentPageUrl.match(/https:\/\/www.amazon.co.jp\/*/)) {
        const urlCheckPrime = setInterval(() => {
            // Prime Video判定
            const currentPage = document.querySelector(".av-retail-m-nav-text-logo").text;
            if (isAdjusTimerPage && currentPage && currentPage === "Prime Video") {
                // Prime判定ができたことをeventに伝える
                port.postMessage({
                    name: "update",
                    type: "init_page",
                    pageType: PAGE_TYPE_NAMES["PrimeVideo"]
                });
                clearInterval(urlCheckPrime);
            }
        }, 1000);
    } else if (currentPageUrl.match(/https:\/\/tver.jp\/corner\/*/)) {
        const urlCheckTver = setInterval(() => {
            // Tver判定
            const title = document.querySelector(".vjs-dock-title");
            if (isAdjusTimerPage && title && title.textContent) {
                // Tver判定ができたことをeventに伝える
                port.postMessage({
                    name: "update",
                    type: "init_page",
                    pageType: PAGE_TYPE_NAMES["Tver"]
                });
                clearInterval(urlCheckTver);
            }
        }, 1000);
    }
}

function getVideoTitle(pageType) {
    let videoTitle = "";
    switch(pageType) {
        case PAGE_TYPE_NAMES["PrimeVideo"]:
            // シーズンがある場合（prime videoのみ）
            const season = document.querySelector(".dv-node-dp-seasons")
                ? document.querySelector(".dv-node-dp-seasons").querySelector("[for]").textContent
                : "";
            videoTitle = document.getElementsByClassName("av-detail-section")[0].querySelector("[data-automation-id]").textContent + " " + season;
            break;
        case PAGE_TYPE_NAMES["Tver"]:
            videoTitle = document.querySelector(".vjs-dock-title").textContent;
            break;
        default:
            break;
    }
    return videoTitle;
}
