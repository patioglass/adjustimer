const PAGE_TYPE_NAMES = {
    "WatchParty": "Prime Video: ウォッチパーティ",
    "PrimeVideo": "Prime Video",
    "Tver": "Tver",
    "Youtube": "Youtube",
    "dAnime": "dアニメストア",
    "Netflix": "Netflix",
    "Twitch": "Twitch",
    "NicoVideo": "ニコニコ"
}
let target;
let isAdjusTimerPage = false;
// video要素の監視
let watchVideo;
let port;
let timeupdate = true;

window.onload = () => {
    console.log("load adjustimer");
    // eventとコネクションをはる
    port = chrome.runtime.connect({name: `contentScript_${location.href}`});
    port.postMessage({status: "connect_init"});
    // 右クリック禁止解除 
    document.addEventListener("contextmenu",function(e){e.stopPropagation();},true);

    // eventから受け取るイベント
    port.onMessage.addListener((response) => {
        if (response.name === "create_adjustimer") {
            urlCheck();
            // adjusTimerが起動
            isAdjusTimerPage = true;
        } else if (response.name === "close_adjustimer") {
            // adjusTimerが終了
            isAdjusTimerPage = false;
            clearInterval(watchVideo);
        } else if (response.name === "stop_video_update") {
            timeupdate = false;
        } else if (response.name === "sync_video_info") {
            // サイトによっては最初のパラメータでビデオを指定するため
            let urlPath = location.pathname;
            let urlParam = location.search.split("&")[0];
            let videoUrl = location.protocol + "//" + location.host + urlPath + urlParam;
            switch(response.pageType) {
                case PAGE_TYPE_NAMES["dAnime"]:
                    urlPath = urlPath.slice(0, 12) + "ci_pc"; // /animestore/ci'
                    urlParam += "&workId=" + urlParam.split("=")[1].slice(0, -3);
                    videoUrl = location.protocol + "//" + location.host + urlPath + urlParam
                    break;
                case PAGE_TYPE_NAMES["Twitch"]:
                    videoUrl = document.querySelector("a[data-test-selector=link_out]").getAttribute("href");
                    break;
            }
            port.postMessage({
                name: "update",
                status: "set_video_info",
                videoTitle: getVideoTitle(response.pageType),
                videoUrl:  videoUrl
            });
            switch(response.pageType) {
                case PAGE_TYPE_NAMES["PrimeVideo"]:
                case PAGE_TYPE_NAMES["WatchParty"]:
                    // videoタグだと広告の関係でよくわからない時間表示になるパターンがある
                    watchVideo = setInterval(() => {
                        target = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")[0];
                        if (target) {
                            clearInterval(watchVideo);
                            // observer起動
                            startObserver(target, getVideoTitle(response.pageType));
                        }
                    }, 500);
                    break;
                case PAGE_TYPE_NAMES["Tver"]:
                    // 右クリック解除しないとAdjusTimerが起動できない
                    target = document.querySelector("video[role='application']");
                    if (target) {
                        target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                            secondToTimeString(target.currentTime),
                            getVideoTitle(response.pageType)
                        ));
                    }
                    break;
                case PAGE_TYPE_NAMES["Youtube"]:
                    target = document.querySelector("video");
                    target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                        secondToTimeString(target.currentTime),
                        getVideoTitle(response.pageType)
                    ));
                    break;
                case PAGE_TYPE_NAMES["dAnime"]:
                    target = document.querySelector("video");
                    target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                        secondToTimeString(target.currentTime),
                        getVideoTitle(response.pageType)
                    ));
                    break;
                case PAGE_TYPE_NAMES["Netflix"]:
                    const netflixTitle = document.querySelector(".netflixTitle").textContent;
                    // Netflixは動画タイトルのover要素が再生中は消えるっぽいので取得したら更新しない
                    target = document.querySelector("video");
                    target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                        secondToTimeString(target.currentTime),
                        netflixTitle
                    ));
                    break;
                case PAGE_TYPE_NAMES["Twitch"]:
                    const twitchWatchParty = setInterval(() => {
                        target = document.querySelector('video:not(video[playsinline])');
                        if (target) {
                            target.addEventListener('timeupdate', (a, b) => postCurrentTime(
                                secondToTimeString(target.currentTime),
                                getVideoTitle(response.pageType)
                            ));
                            clearInterval(twitchWatchParty);
                        }
                    }, 1000);

                    break;
                case PAGE_TYPE_NAMES["NicoVideo"]:
                    target = document.querySelector("video");
                    target.addEventListener("timeupdate", (a, b) => postCurrentTime(
                        secondToTimeString(target.currentTime),
                        getVideoTitle(response.pageType)
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
    if (currentPageUrl.match(/https:\/\/www.amazon.co.jp\/gp\/video\/*/)) {
        const urlCheckPrime = setInterval(() => {
            // Prime Video判定
            let primeVideoPage = document.querySelector(".av-retail-m-nav-text-logo");
            if (primeVideoPage) {
                if (primeVideoPage.text === "Prime Video") {
                    currentPage = primeVideoPage.text;
                }
            }
            // 2023/03/03 新UIのABテストが始まったのでDOMが変わっている対応
            if (!primeVideoPage) {
                primeVideoPage = document.querySelectorAll("img[alt='Prime Video']");
                if (primeVideoPage.length > 0) {
                    if (primeVideoPage[0].getAttribute("alt") === "Prime Video") {
                        currentPage = primeVideoPage[0].getAttribute("alt");
                    }
                }
            }
            if (!primeVideoPage || primeVideoPage.length === 0) {
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
    } else if (currentPageUrl.match(/https:\/\/tver.jp\/episodes\/*/)) {
        const urlCheckTver = setInterval(() => {
            // Tver判定
            const title = document.querySelector("[class^=titles_container]");
            if (isAdjusTimerPage && title && title.textContent) {
                // Tver判定ができたことをeventに伝える
                postInitSetting(PAGE_TYPE_NAMES["Tver"]);
                clearInterval(urlCheckTver);
            }
        }, 1000);
    } else if (currentPageUrl.match(/https:\/\/www.youtube.com\/watch*/)) {
        const urlCheckYoutube = setInterval(() => {
            // Youtube判定
            const title = document.querySelector("h1.ytd-watch-metadata");
            if (isAdjusTimerPage && title && title.textContent) {
                // Youtube判定ができたことをeventに伝える
                postInitSetting(PAGE_TYPE_NAMES["Youtube"]);
                clearInterval(urlCheckYoutube);
            }
        }, 1000);
    } else if (currentPageUrl.match(/https:\/\/animestore.docomo.ne.jp\/animestore\/sc_d_pc*/)) {
        const urlCheckDanime = setInterval(() => {
            const backInfo = document.querySelector('#backInfo');
            const title = backInfo?.querySelector('.backInfoTxt1')?.textContent;
            const epNum = backInfo?.querySelector('.backInfoTxt2')?.textContent;
            const epTitle = backInfo?.querySelector('.backInfoTxt3')?.textContent;
            if (title != null && epNum != null && epTitle != null) {
                postInitSetting(PAGE_TYPE_NAMES["dAnime"]);
                clearInterval(urlCheckDanime);
            }
        }, 1000)
    } else if (currentPageUrl.match(/https:\/\/www.netflix.com*/)) {
        console.log("inject");
        // DOM内にタイトルを出現させる(windowオブジェクトに情報があるため)
        injectScript(chrome.runtime.getURL('adjustimer-loader.js'), 'body');

        const urlCheckNetflix = setInterval(() => {
            const netflixTitle = document.querySelector(".netflixTitle")?.textContent;
            const overPlay = document.querySelector(".watch-video--player-view");
            if (overPlay && netflixTitle) {
                postInitSetting(PAGE_TYPE_NAMES["Netflix"]);
                clearInterval(urlCheckNetflix);
            }
        }, 1000)
    } else if (currentPageUrl.match(/https:\/\/www.twitch.tv\/*/)) {
        const urlCheckTwitch = setInterval(() => {
            const titleDom = document.querySelector("p[data-test-selector=title]");
            if (titleDom) {
                postInitSetting(PAGE_TYPE_NAMES["Twitch"]);
                clearInterval(urlCheckTwitch);
            }
        }, 1000)
    } else if (currentPageUrl.match(/https:\/\/www.nicovideo.jp\/watch\/*/)) {
        const urlCheckNicoVideo = setInterval(() => {
            const nicoVideoTitle = document.querySelector(".VideoTitle")?.textContent;
            const nicoVideo = document.querySelector("video");
            if (nicoVideoTitle && nicoVideo) {
                postInitSetting(PAGE_TYPE_NAMES["NicoVideo"]);
                clearInterval(urlCheckNicoVideo);
            }
        }, 1000)

    }
}

function getVideoTitle(pageType) {
    switch(pageType) {
        case PAGE_TYPE_NAMES["PrimeVideo"]:
            return document.querySelector(".atvwebplayersdk-title-text").textContent;
        case PAGE_TYPE_NAMES["WatchParty"]:
            return document.querySelector("h1").textContent;
        case PAGE_TYPE_NAMES["Tver"]:
            return document.querySelector("[class^=titles_container]").textContent;
        case PAGE_TYPE_NAMES["Youtube"]:
            return document.querySelector("h1.ytd-video-primary-info-renderer").textContent;
        case PAGE_TYPE_NAMES["dAnime"]:
            const backInfo = document.querySelector('#backInfo');
            const title = backInfo?.querySelector('.backInfoTxt1')?.textContent;
            const epNum = backInfo?.querySelector('.backInfoTxt2')?.textContent;
            const epTitle = backInfo?.querySelector('.backInfoTxt3')?.textContent;
            return `${title} - ${epNum} ${epTitle}`;
        case PAGE_TYPE_NAMES["Netflix"]:
            const netflixTitle = document.querySelector(".netflixTitle")?.textContent;
            return netflixTitle ? netflixTitle : "正しく取得できませんでした. adjusTimerを再起動しやり直してください.";
        case PAGE_TYPE_NAMES["Twitch"]:
            return document.querySelector("p[data-test-selector=title]") ? document.querySelector("p[data-test-selector=title]").textContent : "もう一度取得してください";
        case PAGE_TYPE_NAMES["NicoVideo"]:
            return document.querySelector(".VideoTitle") ? document.querySelector(".VideoTitle").textContent : "もう一度取得してください";
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
    if (timeupdate) {
        port.postMessage({
            name: "update",
            status: "time_update",
            title: title,
            currentTime: currentTime
        }, (response) =>{});
    }
}

const postInitSetting = (pageType) => {
    port.postMessage({
        name: "update",
        type: "init_page",
        pageType: pageType
    });
}

const injectScript = (file, node) => {
    const scripts = document.querySelectorAll("script");
    const extensionScript = scripts[scripts.length - 1];
    if (!extensionScript?.src.match("adjustimer-loader.js")) {
        const th = document.getElementsByTagName(node)[0];
        const s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', file);
        th.appendChild(s);
    }
}