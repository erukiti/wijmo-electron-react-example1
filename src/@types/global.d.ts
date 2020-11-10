// src/@types/global.d.ts

interface Window {
  // (1) 対象は Window というインターフェース
  ipc: {
    test: (message: string) => void; // (2) `window.ipc.test` を定義
  };
}
