// src/App.tsx
import React from "react";
import "@grapecity/wijmo.styles/wijmo.css"; // (1)

import * as wjGauge from "@grapecity/wijmo.react.gauge"; // (2)

function App() {
  const [gauge, setGauge] = React.useState(30); // (3)
  return (
    <div>
      <h1>Wijmo + React + Electron</h1>
      <wjGauge.LinearGauge // (4)
        className="wijmo-control" // (5)
        isReadOnly={false} // (6)
        value={gauge} // (7)
        valueChanged={(ev: any) => setGauge(ev.value)} // (8)
      />
      ゲージの値: {gauge} {/* (9) */}
    </div>
  );
}

export default App;
