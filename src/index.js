'use strict';
const fs = require('fs');

const { createPath, getConfigInfo, findTime, intervalToSeconds } = require('./utils');
const { generateToken, tokenIsValid, getData, setSecrets, getGameId, getClips, getUserId } = require('./twitch');
const { setVideoInfo, concatenateVideo, downloadVideos, processClips, resizeClips } = require('./video');

// Will be added to config file eventually.

/**
 * The main function that calls other functions.
 */
async function main() {
  if (!fs.existsSync("./src/videos/")) {
    fs.mkdirSync("./src/videos/");
  }
  try {
    const [topics, secrets, info] = await getConfigInfo();
    await setSecrets(secrets);
    await setVideoInfo(info);
    if (!await tokenIsValid()) {
      await generateToken();
    }

    console.log();

    const videos = [];

    for (const game of topics['Games']) {
      videos.push({
        topic: game['topic'],
        period: game['period'],
        type: "game",
      });
    }

    for (const broadcaster of topics['Broadcasters']) {
      videos.push({
        topic: broadcaster['topic'],
        period: broadcaster['period'],
        type: "broadcaster",
      });
    }


    for (const video of videos) {
      console.log(`Starting video creation of ${video['topic']}\nwith a period of 1 ${video['period']}.`);

      let id;

      if (video['type'] == "game") {
        id = await(getGameId(video['topic']));
      }
      else if (video['type'] == "broadcaster") {
        id = await(getUserId(video['topic']));
      }

      const interval = intervalToSeconds(video['period']);
      let startTime = findTime(interval);

      let clipData = await getClips(id, startTime.toString(), video['type']);
      let clips = await processClips(clipData);
      let data = await getData(clips);
      let path = await(createPath(video['topic']));
      await downloadVideos(data, clips, path);
      await resizeClips(path, clips);
      let finishedVideo = await concatenateVideo(path, clips);
      console.log(finishedVideo);
    }
  } catch (error) {
    console.log(`Something went wrong in main function.\n${error}`);
  }
}

main();