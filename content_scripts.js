let target;
chrome.runtime.sendMessage({
    name: "init",
});
window.onload = () => {
    const urlCheck = setInterval(() => {
        // Prime Video判定
        const currentPage = document.querySelector(".av-retail-m-nav-text-logo").text;
        if (currentPage && currentPage === 'Prime Video') {
            Array.from(document.querySelectorAll("a"), (e) => {
                e.addEventListener("click", () => {
                    const watchVideo = setInterval(() => {
                        target = document.getElementsByClassName("atvwebplayersdk-timeindicator-text")[0];
                        if (target) {
                            clearInterval(watchVideo);
                            startObserver(target);
                        }
                    }, 500);
                })
            })
            clearInterval(urlCheck);
        }
    }, 1000);

}

function startObserver(target) {
    // シーズンがある場合
    const season = document.querySelector(".dv-node-dp-seasons")
    ? document.querySelector(".dv-node-dp-seasons").querySelector("[for]").textContent
    : "";
    const videoTitle = document.getElementsByClassName("av-detail-section")[0].querySelector('[data-automation-id]').textContent + " " + season;
    let observer = new MutationObserver(records => {
        records.forEach(record => {
            if (record.target.nextElementSibling) {
                chrome.runtime.sendMessage({
                    name: "update",
                    title: videoTitle,
                    remainingTime: record.target.nextElementSibling.textContent,
                    currentTime: record.target.textContent
                }, (response) =>{});
            }
        })
    })
    if (target) {
        observer.observe(target, {
            characterData: true,
            subtree: true
        });
    } else {
        console.log("取得に失敗しました.");
    }
}