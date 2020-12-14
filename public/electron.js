// public/electron.js
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

const psTree = require("ps-tree");
const detect = require("detect-port");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");

let mainWindow = null;
let pids = [];
let cp;

// (1) 起動時に `react-scripts start` を実行して React アプリをビルドする
const bootBuilder = (port) => {
  return new Promise((resolve, reject) => {
    cp = childProcess.exec("npm run start", {
      env: { ...process.env, BROWSER: "none", PORT: port },
    });

    const reURL = /Local:\s+(http:\/\/localhost:\d+)/;

    // (2) 子プロセスの画面出力を監視して、開発サーバーのURLを見つけたら Promise を解決する
    cp.stdout.on("data", (data) => {
      process.stdout.write(data); // (3) 標準出力を素通しする
      const matched = reURL.exec(data); // (4) 正規表現で対象文字列を検出
      if (matched) {
        resolve(matched[1]); // (5) URLを返して Promise を解決する
      }
    });

    cp.stderr.pipe(process.stderr); // 標準エラー出力を素通しする

    cp.on("close", () => {
      app.quit();
    });

    pids.push(cp.pid);
  });
};

// (6) ウィンドウ（レンダラープロセス）を作成する
const createWindow = async () => {
  const url = isDev // (7) 開発モードかどうか？
    ? await bootBuilder(await detect(3000)) // (8) Reactビルド待ち
    : `file://${path.join(__dirname, "../build/index.html")}`; // (9) ビルド済みのReactを読み込む

  if (cp && cp.pid) {
    psTree(cp.pid, (err, children) => {
      children.forEach((child) => {
        const command = child.COMMAND || child.COMM;
        if (["node", "node.exe"].includes(path.basename(command))) {
          pids.push(Number.parseInt(child.PID, 10));
        }
      });
    });
  }

  mainWindow = new BrowserWindow({
    // (10) レンダラープロセス作成
    webPreferences: {
      contextIsolation: true, // (11) セキュリティ設定
      preload: path.join(__dirname, "preload.js"), // (12) レンダラープロセス初期化スクリプト指定
    },
    width: 1000,
    height: 600,
  });
  mainWindow.loadURL(url); // (13) レンダラープロセスでURLを読み込む
  mainWindow.on("closed", () => {
    // (14) 終了時の後始末
    mainWindow = null;
  });
};

// (15) アプリケーションが起動可能になったら createWindow を呼び出す
app.on("ready", () => createWindow());

// (16) ウィンドウを全て閉じたときの挙動を定義
app.on("window-all-closed", () => {
  app.quit();
});

app.on("quit", () => {
  pids.forEach((pid) => {
    try {
      process.kill(pid);
    } catch (e) {
      console.log(e);
    }
  });
});

// (17) IPC通信のテスト実装
ipcMain.handle("test", (event, message) => {
  console.log("test message:", message);
});
