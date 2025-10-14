console.log("Content Script: inject script Netflix");
let tabTitle = "";

const setNetflixTitle = () => {
  console.log("Content Script: find Netfilix title...");
  // タイトル取得
  let checkNetflix = setInterval(() => {
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
        document.querySelector(".netflixSubTitle").textContent = adjusTimerSubTitle;
        document.querySelector(".netflixCurrentTime").textContent = currentTime;
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
      }
    }
  }, 800)
}

setNetflixTitle();