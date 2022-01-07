import axios from 'axios';
import fs from 'fs';
import * as yaml from 'js-yaml';

let clientSecret;
let headers;
let numClips;

const twitchUri = "https://api.twitch.tv/helix";
const oauthTwitchUri = "https://id.twitch.tv/oauth2";

/**
 * Reads the config.yml file and sets secrets and settings.
 * @returns {String[]} List of games to create videos for
 */
export async function setSecrets(secrets) {
  try {
    clientSecret = secrets["Client-Secret"];
    headers = secrets["Headers"];
    numClips = secrets["Number of Clips"];
  } catch (error) {
    console.log(`Error in setting secrets.\n${error}`);
  }
}

export async function tokenIsValid() {
  try {
    console.log(`Checking if token is valid.`)
    await axios.get(`${oauthTwitchUri}/validate`, {
      headers: headers,
    })
    console.log(`Token is valid.`)
    return true;
  } catch (error) {
    console.log(`Token is not valid.`);
    return false;
  }
}

export async function generateToken() {
  try {
    console.log(`Generating new token.`)
    const response = await axios.post(`${oauthTwitchUri}/token?client_id=${headers['Client-Id']}&client_secret=${clientSecret}&grant_type=client_credentials`);
    headers['Authorization'] = `Bearer ${response.data.access_token}`;

    let doc = yaml.load(fs.readFileSync('src/config.yml', 'utf8'));
    doc.token = response.data.access_token;
    fs.writeFile('src/config.yml', yaml.dump(doc), (error) => {
      if (error) {
        console.log(`Error in setting token into config.yml file.`);
      } else {
        console.log(`Set new token.`);
      }
    });

  } catch (error) {
    console.log(`Error in getting new token\n${error}`);
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
export async function getGameId(gameName) {
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
    console.log(`Error in getting Game Id from ${gameName}:\n${error}`);
  }
}

export async function getUserId(displayName) {
  console.log(`Getting User Id of ${displayName}.`);
  const params = {
    "login": displayName,
  }

  try {
    const response = await axios.get(`${twitchUri}/users`, {
      headers: headers,
      params: params,
    });

    return response.data.data[0].id;
  } catch (error) {
    console.log(`Error in getting User Id from ${displayName}:\n${error}`);
  }
}


/**
 * Pass in a game id and date and
 * returns a list of all the clips that match.
 * @param {int} gameId Game to check
 * @param {int} startTime Start time to search in UTC
 * @returns Data of all clips
 **/
export async function getClips(id, startTime, type) {
    console.log(`Getting Clips from Twitch.`);
    let params = {
      "started_at": startTime,
      "first": numClips
    }

    if (type == "game") {
      params["game_id"] = id;
    }
    else if (type == "broadcaster") {
      params["broadcaster_id"] = id;
    }

    try {
      const response = await axios.get(`${twitchUri}/clips`, {
        headers: headers,
        params: params,
      });

     return response.data;
    } catch (error) {
      console.log(`Error in getClips(${id}, ${startTime}):\n${error}`);
    }
  }

/**
 * Gets and returns video data from array of clips.
 * @param {Clip[]} clips Clip array to get data from
 * @returns Array containing video data from all clips
 */
export async function getData(clips) {
  console.log("Downloading clip data.");

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
    videoData = data;
  });
  return videoData;
}