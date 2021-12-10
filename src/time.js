/**
 * Finds the ISO time of @time (in seconds) ago.
 * @param {integer} time How many seconds ago to find the ISO time for
 * @returns {integer} ISO time of @time seconds ago.
 */
function findTime(time) {
    let videoSearchDate = new Date(Date.now() - time * 1000).toISOString();
    return videoSearchDate.toString();
}

/**
 * Converts the string to the interval in seconds.
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

module.exports = { findTime, intervalToSeconds };