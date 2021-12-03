'use strict';

const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const { stream, pipeline } = require('stream');
const { promisify, getSystemErrorMap } = require('util');
const videoStitch = require('video-stitch');

const Clip = require('./clip.js');

const twitchUri = "https://api.twitch.tv/helix";

let token = "";
let clientId = "";
let clientSecret = "";

const numClips = 100;
let vidNumber = 0;
let videoConcat = videoStitch.concat;

const gamesChecked = ["Valorant"]

let headers;

const maxVideoDuration = 13.5 * 60;

// const finished = promisify(stream.finished);

let allClips = [];

/**
 * Pass in a specific game name to get it's respective Twitch ID
 *
 * https://dev.twitch.tv/docs/api/reference#get-games
 *
 * @param {string} gameName Name of the game to get ID
 * @returns {string} Game id
 */
async function getGameId(gameName) {
  console.log(`Running getGameId`);
  const params = {
    "name": gameName,
  }

  try {
    const response = await axios.get(`${twitchUri}/games`, {
      headers: headers,
      params: params,
    });

   return response.data.data[0].id;
  } catch (error) {
    console.log(`Error in getGameId(${gameName}):\n${error}`);
  }
}


/**
 * Pass in a game id and date and it will return a list of all the clips that fit them.
 * @param {integer} gameId Game to check
 * @param {integer} startTime Start time to search in UTC
 * @returns Data of all clips
 */
async function getClips(gameId, startTime) {
  console.log(`Running getClips`);
  const params = {
    "game_id": gameId,
    "started_at": startTime,
    "first": numClips
  }

  try {
    const response = await axios.get(`${twitchUri}/clips`, {
      headers: headers,
      params: params,
    });

   return response.data
  } catch (error) {
    console.log(`Error in getClips(${gameId}, ${startTime}):\n${error}`);
  }
}


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
        download(download_url);
        if (videoInfo[0]) {
          allClips.push(new Clip(currClip.thumbnail_url, currClip.broadcaster_name, currClip.title,
            currClip.view_count, currClip.duration, download_url, videoInfo[1]));
          totalTime += currClip.duration;
          console.log(totalTime);
        } else {
          console.log("Error downloading " + currClip);
        }
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

async function download(url) {
  console.log(`Downloading video from: ${url}`);
  let d = new Date();
  let day = d.getDay();

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    });
    let videoPath = `./videos/${++vidNumber}.mp4`;
    const video = response.data.pipe(fs.createWriteStream(videoPath));

    video.on('finish', () => {
      console.log('Successfully downloaded file!');
      return (true, videoPath);
    });
  } catch (error) {
    console.log(`Error in downloading video at ${url}\n${error}`);
    return (false, null);
  }
}

async function stitchVideo(clips) {
  // console.log(`Starting stichVideo(${clips})`);
  // try {
  //   let videoClips = [];
  //   for (let i = 0; i < clips.length; i++) {
  //     videoClips.push(
  //       {
  //         "fileName" : `${i}.mp4`
  //       });
  //   }
  //   videoConcat({
  //     ffmpeg_path: "./videos",
  //     overwrite: true
  //   })
  //   .clips(videoClips)
  //   .output("Video")
  //   .concat()
  //   .then((outputFile) => {
  //     console.log('Path to output file: ', outputFile);
  //     return outputFile;
  //   });
  // } catch (error) {
  //   console.log(`Error in stitchVideo(${clips})\n${error}`);
  // }
}


async function setSecrets() {
  try {
    const secrets = await yaml.load(fs.readFileSync('src/secrets.yml', 'utf8'));
    token = secrets.token
    clientId = secrets.clientId;
    clientSecret = secrets.clientSecret;
    headers = {
      "Authorization": `Bearer ${token}`,
      "Client-Id": clientId,
    }
  } catch (e) {
    console.log(e);
  }
}

async function run() {
  try {
    await setSecrets();
    for (const game of gamesChecked) {
      allClips = [];
      //const gameId = await getGameId(game);
      const gameId = 516575;
      let startTime = (await findDayTime());
      let clips = await getClips(gameId, startTime.toString());
      await processClips(clips);
      let video = await stitchVideo(allClips);
    }
  } catch (error) {
    console.log(`Something went wrong!\n${error}`);
  }
}

run();