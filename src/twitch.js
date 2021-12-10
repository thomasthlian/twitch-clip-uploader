const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

let headers;
let numClips;

const twitchUri = "https://api.twitch.tv/helix";

/**
 * Reads the config.yml file and sets secrets and settings.
 * @returns {String[]} List of games to create videos for
 */
async function setConfig() {
  try {
    const secrets = await yaml.load(fs.readFileSync('src/config.yml', 'utf8'));
    token = secrets.token;
    clientId = secrets.clientId;
    clientSecret = secrets.clientSecret;
    headers = {
      "Authorization": `Bearer ${token}`,
      "Client-Id": clientId,
    }
    numClips = secrets.numClips;
    return secrets.games;
  } catch (error) {
    console.log(`Error in setting secrets.\n${error}`);
  }
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
 * Pass in a game id and date and
 * returns a list of all the clips that match.
 * @param {integer} gameId Game to check
 * @param {integer} startTime Start time to search in UTC
 * @returns Data of all clips
 **/
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
 * Gets and returns video data from array of clips.
 * @param {Clip[]} clips Clip array to get data from
 * @returns Array containing video data from all clips
 */
async function getData(clips) {
  console.log("Downloading clip data.");

  let d = new Date();
  let day = d.getDay();

  const path = `./videos/${day}`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
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
    videoData = [data, path];
  });
  return videoData;
}

module.exports = { setConfig, getData, getGameId, getClips };