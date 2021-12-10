'use strict';

const { getData, setConfig, getGameId, getClips } = require('./twitch');
const { concatenateVideo, downloadVideos, processClips } = require('./video');
const { findTime, intervalToSeconds } = require('./time');

// Will be added to config file eventually.
const interval = intervalToSeconds("day");

/**
 * The main function that calls other functions.
 */
async function main() {
  try {
    const gamesChecked = await setConfig()
    for (const game of gamesChecked) {
      const gameId = 516575;
      let startTime = findTime(interval);
      let clipData = await getClips(gameId, startTime.toString());
      let clips = await processClips(clipData);
      let data = await getData(clips);
      await(downloadVideos(data, clips));
      //let video = await concatenateVideo(clips);
    }
  } catch (error) {
    console.log(`Something went wrong in main function.\n${error}`);
  }
}

main();