const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

let token = "";
let clientId = "";
let clientSecret = "";

let headers;

const twitchUri = "https://api.twitch.tv/helix";

const numClips = 100;

/**
 * Pass in a specific game name to get it's respective Twitch ID
 *
 * https://dev.twitch.tv/docs/api/reference#get-games
 *
 * @param {string} gameName Name of the game to get ID
 * @returns {string} Game id
 */

 async function setSecrets() {
    try {
      const secrets = await yaml.load(fs.readFileSync('src/secrets.yml', 'utf8'));
      token = secrets.token;
      clientId = secrets.clientId;
      clientSecret = secrets.clientSecret;
      headers = {
        "Authorization": `Bearer ${token}`,
        "Client-Id": clientId,
      }
    } catch (error) {
      console.log(`Error in setting secrets.\n${error}`);
    }
  }

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

  module.exports = { setSecrets, getGameId, getClips };