import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// registering the hooks

const UsernameWindow = ({ condition, oncancel, onsubmit }) => {
  const [username, setUsername] = useState(() => {
    const storedName = localStorage.getItem("scriptigo-username");
    return storedName ? storedName : "Writer";
  });
  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center h-full w-full ${condition ? "backdrop-blur-xl bg-white-dark/20 pointer-events-auto" : "backdrop-blur-none pointer-events-none"}`}
    >
      <div
        className={`flex flex-col justify-start items-center gap-4 h-fit w-fit bg-white-dark shadow-xl hover:shadow-2xl hover:shadow-primary-50/50 p-12 rounded-3xl ${condition ? "translate-y-0 blur-none opacity-100" : "translate-y-1/2 blur-2xl opacity-0"}`}
      >
        <form action="" className="p-3">
          <div className="input-field">
            <input
              className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none text-center"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </form>
        <div className="flex justify-center items-center gap-4">
          <button
            className="primary-button red"
            onClick={() => {
              oncancel();
            }}
          >
            Cancel
          </button>
          <button
            className="primary-button"
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
  useGSAP(
    () => {
      // Title fade in
      gsap.to(".gsap-opacity-fade-in", {
        opacity: 1,
        duration: 1,
        delay: 0.1,
        ease: "power2.out",
      });

      // KPI cards annee oka timeline flow lo raavali
      const tl = gsap.timeline({ delay: 0.5 });

      // Okkokka card lo unna h1 (number) and p (label) ni sequence ga animate cheyyali
      tl.to(".kpi-card", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: {
          each: 0.3, // Prati card ki 0.3s gap
          onStart: function () {
            // Card loni elements ni animate cheyyadam
            const target = this.targets()[0];
            gsap.fromTo(
              target.querySelectorAll("h1, p"),
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.15 },
            );
          },
        },
        ease: "back.out(1.7)",
      });
    },
    { scope: ".scriptigo-page" },
  );
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
            <h2 className="gsap-opacity-fade-in opacity-0">
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8 h-fit w-full">
              {[
                {
                  label:
                    stories.length < 2 && stories === 0 ? "Story" : "Stories",
                  count: stories.length,
                  path: "/stories",
                },
                {
                  label: genres.length < 2 && genres === 0 ? "Genre" : "Genres",
                  count: genres.length,
                  path: "/genres",
                },
                {
                  label: tags.length < 2 && tags === 0 ? "Tag" : "Tags",
                  count: tags.length,
                  path: "/tags",
                },
                // { label: "Links", path: "/link-to" },
              ].map((card, index) => (
                <NavLink
                  key={index}
                  className="kpi-card opacity-0"
                  to={card.path}
                >
                  <div className="flex bg-white-dark shadow-md p-8 rounded-3xl hover:shadow-2xl hover:shadow-primary-50/90 hover:text-primary-50 hover:text-shadow-lg hover:text-shadow-primary-50/10">
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
            <div className="flex justify-start items-start h-fit w-full bg-white-dark p-4 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary-50/90">
              <div className="flex flex-col justify-start items-start gap-2 h-fit w-full">
                <div className="flex justify-between items-start h-fit w-full">
                  <h5 className="p-4 bg-white-dark shadow-md rounded-xl hover:shadow-2xl hover:shadow-primary-50/50">
                    Story: The Purple Love💜
                  </h5>
                  <button className="primary-button green">Let's Go!</button>
                </div>
                <div className="flex flex-col justify-start items-start rounded-2xl">
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
