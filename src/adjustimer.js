/*
    Pickr 1.8.0 MIT | https://github.com/Simonwep/pickr
    MIT License

    Copyright (c) 2018 - 2020 Simon Reinisch

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

const commonPickrComponent = {
    // Main components
    preview: true,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        clear: false,
        save: false
    }
};

const commonPickrSwatches = [
    'rgba(244, 67, 54, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(103, 58, 183, 1)',
    'rgba(63, 81, 181, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(0, 188, 212, 1)',
    'rgba(0, 150, 136, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(139, 195, 74, 1)',
    'rgba(205, 220, 57, 1)',
    'rgba(255, 235, 59, 1)',
    'rgba(255, 193, 7, 1)'
];

/**
 * @description サイト種別(API側と一致させる)
 * 0:Amazon Prime Video
 * 1:Tver
 * 2:Youtube
 * 3:dアニメストア
 * 4:Netflix
 * 5:ニコニコ動画
 * 6:Twitch
 */
const VIDEO_SERVICE_TYPE = {
    "Prime": 0,
    "Tver": 1,
    "Youtube": 2,
    "dアニメストア": 3,
    "Netflix": 4,
    "ニコニコ": 5,
    "Twitch": 6,
}


const currentDate = new Date();
const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
const day = ('0' + currentDate.getDate()).slice(-2);

const dateKey = currentDate.getFullYear() + month + day;
refreshLocalStorage();

let defaultBackgroundPickr = "#ccc";
let defaultWordPickr = "#77D5FF";
let defaultBorderPickr = "#000";

let port;
let pageType;

window.onload = () => {
    const manifestData = chrome.runtime.getManifest();
    document.querySelector(".version").innerHTML = manifestData.version;

    port = chrome.runtime.connect({name: `event_${location.hostname}`});
    port.postMessage({status: "ready_adjustimer"});

    // eventから受け取るイベント
    port.onMessage.addListener((response) => {
        switch(response.name) {
            case "sync_video_ready":
                const syncButton = document.querySelector(".button__sync");
                syncButton.setAttribute("id", "button__get_video_info");
                // 情報取得ボタンを押すことでcontent_scriptから情報をもらうようにする
                syncButton.removeEventListener("click", syncVideoInfo);
                syncButton.addEventListener("click", syncVideoInfo, false);
                pageType = response.pageType;
                document.querySelector("#current_page_name").innerText = response.pageType;

                break;
            case "set_video_info":
                setVideoInfo(response.videoTitle, "00:00:00");
                const videoUrlDom = document.getElementById("video__url");

                videoUrlDom.innerText = response.videoUrl;
                document.getElementById("remaining_time_wrapper").style.display = "block";
                break;
            case "update_video_time":
                setVideoInfo(response.title, response.currentTime);
                break;
            default:
                setVideoInfo("（未取得）", "00:00:00");
                document.querySelector(".button__sync").setAttribute("id", "");
                document.querySelector(".button__sync").removeEventListener("click", syncVideoInfo);
                const currentPageDom = document.querySelector("#current_page_name");
                currentPageDom.innerText = "<未対応のページ>";
                break;
        }
    })

    // 前回のカラーを取得
    if (localStorage.getItem('adjusTimer-defaultBackgroundPickr')) {
        defaultBackgroundPickr = localStorage.getItem('adjusTimer-defaultBackgroundPickr');
        document.querySelector("#wrapper").style.backgroundColor = defaultBackgroundPickr;
    }
    if (localStorage.getItem('adjusTimer-defaultWordPickr')) {
        defaultWordPickr = localStorage.getItem('adjusTimer-defaultWordPickr');
        document.querySelector("#remaining_time_wrapper").style.color = defaultWordPickr;
    }
    if (localStorage.getItem('adjusTimer-defaultBorderPickr')) {
        defaultBorderPickr = localStorage.getItem('adjusTimer-defaultBorderPickr');
        document.querySelectorAll(".word-text-stroke").forEach((el) => {
            el.style.textShadow = getTextShadow(defaultBorderPickr);
        })
    }

    const switchBorderCheckElement = document.querySelector("#switch_border");
    const borderWrap = document.querySelector("#border-wrapper");

    switchBorderCheckElement.addEventListener("change", (e) => {
        const borders = document.querySelectorAll(".word-text-stroke");
        const borderAbled = e.target.checked;

        if (!borderAbled) {
            borders.forEach((el) => {
                el.style.textShadow = 'none';
            })
            borderWrap.style.display = 'none';
        } else {
            const targetColorHex = colorPickers["borderPickr"].getColor().toHEXA().toString();
            borders.forEach((el) => {
                el.style.textShadow = getTextShadow(targetColorHex);
            })
            borderWrap.style.display = 'inline-block';
        }
    })

    // Simple example, see optional options for more configuration.
    const colorPickers = {
        "backgroundPickr": Pickr.create({
            el: '.background-color-picker',
            theme: 'nano', // or 'monolith', or 'nano'
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: defaultBackgroundPickr
        }),
        "wordPickr": Pickr.create({
            el: '.word-color-picker',
            theme: 'nano',
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: defaultWordPickr
        }),
        "borderPickr": Pickr.create({
            el: '.border-color-picker',
            theme: 'nano',
            swatches: commonPickrSwatches,
            components: commonPickrComponent,
            default: defaultBorderPickr
        })
    };

    Object.keys(colorPickers).forEach((key) => {
        colorPickers[key].on('init', instance => {
            console.log('Event: "init"', instance);
        }).on('change', (color, source, instance) => {
            const targetColorRGB = color.toRGBA().toString(3);
            const targetColorHex = color.toHEXA().toString();
            switch (key) {
                case "backgroundPickr":
                    // 背景色変更
                    const wrapper = document.querySelector("#wrapper");
                    localStorage.setItem("adjusTimer-defaultBackgroundPickr", targetColorRGB);
                    wrapper.style.backgroundColor = targetColorRGB;
                    break;
                case "wordPickr":
                    // 文字色変更
                    const word = document.querySelector("#remaining_time_wrapper");
                    word.style.color = targetColorRGB;
                    localStorage.setItem("adjusTimer-defaultWordPickr", targetColorRGB);
                    break;
                case "borderPickr":
                    // 縁色変更
                    const borders = document.querySelectorAll(".word-text-stroke");
                    localStorage.setItem("adjusTimer-defaultBorderPickr", targetColorHex);
                    borders.forEach((el) => {
                        el.style.textShadow = getTextShadow(targetColorHex);
                    })
                    break;
                default:
                    break;
            }
            colorPickers[key].applyColor(true);
        });
    })

    const fontSelect = document.querySelector("select");
    fontSelect.addEventListener("change", (e) => {
        const remainingTimeWrapper = document.querySelector("#remaining_time_wrapper");
        remainingTimeWrapper.style.fontFamily = e.target.value;
        console.log(e.target.value);
    })

    createUserId()
    // ajax通信
    // 情報取得ボタンを押した時に送信
    const adjustSyncButton = document.querySelector(".button__sync");
    adjustSyncButton.addEventListener("click", () => {
        if (document.querySelector("#button__get_video_info")) {
            // 動画タイトルが取れないのでとれるまでsetInterval
            let videoTitleFlag = false;
            const searchTitle = setInterval(() => {
                if (document.querySelector("#video__title").textContent !== '(未取得)') {
                    videoTitleFlag = true;
                }
                if (videoTitleFlag) {
                    if (!checkVideo(document.querySelector("#video__title").textContent)) {
                        clearInterval(searchTitle)
                        return;
                    }
                    console.log("start ajax!")
                    const pageType = document.querySelector("#current_page_name").textContent;
                    const videoServiceType = Object.keys(VIDEO_SERVICE_TYPE)
                                                .find(v => {
                                                    const reg = new RegExp(v);
                                                    return pageType.match(reg);
                                                })

                    $.ajax({
                        url: "http://18.176.90.189/v1/videoHistory",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify({
                            video_service_type: VIDEO_SERVICE_TYPE[videoServiceType],
                            video_title: document.querySelector("#video__title").textContent,
                            video_url: document.querySelector("#video__url").textContent,
                            user_id: localStorage.getItem('adjusTimer-userId')
                        })
                    })
                    .done((data) => {
                        clearInterval(searchTitle)
                        console.log(data)
                    })
                }
            }, 500);

        }
    })
}

