import { useState, useEffect } from "react";
import Dropdown from "../components/common/Dropdown";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaPlus, FaPen } from "react-icons/fa6";
import { TempScripts } from "../data/arrays";
import AddSceneForm from "../components/forms/AddSceneForm";
import AddVocalForm from "../components/forms/AddVocalForm";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { IoIosArrowBack } from "react-icons/io";
import { FaPrint } from "react-icons/fa6";

const pdfClass = "page-to-create-to-pdf";

// const UseScrollToBottom = (trigger, elementSelector = "main") => {
//   useEffect(() => {
//     //selectedForm null ayithe (Reset button nokkinappudu)
//     if (trigger === null) {
//       const timer = setTimeout(() => {
//         const element = document.querySelector(elementSelector);
//         if (element) {
//           // scrollHeight ni use chesi bottom ki pampudham
//           element.scrollTo({
//             top: element.scrollHeight + "px",
//             behavior: "smooth",
//           });
//         }
//       }, 0); // Time koncham penchanu, DOM paint avvadaniki time ivvali
//       return () => clearTimeout(timer);
//     }
//   }, [trigger, elementSelector]);
// };

export default function StoryScriptsPage() {
  const { id } = useParams();
  const [story, setStory] = useState({});
  const [isSpeakerDropdownOpen, setIsSpeakerDropdownOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [scripts, setScripts] = useState([]);
  // Pagination (show 3 scenes per page)
  const [currentPage, setCurrentPage] = useState(1);
  // 1. Page load/refresh ayyinappudu bottom ki scroll avvadaniki
  useEffect(() => {
    // GSAP animation duration 0.5s kabatti, 600ms wait cheddam
    const scrollDelay = 100;

    if (selectedForm === null) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
        });
      }, scrollDelay);
      return () => clearTimeout(timer);
    } else {
      if (currentPage === 1) {
        // Top ki vellappudu kuda smooth ga undali
        window.scrollTo({
          top: 0,
        });
      }
    }
  }, [selectedForm, id]);
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(
      [".title"],
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        stagger: 0.25,
        ease: "power2.out",
      },
    );
  });
  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.fromTo(
        [".script-section"],
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.25,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [selectedForm] },
  );
  // 1. Data Fetching
  useEffect(() => {
    async function fetchStoryData() {
      if (!id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/stories/${id}`);
        const storyData = res.data.data || {};
        setStory(storyData);
        if (storyData.characters && Array.isArray(storyData.characters)) {
          const dropdownOptions = storyData.characters.map((char) => ({
            label: (
              <span className="flex flex-col justify-start items-start">
                <span>{char.name}</span>
                <span className="text-gray-500">
                  <span>{char.role}</span>
                </span>
              </span>
            ),
            value: char.name,
          }));
          setCharacters(dropdownOptions);
        }
      } catch (error) {
        console.error("Error fetching story:", error);
      }
    }
    fetchStoryData();
  }, [id]);
  useEffect(() => {
    async function fetchScripts() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/stories/${id}/scripts`,
        );
        setScripts(res.data.data);
      } catch (error) {
        console.error("Fetch avvaledu:", error);
      }
    }
    if (id) fetchScripts();
  }, [id, scripts]);
  // 2. Filter Logic
  const filteredScripts = scripts.filter((script) => {
    if (!selectedCharacter) return true;
    const characterFilterValue = selectedCharacter.value || selectedCharacter;
    return script.speaker_name === characterFilterValue;
  });
  // 3. Grouping Logic (దీనివల్లనే క్రాష్ అవ్వకుండా పనిచేస్తుంది)
  const groupedScenes = filteredScripts.reduce((acc, item) => {
    const sceneKey = item.scene_id || "unassigned_scene";
    if (!acc[sceneKey]) {
      acc[sceneKey] = [];
    }
    acc[sceneKey].push(item);
    return acc;
  }, {});

  const scenesPerPage = 1;

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [selectedCharacter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const sceneEntries = Object.entries(groupedScenes);
  const totalPages = Math.max(
    1,
    Math.ceil(sceneEntries.length / scenesPerPage),
  );
  const startIndex = (currentPage - 1) * scenesPerPage;
  const endIndex = startIndex + scenesPerPage;
  const paginatedSceneEntries = sceneEntries.slice(startIndex, endIndex);

  useEffect(() => {}, [filteredScripts, groupedScenes]);

  // Scene pagination controls
  const handlePrevPage = async () => {
    let number;
    await setCurrentPage((p) => {
      number = Math.max(1, p - 1);
      return number;
    });
    localStorage.setItem("scriptigo-stories-current-page", number);
  };
  const handleNextPage = async () => {
    let number;
    await setCurrentPage((p) => {
      number = Math.min(totalPages, p + 1);
      return number;
    });
    localStorage.setItem("scriptigo-stories-current-page", number);
  };
  useEffect(() => {
    const storedPage = localStorage.getItem("scriptigo-stories-current-page");
    if (storedPage) {
      setCurrentPage(storedPage);
    }
  }, []);
  return (
    <main className="scriptigo-page pt-0!">
      <section className="scriptigo-section title sticky top-0 backdrop-blur-3xl max-w-360! py-8 z-20">
        <div className="scriptigo-section-wrapper justify-between! items-center! h-fit w-full px-8 border-b border-b-primary-30 pb-4">
          <div className="flex justify-start items-center gap-4">
            <button
              className="primary-button has-element-hover"
              onClick={() => window.history.back()}
            >
              <IoIosArrowBack className="text-3xl" />
            </button>
            <h4 className="text-2xl font-bold text-primary-50">
              {story.title || "Loading..."}
            </h4>
          </div>
          {/* <button className="primary-button" onClick={() => window.print()}>
            <FaPrint className="text-3xl" />
          </button> */}
          {selectedForm === null && (
            <div className="flex justify-end items-center gap-4">
              <button
                className="primary-button"
                disabled={currentPage === 1}
                onClick={handlePrevPage}
              >
                Previous
              </button>
              <span className="text-primary-50 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                className="primary-button h-full"
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
      {/* Script Viewer */}
      {selectedForm === null && (
        <section className="scriptigo-section script-section white-scrollbar opacity-0 z-10">
          <div className="scriptigo-section-wrapper flex-col bg-white shadow rounded-3xl space-y-6 p-8 overflow-y-auto">
            {paginatedSceneEntries.map(([sceneId, sceneItems]) => (
              <div
                key={sceneId}
                className="flex flex-col justify-start items-start h-fit w-full space-y-2"
              >
                {/* Scene Header Styling */}
                <div className="flex justify-start items-center gap-4 h-fit w-full">
                  <p className="bg-primary-50 px-4 py-2 text-white rounded-xl text-nowrap uppercase">
                    {sceneId.replace("_", " ")}
                  </p>
                  <div className="flex min-h-0.5 w-full bg-gray-500" />
                </div>

                <div className={`space-y-0 ${pdfClass}`}>
                  {sceneItems.map((script) => (
                    <div key={script.order_id} className="mx-auto">
                      {script.type === "scene" ? (
                        <p className="italic text-gray-600 font-serif py-1">
                          {script.action}
                        </p>
                      ) : (
                        <div className="flex flex-col items-start text-center space-y-1 border-l-2 border-l-primary-80 p-4 pr-0">
                          <p>
                            {/* Character Name */}
                            <span className="font-bold uppercase text-primary-50 tracking-wider">
                              {script.speaker_name}
                            </span>{" "}
                            {/* Emotion (Optional) */}
                            {script.emotions && script.emotions.length > 0 && (
                              <span className="italic text-gray-500 tracking-widest p-1 px-2 bg-gray-200 rounded-lg">
                                {script.emotions.map(
                                  (emotion, index) =>
                                    `${emotion}${index === script.emotions.length - 1 ? "" : ", "}`,
                                )}
                              </span>
                            )}{" "}
                          </p>
                          {script.action !== "" && (
                            <p>
                              <span>({script.action})</span>
                            </p>
                          )}

                          {/* Vocal/Dialogue */}
                          <div className="flex flex-col justify-start items-start h-fit w-full">
                            {script.vocal.map((line, idx) => (
                              <h6 key={idx} className="text-justify">
                                "{line}"
                              </h6>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Floating Buttons */}
      {selectedForm === "scene" && (
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper">
            <AddSceneForm />
          </div>
        </section>
      )}
      {selectedForm === "vocal" && (
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper">
            <AddVocalForm characters={story.characters} storyId={id} />
          </div>
        </section>
      )}
      <section className="fixed right-6 bottom-6 flex flex-col justify-end items-end z-30">
        <ul
          className={`flex flex-col gap-y-2 py-2 transition-all ${isOptionsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <li>
            <button
              className="primary-button red"
              onClick={() => {
                setSelectedForm(null);
                setIsOptionsOpen(false);
              }}
            >
              Reset
            </button>
          </li>
          <li>
            <button
              className="primary-button pink"
              onClick={() => setSelectedForm("scene")}
            >
              Scene
            </button>
          </li>
          <li>
            <button
              className="primary-button green"
              onClick={() => setSelectedForm("vocal")}
            >
              Vocal
            </button>
          </li>
        </ul>
        <button
          className="p-2 size-12 primary-button"
          onClick={() => setIsOptionsOpen((prev) => !prev)}
        >
          <FaPlus style={{ rotate: isOptionsOpen ? "-45deg" : "0deg" }} />
        </button>
      </section>
    </main>
  );
}
