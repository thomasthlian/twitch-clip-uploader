/**
 * Pass in a specific game name to get it's respective Twitch ID
 *
 * https://dev.twitch.tv/docs/api/reference#get-games
 *
 * @param {string} gameName Name of the game to get ID
 * @returns {string} Game id
 */

export async function getGameId(gameName) {
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
export async function getClips(gameId, startTime) {
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