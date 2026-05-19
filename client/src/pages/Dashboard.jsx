import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const UsernameWindow = ({ condition, oncancel, onsubmit }) => {
  const [username, setUsername] = useState(() => {
    const storedName = localStorage.getItem("scriptigo-username");
    return storedName ? storedName : "Writer";
  });
  return (
    <div className={`username-window ${condition ? "" : "hidden"}`}>
      <div className="wrapper">
        <div className="input-field">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="buttons">
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
                { label: "Stories", count: 5, path: "/stories" },
                { label: "Genres", count: 5, path: "/genres" },
                { label: "Tags", count: 5, path: "/tags" },
                {
                  label: "Temporary scripts",
                  count: 5,
                  path: "/temporary-scripts",
                },
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
              Want a drive?
            </h3>
            <div className="history-card">
              <div className="flex flex-col justify-start items-center">
                <h5>Story: The Purple Love💜</h5>
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
