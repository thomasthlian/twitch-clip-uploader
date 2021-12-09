'use strict';

const axios = require('axios');
const fs = require('fs');
const { stream, pipeline } = require('stream');
const { promisify, getSystemErrorMap } = require('util');
const fluent_ffmpeg = require("fluent-ffmpeg");

const Clip = require('./clip.js');
const { setSecrets, getGameId, getClips } = require('./twitch.js');

const gamesChecked = ["Valorant"]

const maxVideoDuration = 13.5 * 60;

// const finished = promisify(stream.finished);

let allClips = [];

/**
 * Will update allClips array with clips that meet the criteria.
 * @param {Array} data Clips to process
 */
async function processClips(data) {
  console.log("Starting processClips()");
  try{
    let totalTime = 0.0;
    for (let i = 0; i < data.data.length; i++) {
      let currClip = data.data[i];
      /**
       * Parameters to qualify for clip in video:
       * Less than 2 minutes
       * English
       */
      if (currClip.duration < 120.0 && currClip.language == 'en') {
        let download_url = currClip.thumbnail_url.substring(0, currClip.thumbnail_url.indexOf("-preview")) + '.mp4';
        allClips.push(new Clip(currClip.thumbnail_url, currClip.broadcaster_name, currClip.title,
          currClip.view_count, currClip.duration, download_url));
        totalTime += currClip.duration;
      }

      if (totalTime > maxVideoDuration) {
        console.log("Exceeded Maximum Video Duration");
        return;
      }
    }
  } catch (error) {
    console.log(`Error in processClips(${data})\n${error}`)
  }
}

async function findDayTime() {
  let videoSearchDate = new Date(Date.now() - 86400 * 1000).toISOString();
  return videoSearchDate.toString();
}

async function download(clips) {
  console.log("Downloading all clips.");
  let d = new Date();
  let day = d.getDay();

  const path = `./videos/${day}`
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  for (let i = 0; i < clips.length; i++) {
    try {
      const response = await axios.get(clips[i].download_url, {
        responseType: 'stream',
      });
      let videoPath = `${path}/${i}.mp4`;
      const video = response.data.pipe(fs.createWriteStream(videoPath));

      await new Promise(fulfill => video.on('finish', fulfill));
      clips[i].setVideoPath(videoPath);
      console.log(`Finished downloading ${i + 1}/${clips.length}`)
    } catch (error) {
      console.log(`Error in downloading video at ${url}\n${error}`);
      return (false, null);
    }
  }
}

async function concatenateVideo(clips) {
  console.log(`Starting concatenateVideo`);
  try {
    var video = fluent_ffmpeg();
    // clips.forEach(function(clip){
    //   video = video.addInput(clip.video_path);
    // })
    const folder_path = clips[0].video_path.substring(0, clips[0].video_path.length - 5);
    const video_path = `${folder_path}video.mp4`;
    console.log("Saving video to " + video_path);

    fluent_ffmpeg({source: clips[0].video_path})
      .input(clips[1].video_path)
      .on('end', () => console.log("Completed Merge."))
      .on('error', (error) => console.log(error))
      .mergeToFile(video_path);

    // video.mergeToFile(video_path, './tmp/')
    // .on('error', function(error) {
    //   console.log(`Error occured during video stitching process.\n${error.message}`);
    // })
    // await new Promise(fulfill => video.on('end', fulfill));
    // return video_path;
  } catch (error) {
    console.log(`Error in stitching video\n${error}`)
  }
}

async function main() {
  try {
    await setSecrets();
    for (const game of gamesChecked) {
      allClips = [];
      //const gameId = await getGameId(game);
      const gameId = 516575;
      let startTime = (await findDayTime());
      let clips = await getClips(gameId, startTime.toString());
      await processClips(clips);
      await download(allClips);
      let video = await concatenateVideo(allClips);
      console.log(video);
    }
  } catch (error) {
    console.log(`Something went wrong!\n${error}`);
  }
}

main();