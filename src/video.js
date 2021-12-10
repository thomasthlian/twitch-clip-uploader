const axios = require('axios');
const fs = require('fs');
var fluent_ffmpeg = require("fluent-ffmpeg");

const Clip = require('./clip.js');

const maxVideoDuration = 10 * 60;


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
          console.log("Exceeded maximum video duration.");
          return allClips;
        }
      }
      return allClips;
    } catch (error) {
      console.log(`Error in processClips(${data})\n${error}`)
    }
}

let totalClips = 0;

async function downloadVideos(data) {
  console.log("Started downloading videos.")
  let [videoData, path] = data;
  let videos = [];
  let fulfilledVideos = 0;

  for (let i = 0; i < videoData.length; i++) {
    try {
      let videoPath = `${path}/${i + 1}.mp4`;
      const video = videoData[i].data.pipe(fs.createWriteStream(videoPath));
      videos.push(new Promise(resolve => {
        video.on('finish', resolve);
      }));

    } catch (error) {
      console.log(`Error in downloading video at ${path}\n${error}`);
    }
  }
  console.log("Download process started on all videos.");
  await Promise.all(videos).then(function() {
    console.log("Finished downloading all videos.");
  });
}

module.exports = { processClips, downloadVideos, concatenateVideo };