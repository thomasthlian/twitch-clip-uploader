'use strict';
const fs = require('fs');

const { getConfigInfo, findTime, intervalToSeconds } = require('./utils');
const { getData, setSecrets, getGameId, getClips } = require('./twitch');
const { concatenateVideo, downloadVideos, processClips, resizeVideo } = require('./video');

// Will be added to config file eventually.

/**
 * The main function that calls other functions.
 */
async function main() {
  if (!fs.existsSync("./src/videos/")) {
    fs.mkdirSync("./src/videos/");
  }
  try {
    const [topics, secrets] = await getConfigInfo();
    await setSecrets(secrets);
    const videos = topics[0];
    for (const video of videos) {
      console.log(`Starting video creation of ${video['topic']},\nwith a period of 1 ${video['period']}.`);

      const interval = intervalToSeconds(video['period']);
      let startTime = findTime(interval);
      let gameId = await(getGameId(video['topic']));
      let clipData = await getClips(gameId, startTime.toString());
      let clips = await processClips(clipData);
      let data = await getData(clips);
      let path = await(downloadVideos(data, clips));
      await resizeVideo(path, clips);
      let finishedVideo = await concatenateVideo(path, clips);
      console.log(finishedVideo);
    }
  } catch (error) {
    console.log(`Something went wrong in main function.\n${error}`);
  }
}

main();