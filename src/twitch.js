const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

let clientSecret;
let headers;
let numClips;

const twitchUri = "https://api.twitch.tv/helix";

/**
 * Reads the config.yml file and sets secrets and settings.
 * @returns {String[]} List of games to create videos for
 */
async function setSecrets(secrets) {
  try {
    clientSecret = secrets[0];
    headers = secrets[1];
    numClips = secrets[2];
  } catch (error) {
    console.log(`Error in setting secrets.\n${error}`);
  }
}

async function getToken(params) {

}

/**
 * Pass in a specific game name to get it's respective Twitch ID
 *
 * https://dev.twitch.tv/docs/api/reference#get-games
 *
 * @param {string} gameName Name of the game to get ID
 * @returns {string} Game id
 */
async function getGameId(gameName) {
    console.log(`Getting Game Id of ${gameName}.`);
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
 * Pass in a game id and date and
 * returns a list of all the clips that match.
 * @param {int} gameId Game to check
 * @param {int} startTime Start time to search in UTC
 * @returns Data of all clips
 **/
async function getClips(gameId, startTime) {
    console.log(`Getting Clips from Twitch.`);
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
 * Gets and returns video data from array of clips.
 * @param {Clip[]} clips Clip array to get data from
 * @returns Array containing video data from all clips
 */
async function getData(clips) {
  console.log("Downloading clip data.");
  let date = new Date();
  let month = date.getMonth();
  let day = date.getDate();

  const path = `./src/videos/${month + 1}`; // TODO: Potentially change to String format
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  if (!fs.existsSync(`${path}/${day}`)) {
    fs.mkdirSync(`${path}/${day}`);
  }

  let promises = [];

  for (let i = 0; i < clips.length; i++) {
    try {
      const data = axios.get(clips[i].download_url, {
        responseType: 'stream',
      });

      promises.push(data);
    } catch (error) {
      console.log(`Error in getting data for clip #${i}.\n${error}`);
    }
  }

  let videoData;

  await Promise.all(promises).then(function(data) {
    console.log("Received all data.");
    videoData = [data, `${path}/${day}`];
  });
  return videoData;
}

module.exports = { setSecrets, getData, getGameId, getClips };