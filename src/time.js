async function findTime(time) {
    let videoSearchDate = new Date(Date.now() - time * 1000).toISOString();
    return videoSearchDate.toString();
}

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