// 仮のユーザIDを発行
function createUserId() {
    if (!localStorage.getItem('adjusTimer-userId')) {
        localStorage.setItem("adjusTimer-userId", "adjustimer-" + Math.random().toString(32).substring(2));
    }
}

// ボタン連打の場合の応急処置（その日のうちは同じビデオを登録しない）
function checkVideo(videoTitle) {
    if (!localStorage.getItem(dateKey)) {
        localStorage.setItem(dateKey, JSON.stringify([]));
    }

    let historyToday = JSON.parse(localStorage.getItem(dateKey));
    // すでに今日みたビデオタイトルならfalse(apiを叩かない)
    if (historyToday.includes(videoTitle)) {
        return false;
    } else {
        historyToday.push(videoTitle);
        localStorage.setItem(dateKey, JSON.stringify(historyToday));
        return true;
    }

}

// 先日以前のkeyを消す
function refreshLocalStorage() {
    Object.keys(localStorage).forEach((key) => {
        if (parseInt(key)) {
            if (parseInt(dateKey) > parseInt(key)) {
                localStorage.removeItem(key);
            }
        }
    })
}

function getTextShadow(targetColorHex) {
    return '4px 4px 3px ' + targetColorHex + ','
    + '-4px  4px 3px ' + targetColorHex + ','
    + '4px -4px 3px ' + targetColorHex + ','
    + '-4px -4px 3px ' + targetColorHex + ','
    + '4px  0px 3px ' + targetColorHex + ','
    + '0px  4px 3px ' + targetColorHex + ','
    + '-4px  0px 3px ' + targetColorHex + ','
    + '0px -4px 3px ' + targetColorHex;
}

function syncVideoInfo(e) {
    try {
        port.postMessage({
            name: "update",
            type: "get_video_info",
            pageType: pageType
        })
    } catch(e) {
        alert("AjusTimerを再起動してください");
    }
}

function setVideoInfo(videoTitle, videoTime) {
    const videoTitleDom = document.getElementById("video__title"); // ビデオタイトル
    const currentTimeDom = document.getElementById("video__time_current"); // 現在時間
    videoTitleDom.innerText = videoTitle;
    currentTimeDom.innerText = videoTime;
}