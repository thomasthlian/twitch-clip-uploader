const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Finds the ISO time of @time (in seconds) ago.
 *
 * @param {integer} time How many seconds ago to find the ISO time for
 * @returns {integer} ISO time of @time seconds ago.
 */
function findTime(time) {
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
function intervalToSeconds(interval) {
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
async function getConfigInfo() {
    try {
      const doc = yaml.load(fs.readFileSync('src/config.yml', 'utf8'));

      const headers = {
        "Authorization": `Bearer ${doc.token}`,
        "Client-Id": doc.clientId,
      }

      return [
          {"Games": doc.games, "Broadcasters": doc.broadcasters},
          {"Client-Secret": doc.clientSecret, "Headers": headers, "Number of Clips": doc["number of clips"]},
          {"Video Resolution": doc.resolution},
        ];
    } catch (error) {
      console.log(`Error in retrieving data from config.yml.\n${error}`);
    }
}

async function createPath(folderName) {
    let date = new Date();
    let month = date.getMonth();
    let day = date.getDate();

    let path = `./src/videos/${month + 1}`; // TODO: Potentially change to String format
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    path += `/${day}`;
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    try {
        if (!fs.existsSync(`${path}/${folderName}`)) {
            fs.mkdirSync(`${path}/${folderName}`);
        }
        path += `/${folderName}`;
    } catch (error) {
        let i = 0;
        while (fs.existsSync(`${path}/undefined-${i}`)) {
            i++;
        }
        path += `/undefined-${i}`;
        fs.mkdirSync(path);
    }
    return path;
}

module.exports = { createPath, findTime, intervalToSeconds, getConfigInfo };