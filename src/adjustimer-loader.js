console.log("connect Netflix");
const setTitle = () => {
  // タイトル取得
  let checkNetflix = setInterval(() => {
    const title = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[location.href.split("?")[0].split("/").slice(-1)[0]]?._video?._video?.title;
    if (title) {
      if (document.querySelector(".netflixTitle")) {
        document.querySelector(".netflixTitle").textContent = title;
        clearInterval(checkNetflix);
      } else {
        // DOMに反映
        const titleNameElement = document.createElement("p");
        titleNameElement.style.display = "none";
        titleNameElement.className = "netflixTitle";
        titleNameElement.textContent = title;
        document.body.appendChild(titleNameElement);
        clearInterval(checkNetflix);
      }
    }
  }, 1000)
}

setTitle();

let oldHref = "";
const bodyList = document.querySelector("head")
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log("change");
    if (oldHref != document.location.href) {
      oldHref = document.location.href;
      setTitle();
    }
  });
});

const config = {
    childList: true,
    subtree: true
};
observer.observe(bodyList, config);

