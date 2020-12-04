chrome.runtime.sendMessage({
    name: "init",
});
window.onload = () => {
    // 「今すぐ観る」ボタン
    const playButton = document.getElementsByClassName("dv-dp-node-playback");
    if (playButton[0]) {
        // タイトル
        playButton[0].addEventListener("click", () => {
            const videoTitle = document.getElementsByClassName("av-detail-section")[0].querySelector('[data-automation-id]');
            const videoElements = document.querySelectorAll('video');
            console.log(videoElements);
            Array.prototype.forEach.call(videoElements, (video) => {
                // 広告ではない動画で絞る
                if (video.className === "") {
                    video.addEventListener('timeupdate', function() {
                        chrome.runtime.sendMessage({
                            name: "update",
                            title: videoTitle.innerText,
                            totalPlayTime: video.duration,
                            currentTime: video.currentTime
                        }, (response) =>{console.log(response)});
                    });
                }
            })
        })
    }
}