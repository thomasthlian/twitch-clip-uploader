'use strict';

const { setSecrets, getGameId, getClips } = require('./twitch.js');
const { concatenateVideo, download, processClips } = require('./video');
const { findTime, intervalToSeconds } = require('./time');

const interval = intervalToSeconds("day");
const gamesChecked = ["Valorant"]

async function main() {
  try {
    await setSecrets();
    for (const game of gamesChecked) {
      //const gameId = await getGameId(game);
      const gameId = 516575;
      let startTime = await findTime(interval);
      let clipData = await getClips(gameId, startTime.toString());
      let clips = await processClips(clipData);
      await download(clips);
      let video = await concatenateVideo(clips);
      console.log(video);
    }
  } catch (error) {
    console.log(`Something went wrong!\n${error}`);
  }
}

main();