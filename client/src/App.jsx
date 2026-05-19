import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.jsx";

import Dashboard from "./pages/Dashboard.jsx";

function InitAppWindow({ visibleIf, onclick }) {
  return (
    <div className={`init-app-window ${visibleIf ? "" : "hidden"}`}>
      <div className="wrapper">
        <h1>Scriptigo</h1>
        <p>Script with Flow!✨</p>
        <button className="primary-button" onClick={onclick}>
          Let's go!
        </button>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const [showWindow, setShowWindow] = useState(true);
  return (
    <>
      <InitAppWindow
        visibleIf={showWindow}
        onclick={() => {
          setShowWindow(false);
        }}
      />
      <Header />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
