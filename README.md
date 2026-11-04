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
| `npm run dist:win`| Build the Windows installer into `release/`   |

## Desktop app (Windows)

The app is also packaged as a desktop program with [Electron](https://www.electronjs.org/), so you can install it
and open it like any other app instead of using a browser.

### Install

1. Download `Your-Little-Music-Library-Setup-<version>.exe` from the
   [latest release](../../releases/latest).
2. Double-click it. That's it: there are no questions and no admin password. It installs for your user account,
   adds Start menu and desktop shortcuts, and opens the app.

The installer isn't code-signed, so Windows SmartScreen may warn you the first time. Choose
*More info* → *Run anyway*.

To uninstall, use *Settings* → *Apps* in Windows. Your volume settings are kept in
`%APPDATA%\Your Little Music Library` in case you reinstall.

### Updates

The installed app checks [GitHub Releases](../../releases) for new versions when it starts and every 4 hours.
The **Updates** button (the circular arrow next to *Add songs*) shows your version and the update status.

- **Automatic (default):** new versions download in the background. A banner tells you when one is ready. Click
  *Restart now*, or keep listening and it installs the next time you close the app.
- **Manual:** turn off *Update automatically* in the Updates menu. The app still tells you when a new version is
  out, but only downloads it when you click *Download*.
- **Check for updates** in the Updates menu checks right away.

### Publishing a new version

Installed apps update from GitHub Releases, which the GitHub workflow publishes when you push a version tag:

```bash
npm version minor      # or patch / major: bumps package.json and creates a tag such as v1.1.0
```

```bash
git push --follow-tags
```

The workflow checks that the tag matches `package.json`, builds the installer on Windows, and publishes a release
with the installer and the `latest.yml` file the updater reads. Installed apps pick it up on their next check.

Every other push and pull request also builds the installer and uploads it under *Artifacts* on the workflow run,
for testing without publishing.

### Build it yourself

```bash
npm install
npm run dist:win
```

The installer lands in `release/`. Building on Windows works out of the box. On Linux or macOS, electron-builder
needs [Wine](https://www.winehq.org/) to make Windows installers. `npm run dist` builds for the system you're on
instead (an AppImage on Linux, a dmg on macOS).

To try updates during development, put a `dev-app-update.yml` in the project root that points at a test server
(for example `provider: generic` and `url: http://127.0.0.1:8765`), then run `npm run app`.

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
  components/              UI: PlayerBar, SongList, VolumeSlider, UpdateMenu, Icons
  desktop/useUpdates.ts    React hook for update status (desktop app only)
  lib/                     Framework-free helpers: volume math, song helpers, storage, formatting (+ tests)
electron/
  main.cjs                 Desktop app entry point: opens dist/ in a window
  updater.cjs              Checks GitHub Releases for updates, downloads and installs them
  preload.cjs              The small update API the page can use (window.desktop)
  dev.mjs                  Runs the Vite dev server inside Electron (npm run app:dev)
build/                     App icons used for the .exe and installers
```

## Current limitations

- The song list isn't saved yet. After a reload you need to add your files again (their volume settings are
  restored when you do).
- Song titles come from file names. ID3/metadata tags aren't read yet.
