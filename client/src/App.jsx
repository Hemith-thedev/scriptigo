import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.tsx";

import Dashboard from "./pages/Dashboard.jsx"
import StoriesPage from "./pages/Stories.jsx";
import GenresPage from "./pages/Genres.jsx";
import TagsPage from "./pages/Tags.jsx";
import LinksPage from "./pages/Links.jsx";
import StoryLink from "./pages/StoryLink.jsx";

function InitAppWindow({ visibleIf, onclick }) {
  return (
    <div className={`init-app-window ${visibleIf ? "" : "hidden"}`}>
      <div className="flex flex-col justify-center items-center">
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
        visibleIf={showWindow && window.location === "/"}
        onclick={() => {
          setShowWindow(false);
        }}
      />
      <Header />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/link-to" element={<LinksPage />} />
        <Route path="/link-to/story/:id" element={<StoryLink />} />
      </Routes>
    </>
  );
}

export default App;
