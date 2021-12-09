'use strict';

const { setSecrets, getGameId, getClips } = require('./twitch.js');
const { concatenateVideo, downloadData, processClips } = require('./video');
const { findTime, intervalToSeconds } = require('./time');

const interval = intervalToSeconds("day");
const gamesChecked = ["Valorant"]

async function main() {
  try {
    await setSecrets();
    for (const game of gamesChecked) {
      //const gameId = await getGameId(game);
      const gameId = 516575;
      let startTime = findTime(interval);
      let clipData = await getClips(gameId, startTime.toString());
      let clips = await processClips(clipData);
      await downloadData(clips);
      console.log("Finished downloading videos.");
      let video = await concatenateVideo(clips);
    }
  } catch (error) {
    console.log(`Something went wrong!\n${error}`);
  }
}

main();