'use strict';
import fs from 'fs';

import * as utilsSvc from './utils.js';
import * as twitchSvc from './twitch.js';
import * as videoSvc from './video.js';

/**
 * The main function that calls other functions.
 */
async function main() {
  if (!fs.existsSync("./src/videos/")) {
    fs.mkdirSync("./src/videos/");
  }
  try {
    const [topics, secrets, info] = await utilsSvc.getConfigInfo();
    await twitchSvc.setSecrets(secrets);
    await videoSvc.setVideoInfo(info);
    if (!await twitchSvc.tokenIsValid()) { // ? Potentially only generate token if there is a 400 error
      await twitchSvc.refreshToken();
    }

    console.log();

    const videos = [];

    if (topics['Games'] != null) {
      for (const game of topics['Games']) {
        videos.push({
          topic: game['topic'],
          period: game['period'],
          type: "game",
        });
      }
    }

    if (topics['Broadcasters'] != null) {
      for (const broadcaster of topics['Broadcasters']) {
        videos.push({
          topic: broadcaster['topic'],
          period: broadcaster['period'],
          type: "broadcaster",
        });
      }
    }

    for (const video of videos) {
      console.log(`Starting video creation of ${video['topic']}\nwith a period of 1 ${video['period']}.`);

      let id;

      if (video['type'] == "game") {
        id = await(twitchSvc.getGameId(video['topic']));
      }
      else if (video['type'] == "broadcaster") {
        id = await(twitchSvc.getUserId(video['topic']));
      }

      const interval = utilsSvc.intervalToSeconds(video['period']);
      let startTime = utilsSvc.findTime(interval);

      let clipData = await twitchSvc.getClips(id, startTime.toString(), video['type']);
      let clips = await videoSvc.processClips(clipData);
      let data = await twitchSvc.getData(clips);
      let path = await(utilsSvc.createPath(video['topic']));
      await videoSvc.downloadVideos(data, clips, path);
      await videoSvc.resizeClips(path, clips);
      await videoSvc.concatenateVideo(path, clips);
    }
  } catch (error) {
    console.log(`Something went wrong in main function.\n${error}`);
  }
}

main();