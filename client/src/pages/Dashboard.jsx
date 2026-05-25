import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const UsernameWindow = ({ condition, oncancel, onsubmit }) => {
  const [username, setUsername] = useState(() => {
    const storedName = localStorage.getItem("scriptigo-username");
    return storedName ? storedName : "Writer";
  });
  return (
    <div className={`username-window ${condition ? "" : "hidden"}`}>
      <div className="flex flex-col justify-start items-center gap-12">
        <form action="" className="scriptigo-form no-padding">
          <div className="input-field">
          <input
          className="text-center"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        </form>
        <div className="buttons">
          <button
            className="primary-button red has-element-hover"
            onClick={() => {
              oncancel();
            }}
          >
            Cancel
          </button>
          <button
            className="primary-button has-element-hover"
            onClick={() => {
              localStorage.setItem("scriptigo-username", username);
              onsubmit(username);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [genres, setGenres] = useState([]);
  const [stories, setStories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showWindow, setShowWindow] = useState(false);
  const [username, setUsername] = useState(() => {
    const storedName = localStorage.getItem("scriptigo-username");
    return storedName ? storedName : "Writer";
  });
  useEffect(() => {
    function UpdateUsername() {
      const storedName = localStorage.getItem("scriptigo-username");
      setUsername(storedName ? storedName : "Writer");
    }
    window.addEventListener("storage", UpdateUsername);
    return () => window.removeEventListener("storage", UpdateUsername);
  });
  const fetchGenres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/genres");
      const genreList = res.data.data || [];
      const ALL_GENRES = genreList.map((g) => ({
        label: g.name,
        value: g.name,
      }));
      setGenres(ALL_GENRES);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };
  const fetchStories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stories");
      setStories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };
  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  useEffect(() => {
    fetchGenres();
    fetchStories();
    fetchTags();
  }, []);
  return (
    <>
      <main className="scriptigo-page">
        <div />
        <section className="scriptigo-section top-gap">
          <div className="scriptigo-section-wrapper">
            <h2>
              Welcome{" "}
              <button
                className="highlight gradient username-span"
                onDoubleClick={() => setShowWindow(true)}
                style={{ userSelect: "none", cursor: "pointer" }}
              >
                {username}
              </button>
              !
            </h2>
          </div>
        </section>
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper">
            <div className="kpi-cards">
              {[
                {
                  label: (stories.length < 2) ? "Story" : "Stories",
                  count: stories.length,
                  path: "/stories",
                },
                { label: (genres.length < 2) ? "Genre" : "Genres", count: genres.length, path: "/genres" },
                { label: (tags.length < 2) ? "Tag" : "Tags", count: tags.length, path: "/tags" },
                { label: "Temporary scripts", count: 5, path: "/trash" },
              ].map((card, index) => (
                <NavLink key={index} className="kpi-card" to={card.path}>
                  <div>
                    <h1>{card.count}</h1>
                    <p>{card.label}</p>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </section>
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper flex-col">
            <h3 className="">
              <span className="highlight">Pick</span> up where you left off?
            </h3>
            <div className="flex justify-start items-start h-fit w-full bg-black-light p-4 rounded-4xl">
              <div className="flex flex-col justify-start items-start gap-2 h-fit w-full">
                <div className="flex justify-between items-start h-fit w-full">
                  <h5 className="pl-4">Story: The Purple Love💜</h5>
                  <button className="primary-button green">Let's Go!</button>
                </div>
                <div className="flex flex-col justify-start items-start p-4 bg-black-theme rounded-2xl">
                  <p className="highlight gradient">Last Script</p>
                  <p>
                    Hemith: Anu, okaroju amma (Maya) nannu chusinappudu... nuvvu
                    kallu moosukunnavu, and thanu navvuthuntey 'Wow annayya!
                    akka chaala cute gaa navthundi' ani cheppavu gaa! neeku
                    teleya...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <UsernameWindow
        condition={showWindow}
        oncancel={() => setShowWindow(false)}
        onsubmit={(value) => {
          setShowWindow(false);
          setUsername(value);
        }}
      />
    </>
  );
}
