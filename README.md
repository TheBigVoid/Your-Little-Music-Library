# Your Little Music Library

A music player that runs in your browser and plays music files from your own computer.

## Features

- **Add songs** with the *Add songs* button, or drag and drop files anywhere on the page
  (mp3, wav, ogg, opus, flac, m4a, aac, webm; exact support depends on your browser).
- **Playback controls:** play/pause, previous/next, a seek bar, and automatic advance to the next song.
- **Master volume** (0–100%) with a mute button. It applies to everything.
- **Per-song volume** (0–200%): each song has its own slider, so you can turn down a loud track or boost a quiet
  one. The tick on the slider marks 100%. You can also change the current song's volume from the player bar.
- The player bar shows the level a song actually **plays at**, which is the song volume × the master volume.
- Master volume and per-song volumes are **saved in your browser**. If you add the same file again later, its
  volume setting comes back.

## Getting started

You need [Node.js](https://nodejs.org/) 20.19+ or 22.12+.

```bash
npm install
npm run dev      # start the dev server, then open the URL it prints
```

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the development server with hot reload  |
| `npm run build`   | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally            |
| `npm test`        | Run the unit tests                            |
| `npm run lint`    | Lint the code                                 |
| `npm run app`     | Build, then open it as a desktop app          |
| `npm run app:dev` | Open the desktop app with hot reload          |
| `npm run dist:win`| Build the Windows `.exe` files (`release/`)   |

## Desktop app (Windows .exe)

The app is also packaged as a desktop program with [Electron](https://www.electronjs.org/), so you can install it
and open it like any other app instead of using a browser.

### Download

Every push to `main` builds the `.exe` files on GitHub. Open the
[Actions tab](../../actions/workflows/build-exe.yml), pick the latest successful run, and download
**your-little-music-library-windows** under *Artifacts*. It contains:

- `Your Little Music Library-Setup-<version>.exe`: an installer that adds a Start menu entry and an uninstaller.
- `Your Little Music Library-<version>-portable.exe`: a single file you can run directly, without installing.

Pushing a tag such as `v1.0.0` also attaches both files to a GitHub release.

The `.exe` files aren't code-signed, so Windows SmartScreen may warn the first time you run one. Choose
*More info* → *Run anyway*.

### Build it yourself

```bash
npm install
npm run dist:win
```

The `.exe` files land in `release/`. Building on Windows works out of the box. On Linux or macOS, electron-builder
needs [Wine](https://www.winehq.org/) to make Windows installers. `npm run dist` builds for the system you're on
instead (an AppImage on Linux, a dmg on macOS).

In the desktop app, your volume settings are saved in the app's own data folder
(`%APPDATA%\Your Little Music Library` on Windows), separate from any browser.

## How volume works

Audio goes through two separate [Web Audio](https://developer.mozilla.org/docs/Web/API/Web_Audio_API) gain stages:

```
<audio> → song gain → master gain → speakers
```

Because the two stages are separate, changing one volume never affects the other. The song gain can also go
above 1, which the plain `<audio>` volume property doesn't allow. Other audio processing (EQ, crossfade, and so on)
can be added to the same chain later.

## Project structure

```
src/
  audio/AudioEngine.ts     Playback and the Web Audio gain chain
  player/usePlayer.ts      React hook holding player state (library, current song, volumes)
  components/              UI: PlayerBar, SongList, VolumeSlider, Icons
  lib/                     Framework-free helpers: volume math, song helpers, storage, formatting (+ tests)
electron/
  main.cjs                 Desktop app entry point: opens dist/ in a window
  dev.mjs                  Runs the Vite dev server inside Electron (npm run app:dev)
build/                     App icons used for the .exe and installers
```

## Current limitations

- The song list isn't saved yet. After a reload you need to add your files again (their volume settings are
  restored when you do).
- Song titles come from file names. ID3/metadata tags aren't read yet.
