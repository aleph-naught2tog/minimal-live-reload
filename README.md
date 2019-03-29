# minimal live reloader

Minimal Live Reloader is a barebones file-watcher. You can tell it a directory to monitor, and it will watch that directory for changes. When changes occur, it tells any browser windows with an open connection to refresh.
* [Quick reference](#quick-reference)
* [Setup](#setup)
* [Usage](#usage)

**Note**: the port being used is currently hard-coded to **3333** for the socket server itself, and **3334** for where to serve the file at.

## Quick reference

* installing: `npm --save-dev minimal-live-reload`
* running: `npx minimal-live-reload`
* stopping the server: <kbd>ctrl+c</kbd>

## Setup

1. Install the package from npm by running `npm --save-dev minimal-live-reload`
2. Add this snippet to any files you want to reload. (If you're using templates or includes, you'll want this in something like the `footer` file so that it's on every page.)

    ```html
    <script src="http://localhost:3334/socket.js"></script>
    ```


## Usage

Assuming you successfully installed the package and did the setup above:

1. Start your project server however you usually do.
2. Open a new terminal tab.
3. In the new terminal tab, run `npx minimal-live-reload`.

By default, it will watch the contents of the folder you call it from. If you call it from your project root, it will watch all files in the project.

You can also specify which folder it should watch if you want. To watch only your `src` folder, you would do `npx minimal-live-reload src`.
