console.log("Content Script: inject script Netflix");
let tabTitle = "";

const setNetflixTitleAndTime = () => {
  // タイトル取得
  const videoId = location.href.split("?")[0].split("/").slice(-1)[0];
  const currentTitle = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video?.title;
  const currentEpisodeId = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video?.currentEpisode;

  if (currentTitle) {
    let adjusTimerTitle = `${currentTitle}`;
    let adjusTimerSubTitle = "";
    if (currentEpisodeId) {
      let currentEpisodeIndex;
      if (window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video?.seasons.length > 0) {
        const currentSeason = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video.seasons.filter(season => {
          const episodeIndex = season.episodes.findIndex(episode => episode.episodeId === currentEpisodeId);
          if (episodeIndex !== -1) {
            currentEpisodeIndex = episodeIndex;
            return season;
          }
        })
        if (currentSeason) {
          adjusTimerSubTitle = ` シーズン${currentSeason[0].seq}-${currentSeason[0]?.episodes[currentEpisodeIndex]?.seq} ${currentSeason[0]?.episodes[currentEpisodeIndex]?.title}`
        }
      }
    }

    if (tabTitle != `${adjusTimerTitle} | ${adjusTimerSubTitle} - Netflix`) {
      document.title = `${adjusTimerTitle} | ${adjusTimerSubTitle} - Netflix`;
      tabTitle = `${adjusTimerTitle} | ${adjusTimerSubTitle} - Netflix`;
    }
    const currentTimeObject = Object.entries(window.netflix.appContext.state.playerApp.getState().videoPlayer.playbackStateBySessionId)
                      .filter(([key, value]) => key.includes("watch"))
                      .map(([key, value]) => value.currentTime)[0];
    const currentTime = currentTimeObject ? currentTimeObject / 1000 : 0;

    if (document.querySelector(".netflixTitle")) {
      document.querySelector(".netflixTitle").textContent = adjusTimerTitle;
      document.querySelector(".netflixSubTitle").textContent = adjusTimerSubTitle;
      document.querySelector(".netflixCurrentTime").textContent = currentTime;
      document.querySelector(".netflixFullTitle").textContent = `${adjusTimerTitle} | ${adjusTimerSubTitle}`;
    } else {
      // DOMに反映
      const titleNameElement = document.createElement("p");
      titleNameElement.style.display = "none";
      titleNameElement.className = "netflixTitle";
      titleNameElement.textContent = adjusTimerTitle;
      document.body.appendChild(titleNameElement);

      const subTitleNameElement = document.createElement("p");
      subTitleNameElement.style.display = "none";
      subTitleNameElement.className = "netflixSubTitle";
      subTitleNameElement.textContent = adjusTimerSubTitle;
      document.body.appendChild(subTitleNameElement);

      const currentTimeElement = document.createElement("p");
      currentTimeElement.style.display = "none";
      currentTimeElement.className = "netflixCurrentTime";
      currentTimeElement.textContent = currentTime;
      document.body.appendChild(currentTimeElement);

      const videoFullTitle = document.createElement("p");
      videoFullTitle.style.display = "none";
      videoFullTitle.className = "netflixFullTitle";
      videoFullTitle.textContent = `${adjusTimerTitle} | ${adjusTimerSubTitle}`;
      document.body.appendChild(videoFullTitle);
    }
  }
}


let checkVideoDOM = null;
let currentVideoElement = null;
// SPAの移動の際、video要素のみが削除されるため、それを検知するためのMutationObserverを入れる
const videoLifecycleObserver = new MutationObserver((mutations) => {
  const videoElement = document.querySelector("video");
  mutations.forEach(node => {
    node.removedNodes.forEach(() => {
      // watch-videoクラスはNetflixの動画プレイヤーのクラスで、これが削除されるときにトップページなどの動画再生ページ以外に遷移したと判断する
      if (node.target instanceof Element && node.target.classList.contains("watch-video")) {
        startCheckVideoPlayer();
      }
    })
  });
  if (!videoElement) {
    if (currentVideoElement) {
      currentVideoElement.removeEventListener("timeupdate", setNetflixTitleAndTime);
      currentVideoElement = null;
    }
    return;
  }

  if (videoElement !== currentVideoElement) {
    attachVideoListener(videoElement);
  }
});

const startCheckVideoPlayer = () => {
  if (checkVideoDOM) {
    return;
  }

  checkVideoDOM = setInterval(() => {
    const videoPlayer = document.querySelector(".watch-video");
    const videoElement = videoPlayer ? videoPlayer.querySelector("video") : null;
    if (videoPlayer && videoElement) {
      attachVideoListener(videoElement);
      // mutation observerでvideoPlayerの子要素の変化を監視する(video要素の監視)
      videoLifecycleObserver.disconnect();
      videoLifecycleObserver.observe(videoPlayer, {
        childList: true,
        subtree: true,
      });
      clearInterval(checkVideoDOM);
      checkVideoDOM = null;
    }
  }, 500);
}
startCheckVideoPlayer();

// video要素にイベントリスナーをつける関数
const attachVideoListener = (videoElement) => {
  if (!videoElement || currentVideoElement === videoElement) {
    return;
  }

  if (currentVideoElement) {
    currentVideoElement.removeEventListener("timeupdate", setNetflixTitleAndTime);
  }

  currentVideoElement = videoElement;
  currentVideoElement.addEventListener("timeupdate", setNetflixTitleAndTime);
};