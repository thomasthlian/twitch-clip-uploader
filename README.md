# Twitch Clip Compiler
Twitch Clip Compiler is a command-line interface which creates videos from Twitch clips.

* **Ease of Use:** The Twitch Clip Compiler can compile a video from different settings fast.
* **Daily Content:** Unique content can be created with different settings each time you use it.

## How to Use

1. Download the repository.
2. Create a Twitch account.
3. [Register](https://dev.twitch.tv/docs/authentication#registration) a Twitch app to obtain a client ID and client secret.
4. Create a config file at /src/config.yml
5. Start the system with `npm start`

The files will be located at /src/videos/`month`/`day`/`topic`
```
    token: ${{ Twitch Token }}
    client_id: ${{ Twitch Client ID}}
    client_secret: ${{ Twitch Client Secret }}
    redirect_uri: http://localhost
    broadcasters:
    - topic: xQcOW
        period: month
    games:
    - topic: Minecraft
        period: day
    number_of_clips: 100
    video_length: 15
    resolution: 1920x1080
    min_clip_duration: 15
    max_clip_duration: 120
    language: en
```

Look at documents [here](https://dev.twitch.tv/docs/authentication) for details on `token`, `client_id`, and `client_secret`.
| Name | Description | Example |
|---|---|---|
| token | (Optional) Twitch token retrieved from above documentation. Not needed if `client_id` and `client_secret` are supplied. | `0123456789abcdefghijABCDEFGHIJ` |
| client_id | (Optional) Twitch app id retrieved from above documentation. Not needed if `token` is supplied. Will not renew token if this is not supplied. | `fooid` |
| client_secret | Twitch app secret retrieved from above documentation. | `barbazsecret` |
| redirect_uri | Where the server sends the user. | https://localhost |
| broadcasters | List of broadcasters to compile clips of. Definitions defined below. |
| games | List of games to compile clips of. Definitions defined below. |
| number_of_clips | Number of clips to compile into a video. Maximum: 100. Default: 20. |
| video_length | The amount of time (in minutes) the compiled video should not exceed. | 15 |
| resolution | Resolution of the compiled video. | 1920x1080 |
| min_clip_duration | The minimum length of a clip to be entered into the video. |
| max_clip_duration | The maximum length of a clip to be entered into the video. |
| language | The language in which the clips should be in. | en |

## Broadcasters definition
```
broadcasters:
    - topic: xQcOW
      period: day
```
Broadcasters Variables
| Name | Description | Example |
|---|---|---|
| topic | The Twitch username of the broadcaster to retrieve clips of. | xQcOW |
| period | The period of time (in words and *lowercase*) ago to start find clips from. | day |

## Games definition
```
games:
    - topic: Minecraft
      period: day
```
Games Variables
| Name | Description | Example |
|---|---|---|
| topic | The name of the game to retrieve clips of. | Minecraft |
| period | The period of time (in words and *lowercase*) ago to start find clips from. | month |