console.log("connect Netflix");
const setTitle = () => {
  // タイトル取得
  let checkNetflix = setInterval(() => {
    console.log("change video");
    const videoId = location.href.split("?")[0].split("/").slice(-1)[0];
    const currentTitle = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video?.title;
    const currentEpisodeId = window.netflix.appContext.state.playerApp.getState().videoPlayer.videoMetadata[videoId]?._video?._video?.currentEpisode;
    if (currentTitle) {
      let adjustimerTitle = `${currentTitle}`;
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
            adjustimerTitle += ` シーズン${currentSeason[0].seq}-${currentSeason[0]?.episodes[currentEpisodeIndex]?.seq} ${currentSeason[0]?.episodes[currentEpisodeIndex]?.title}`
          }
        }
      }
      if (document.querySelector(".netflixTitle")) {
        document.querySelector(".netflixTitle").textContent = adjustimerTitle;
        clearInterval(checkNetflix);
      } else {
        // DOMに反映
        const titleNameElement = document.createElement("p");
        titleNameElement.style.display = "none";
        titleNameElement.className = "netflixTitle";
        titleNameElement.textContent = adjustimerTitle;
        document.body.appendChild(titleNameElement);
        clearInterval(checkNetflix);
      }
    }
  }, 1000)
}

setTitle();
let href = location.href;
const observer = new MutationObserver(function(mutations) {
  if(href !== location.href) {
    href = location.href;
    setTitle();
  }
});

observer.observe(document, { childList: true, subtree: true });