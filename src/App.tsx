// src/App.tsx
import React from "react";

function App() {
  return (
    <button onClick={() => window.ipc.test("Hello, Electron Main World.")}>
      テストメッセージ送信
    </button>
  );
}

export default App;
