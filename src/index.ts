import { app, BrowserWindow, protocol, session } from 'electron';
import * as path from "path";
import * as fs from "fs";
import {PassThrough, Readable} from 'stream';
// import { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import downloadChromeExtension from "electron-devtools-installer/dist/downloadChromeExtension";
// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

app.commandLine.appendSwitch('remote-debugging-port', '9229')

const localContentScheme = "local-scheme";

const TEST_LOCAL_SCHEME = false;

// Privileged schemes need to be registered before app is ready
protocol.registerSchemesAsPrivileged([
  {scheme: localContentScheme, privileges: {standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true}},
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const dotWebpackFolder = path.join(path.dirname(__dirname))

const createWindow = async (): Promise<void> => {

  // HACK: Since we're relying on Forge for our Webpack build, we have to wait a couple seconds so it can finish building the renderer bundle
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));

  function createStream(text: string | Buffer) {
    const rv = new PassThrough(); // PassThrough is also a Readable stream
    rv.push(text);
    rv.push(null);
    return rv;
  }

  function handleRequest(
    request: Electron.ProtocolRequest,
    callback: (stream: NodeJS.ReadableStream | Electron.ProtocolResponse) => void
  ) {    
    let requestUrl = new URL(request.url);
    callback(createStream(fs.readFileSync(path.join(dotWebpackFolder, "renderer", requestUrl.pathname)).toString("utf-8")));
  }


  const extensionPath = await downloadChromeExtension("fmkadmapgofadopljbjfkapdkoienihi", true, 5)
  const ses = session.fromPartition("persist:testing");
  ses.loadExtension(extensionPath);

  ses.protocol.registerStreamProtocol(
    localContentScheme,
    handleRequest
  );

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      session: ses,
    },
  });

  // and load the index.html of the app.
  if (TEST_LOCAL_SCHEME) {
    mainWindow.loadURL(`${localContentScheme}://local/main_window/index.html`);
  } else {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.