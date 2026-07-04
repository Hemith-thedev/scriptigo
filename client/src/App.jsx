import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.tsx";

import Dashboard from "./pages/Dashboard.jsx";
import StoriesPage from "./pages/Stories.jsx";
import GenresPage from "./pages/Genres.jsx";
import TagsPage from "./pages/Tags.jsx";
import LinksPage from "./pages/Links.jsx";
import StoryLink from "./pages/StoryLink.jsx";
import StoryAttachmentPage from "./pages/StoryAttachment.jsx";
import StoryScriptsPage from "./pages/StoryScripts.jsx";
import StoryCharactersPage from "./pages/StoryCharacters.jsx";

function App() {
  const location = useLocation();
  const [showWindow, setShowWindow] = useState(true);

  // Check if the current URL matches the story scripts pattern
  const isScriptPage = /\/stories\/[^/]+\/scripts/.test(location.pathname);

  return (
    <>
      {/* Header will hide automatically on the scripts page */}
      {!isScriptPage && <Header />}

      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stories" element={<StoriesPage key={location.pathname} />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/link-to" element={<LinksPage />} />
        <Route path="/link-to/story/:id" element={<StoryLink />} />
        <Route path="/stories/:id/attachments" element={<StoryAttachmentPage />} />
        <Route path="/stories/:id/scripts" element={<StoryScriptsPage />} />
        <Route path="/stories/:id/characters" element={<StoryCharactersPage />} />
      </Routes>
    </>
  );
}

export default App;
