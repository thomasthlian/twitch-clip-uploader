'use strict';

const { downloadData, setConfig, getGameId, getClips } = require('./twitch');
const { concatenateVideo, downloadVideos, processClips } = require('./video');
const { findTime, intervalToSeconds } = require('./time');

const interval = intervalToSeconds("day");

async function main() {
  try {
    const gamesChecked = await setConfig()
    for (const game of gamesChecked) {
      const gameId = 516575;
      let startTime = findTime(interval);
      let clipData = await getClips(gameId, startTime.toString());
      let clips = await processClips(clipData);
      let data = await downloadData(clips);
      await(downloadVideos(data));
      //let video = await concatenateVideo(clips);
    }
  } catch (error) {
    console.log(`Something went wrong!\n${error}`);
  }
}

main();