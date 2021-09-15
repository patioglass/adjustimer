const PAGE_TYPE_NAMES = {
    "WatchParty": "Prime Video: ウォッチパーティ",
    "PrimeVideo": "Prime Video",
    "Tver": "Tver",
    "Youtube": "Youtube"
}
let target;
let isAdjusTimerPage = false;
// video要素の監視
let watchVideo;
let port;

window.onload = () => {
    // eventとコネクションをはる
    port = chrome.runtime.connect({name: `event_${location.hostname}`});
    port.postMessage({status: "connect_init"});
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
            let target;
            switch(response.pageType) {
                case PAGE_TYPE_NAMES["PrimeVideo"]:
                case PAGE_TYPE_NAMES["WatchParty"]:
                    // videoタグだと広告の関係でよくわからない時間表示になるパターンがある
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
                    target = document.querySelector("video[id*=html5_api");
                    if (target) {
                        target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                            secondToTimeString(target.currentTime),
                            videoTitle
                        ));
                    }
                    break;
                case PAGE_TYPE_NAMES["Youtube"]:
                    target = document.querySelector("video");
                    target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                        secondToTimeString(target.currentTime),
                        videoTitle
                    ));
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
            const primeVideoPage = document.querySelector(".av-retail-m-nav-text-logo");
            if (primeVideoPage) {
                if (primeVideoPage.text === "Prime Video") {
                    currentPage = primeVideoPage.text;
                }
            } else {
                // watchParty判定
                if (currentPageUrl.match(/https:\/\/www.amazon.co.jp\/gp\/video\/watchparty\/*/)) {
                    currentPage = document.getElementsByTagName("title")[0].innerText; // Prime Video: ウォッチパーティ
                }
            }
            if (isAdjusTimerPage && currentPage && (currentPage === PAGE_TYPE_NAMES["WatchParty"] || currentPage === PAGE_TYPE_NAMES["PrimeVideo"])) {
                // Prime判定ができたことをeventに伝える
                postInitSetting(currentPage);
                clearInterval(urlCheckPrime);
            }
        }, 1000);
    } else if (currentPageUrl.match(/https:\/\/tver.jp\/corner\/*/)) {
        const urlCheckTver = setInterval(() => {
            // Tver判定
            const title = document.querySelector(".vjs-dock-title");
            if (isAdjusTimerPage && title && title.textContent) {
                // Tver判定ができたことをeventに伝える
                postInitSetting(PAGE_TYPE_NAMES["Tver"]);
                clearInterval(urlCheckTver);
            }
        }, 1000);
    } else if (currentPageUrl.match(/https:\/\/www.youtube.com\/watch*/)) {
        const urlCheckYoutube = setInterval(() => {
            // Youtube判定
            const title = document.querySelector("h1.title");
            if (isAdjusTimerPage && title && title.textContent) {
                // Youtube判定ができたことをeventに伝える
                postInitSetting(PAGE_TYPE_NAMES["Youtube"]);
                clearInterval(urlCheckYoutube);
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
            return document.getElementsByClassName("av-detail-section")[0].querySelector("[data-automation-id]").textContent + " " + season;
        case PAGE_TYPE_NAMES["WatchParty"]:
            if (document.querySelector("._3KdeRQ")) {
                return document.querySelector("._3KdeRQ").textContent;
            } else {
                return document.querySelector(".atvwebplayersdk-title-text").textContent;
            }
        case PAGE_TYPE_NAMES["Tver"]:
            return document.querySelector(".vjs-dock-title").textContent;
        case PAGE_TYPE_NAMES["Youtube"]:
            return document.querySelector("h1.title").textContent;
        default:
            return "正しく取得できませんでした、再生前の画面からやり直すかお問い合わせください";
    }
}

const secondToTimeString = (sec) => {
    const pad = (n) => n.toString().padStart(2, '0');
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = Math.floor(sec % 60);
    const result = `${pad(m)}:${pad(s)}`;
    return `${pad(h)}:${result}`;
};


const postCurrentTime = (currentTime, title) => {
    port.postMessage({
        name: "update",
        status: "time_update",
        title: title,
        currentTime: currentTime
    }, (response) =>{});
}

const postInitSetting = (pageType) => {
    port.postMessage({
        name: "update",
        type: "init_page",
        pageType: pageType
    });
}