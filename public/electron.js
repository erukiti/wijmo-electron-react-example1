// public/electron.js
const path = require("path");
const childProcess = require("child_process");

const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");

let mainWindow = null;

// (1) 起動時に `react-scripts start` を実行して React アプリをビルドする
const bootBuilder = () => {
  return new Promise((resolve, reject) => {
    const cp = childProcess.exec("npm run start", {
      env: { ...process.env, BROWSER: "none" },
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

    cp.on("close", (code) => {
      reject(code);
    });
  });
};

// (6) ウィンドウ（レンダラープロセス）を作成する
const createWindow = async () => {
  const url = isDev // (9) 開発モードかどうか？
    ? await bootBuilder() // (10) Reactビルド待ち
    : `file://${path.join(__dirname, "../build/index.html")}`; // (11) ビルド済みのReactを読み込む
  mainWindow = new BrowserWindow({
    // (12) レンダラープロセス作成
    webPreferences: {
      contextIsolation: true, // (13) セキュリティ設定
      preload: path.join(__dirname, "preload.js"), // (14) レンダラープロセス初期化スクリプト指定
    },
    width: 1000,
    height: 600,
  });
  mainWindow.loadURL(url); // (15) レンダラープロセスでURLを読み込む
  mainWindow.on("closed", () => {
    // (16) 終了時の後始末
    mainWindow = null;
  });
};

// (17) アプリケーションが起動可能になったら createWindow を呼び出す
app.on("ready", () => createWindow());

// (18) ウィンドウを全て閉じたときの挙動を定義
app.on("window-all-closed", () => {
  app.quit();
});

// (19) IPC通信のテスト実装
ipcMain.handle("test", (event, message) => {
  console.log("test message:", message);
});
