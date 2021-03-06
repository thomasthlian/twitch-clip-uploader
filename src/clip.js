export class Clip {
    video_path;

    constructor(thumbnail_url, broadcaster_name, title, view_count, duration, download_url) {
        this.thumbnail_url = thumbnail_url;
        this.broadcaster_name = broadcaster_name;
        this.title = title;
        this.view_count = view_count;
        this.duration = duration;
        this.download_url = download_url;
    }

    setVideoPath(path) {
        this.video_path = path;
    }
}