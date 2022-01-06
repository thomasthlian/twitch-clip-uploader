const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Finds the ISO time of @time (in seconds) ago.
 *
 * @param {integer} time How many seconds ago to find the ISO time for
 * @returns {integer} ISO time of @time seconds ago.
 */
export function findTime(time) {
    let videoSearchDate = new Date(Date.now() - time * 1000).toISOString();
    return videoSearchDate.toString();
}

/**
 * Converts the string to the interval in seconds.
 *
 * @example
 * //returns 3600
 * intervalToSeconds("hour");
 *
 * @param {String} interval interval to change into seconds
 * @returns The amount of seconds in the interval
 */
export function intervalToSeconds(interval) {
    interval = interval.toLowerCase();
    if (interval == "minute") {
        return 60;
    }
    if (interval == "hour") {
        return 60 * intervalToSeconds("minute");
    }
    if (interval == "day") {
        return 24 * intervalToSeconds("hour");
    }
    if (interval == "week") {
        return 7 * intervalToSeconds("day");
    }
}

/**
 * Take all information from config.yml file.
 * @returns Array containing config information
 */
export async function getConfigInfo() {
    try {
      const config = await yaml.load(fs.readFileSync('src/config.yml', 'utf8'));

      const headers = {
        "Authorization": `Bearer ${config.token}`,
        "Client-Id": config.clientId,
      }

      return [
          [config.games, config.broadcasters],
          [config.clientSecret, headers, config.numClips, config.resolution]
        ];
    } catch (error) {
      console.log(`Error in retrieving data from config.yml.\n${error}`);
    }
}