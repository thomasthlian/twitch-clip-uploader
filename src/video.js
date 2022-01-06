const axios = require('axios');
const fs = require('fs');
var fluent_ffmpeg = require("fluent-ffmpeg");

const Clip = require('./clip.js');
const ffmpeg = require('ffmpeg');

const maxVideoDuration = 10 * 60;

/**
 * Resizes clips and outputs resized clips to path.
 * @param {String} path Output for resized clips
 * @param {Clips[]} clips Array of clips to resize
 */
async function resizeVideo(path, clips) {
  console.log(`Resizing videos.`);
  try {
    let promises = [];

    clips.forEach(function(clip){
      var croppedVideo = fluent_ffmpeg();
      let resizedName = `${path}/${promises.length + 1} Resized.mp4`;
      croppedVideo.input(clip.video_path).size("1920x1080").autopad(); // TODO: Make this size adjustable from config.
      croppedVideo.output(resizedName)
      .on("error", function (err) {
        console.log(`Problem performing ffmpeg function\n${err}`);
      })
      .run();
      clip.setVideoPath(resizedName);
      promises.push(new Promise(resolve => {
        croppedVideo.on("end", resolve);
      }))
    });
    await Promise.all(promises).then(function() {
      console.log("Resized all videos.");
    })
  } catch (error) {
    console.log(`Error in resizing videos ${error}`);
  }
}

/**
 * Merges clips to one video at given path.
 * @param {String} path Output location for video
 * @param {Clips[]} clips Clips to merge
 */
async function concatenateVideo(path, clips) {
    console.log(`Beginning to concatenate video.`);
    try {
        var mergedVideo = fluent_ffmpeg();

        clips.forEach(function(clip){
            mergedVideo.addInput(clip.video_path);
            console.log(`Added ${clip.video_path}`);
        });

        let videoPath = `${path}/Video.mp4`;

        mergedVideo.mergeToFile(videoPath).on('start', function() {
          console.log(`Beginning to merge videos.`);
        }).on('progress', function(progress) {
          console.log(progress.percent);
        }).on('error', function(error) {
            console.log(`Error in merging files\n${error}`);
        }).on('end', function() {
            console.log("Finished merging videos.");
            return videoPath;
        })
    } catch (error) {
      console.log(`Error in concatenate video\n${error}`);
    }
}

/**
 * Sorts and returns data for clips that fit criteria.
 * @param {response} data Top clips data to process
 * @returns Clips that fit criteria
 */
async function processClips(data) {
    console.log("Selecting clips.");
    try{
      let totalTime = 0.0;
      let allClips = [];

      for (let i = 0; i < data.data.length; i++) {
        let currClip = data.data[i];
        /**
         * Parameters to qualify for clip in video:
         * Less than 2 minutes
         * English
         *
         * In the future, maybe make this a config file.
         */
        if (15.0 < currClip.duration < 60.0 && currClip.language == 'en') {
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

/**
 * Downloads all the videos in data.
 * @param {Array[]} data Video data to download
 * @param {Clip[]} clips Clips that need to update their video path
 */
async function downloadVideos(data, clips) {
  console.log("Started downloading videos.");
  let [videoData, path] = data;
  let videos = [];

  for (let i = 0; i < videoData.length; i++) {
    try {
      let videoPath = `${path}/${i + 1}.mp4`;
      clips[i].setVideoPath(videoPath);
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
  return path;
}

module.exports = { processClips, downloadVideos, concatenateVideo, resizeVideo };