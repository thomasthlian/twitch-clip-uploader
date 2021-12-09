const axios = require('axios');
const fs = require('fs');
var fluent_ffmpeg = require("fluent-ffmpeg");

const Clip = require('./clip.js');

const maxVideoDuration = 13.5 * 60;


async function concatenateVideo(clips) {
    console.log(`Beginning to stitch video.`);
    try {
        var mergedVideo = fluent_ffmpeg();
        clips.forEach(function(clip){
            mergedVideo.addInput(clip.video_path);
        })

        mergedVideo.mergeToFile('./video.mp4')
        .on('error', function(error) {
            console.log(`Error in merging files\n${error}`);
        })
        .on('end', function() {
            console.log("Finished merging videos.");
        })
    } catch (error) {
      console.log(`Error in stitching video\n${error}`)
    }
}

/**
 * Fills array with clips from data.
 * @param {Array} data Twitch top clips data.
 */
async function processClips(data) {
    console.log("Starting processClips()");
    try{
      let totalTime = 0.0;
      let allClips = [];

      for (let i = 0; i < data.data.length; i++) {
        let currClip = data.data[i];
        /**
         * Parameters to qualify for clip in video:
         * Less than 2 minutes
         * English
         */
        if (currClip.duration < 120.0 && currClip.language == 'en') {
          let download_url = currClip.thumbnail_url.substring(0, currClip.thumbnail_url.indexOf("-preview")) + '.mp4';
          allClips.push(new Clip(currClip.thumbnail_url, currClip.broadcaster_name, currClip.title,
            currClip.view_count, currClip.duration, download_url));
          totalTime += currClip.duration;
        }

        if (totalTime > maxVideoDuration) {
          console.log("Exceeded Maximum Video Duration");
          return allClips;
        }
      }
      return allClips;
    } catch (error) {
      console.log(`Error in processClips(${data})\n${error}`)
    }
}

let totalClips = 0;

async function downloadData(clips) {
    console.log("Downloading all clips.");
    totalClips = 0;
    let d = new Date();
    let day = d.getDay();

    const path = `./videos/${day}`
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    let promises = [];
    for (let i = 0; i < clips.length; i++) {
        promises.push(download(clips[i], `${path}/${i}.mp4`, clips.length));
    }
    await Promise.all(promises).then(() => {
        console.log("FINISHED DOWNLOADING");
    });
}

async function download(clip, path, total) {
    try {
        const response = await axios.get(clip.download_url, {
          responseType: 'stream',
        });
        const video = response.data.pipe(fs.createWriteStream(path));
        return new Promise(fulfill => video.on('finish', () => {
            console.log(`Finished downloading ${++totalClips}/${total}`);
            fulfill;
        }));
    } catch (error) {
        console.log(`Error in downloading video at ${path}\n${error}`);
    }
}

  module.exports = { processClips, downloadData, concatenateVideo };