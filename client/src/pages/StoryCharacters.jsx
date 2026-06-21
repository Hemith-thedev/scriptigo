import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";
import axios from "axios";
import { FaPen, FaTrash } from "react-icons/fa6";

const roleOptions = [
  { label: "Anti-Hero", value: "AntiHero", category: "Core Narrative" },
  {
    label: "Background Actor",
    value: "BackgroundActor",
    category: "Production",
  },
  { label: "Brother", value: "Brother", category: "Family" },
  { label: "Cameo Appearance", value: "Cameo", category: "Production" },
  { label: "Client", value: "Client", category: "Plot & Case" },
  { label: "Comedian", value: "Comedian", category: "Production" },
  { label: "Daughter", value: "Daughter", category: "Family" },
  {
    label: "Deuteragonist (Co-Lead)",
    value: "Deuteragonist",
    category: "Core Narrative",
  },
  { label: "Extra", value: "Extra", category: "Production" },
  { label: "Father", value: "Father", category: "Family" },
  { label: "Foil", value: "Foil", category: "Core Narrative" },
  { label: "Friend", value: "Friend", category: "Family" },
  { label: "Grandparent", value: "Grandparent", category: "Family" },
  { label: "Guide", value: "Guide", category: "Core Narrative" },
  { label: "Hero", value: "Hero", category: "Core Narrative" },
  { label: "Heroine", value: "Heroine", category: "Core Narrative" },
  { label: "Love Interest", value: "LoveInterest", category: "Core Narrative" },
  { label: "Mentor", value: "Mentor", category: "Core Narrative" },
  { label: "Mother", value: "Mother", category: "Family" },
  { label: "Narrator", value: "Narrator", category: "Production" },
  { label: "Quarry", value: "Quarry", category: "Plot & Case" },
  { label: "Rival", value: "Rival", category: "Core Narrative" },
  { label: "Sidekick", value: "Sidekick", category: "Core Narrative" },
  { label: "Sister", value: "Sister", category: "Family" },
  { label: "Son", value: "Son", category: "Family" },
  {
    label: "Supporting Character",
    value: "Supporting Character",
    category: "Core Narrative",
  },
  { label: "Target", value: "Target", category: "Plot & Case" },
  { label: "The Catalyst", value: "Catalyst", category: "Plot & Case" },
  { label: "Victim", value: "Victim", category: "Plot & Case" },
  { label: "Villain", value: "Villain", category: "Core Narrative" },
  { label: "Voice Actor", value: "VoiceActor", category: "Production" },
];

export default function StoryCharactersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form element states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("");
  const [isStarring, setIsStarring] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isRoleDropdownError, setIsRoleDropdownError] = useState(false);
  const [dropdownKey, setDropdownKey] = useState(0);

  // Validation Error states
  const [errors, setErrors] = useState({ name: "", age: "", role: "" });

  const [story, setStory] = useState({});
  const [characters, setCharacters] = useState([]);

  // --- Dynamic Pagination States (Directly From StoriesPage Concept!) 📑 ---
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 15; // Per page matching standard limits!

  // Core data object state
  const [data, setData] = useState({
    name: "",
    age: "",
    role: "",
    isStarring: false,
  });

  // 1. Fetching API Data Loop
  const fetchStory = async () => {
    try {
      console.log(`🎬 Fetching story data for ID: ${id}...`);
      const res = await axios.get(`http://localhost:5000/api/stories/${id}`);

      if (res.data?.data) {
        setStory(res.data.data || {});
        setCharacters(res.data.data.characters || []);
        console.log("✅ Story data fetched successfully:", res.data.data);
      }
    } catch (error) {
      console.error("❌ Story fetch error bangaram:", error);
    }
  };

  useEffect(() => {
    if (id) fetchStory();
  }, [id]);

  // 2. Auto-Scroll Window Reset Trigger on Page Navigation 📜
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // 3. Simple Dynamic Section Divider Like StoriesPage Format 🎀
  const Divider = () => (
    <div className="h-0.5 w-full bg-primary-80 rounded-md my-4" />
  );

  // 4. Real-time Live Validation & Data Sync
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      name: name.trim(),
      age: age ? Number(age) : "",
      role: role,
      isStarring: isStarring,
    }));

    const currentErrors = { name: "", age: "", role: "" };

    if (age && (Number(age) <= 0 || Number(age) > 200)) {
      currentErrors.age = "Asalu ee age correct ena bangaram? 🤔";
    }

    if (role) {
      setIsRoleDropdownError(false);
    }

    setErrors(currentErrors);
  }, [age, role, isStarring]);

  // 5. Form Submit Validation & Backend API Call
  const handleValidateForm = async () => {
    const finalErrors = {};
    if (!name.trim()) finalErrors.name = "Character name is required";
    if (!age) finalErrors.age = "Age is required";
    if (!role) {
      finalErrors.role = "Role is required";
      setIsRoleDropdownError(true);
    }

    setErrors(finalErrors);

    if (Object.keys(finalErrors).length === 0) {
      try {
        console.log("🚀 Validation Success! Sending Data:", data);

        const response = await axios.post(
          `http://localhost:5000/api/stories/${id}/characters`,
          { character: data },
        );

        if (response.status === 200 || response.status === 201) {
          alert("Character successfully save aipoyindi bangaram! 🎉");

          // Resetting values cleanly
          setName("");
          setAge("");
          setRole("");
          setIsStarring(false);
          setCurrentPage(1);

          // 🌟 INCREMENT THE KEY TO WIPE THE SELECTED DROPDOWN VALUE
          setDropdownKey((prev) => prev + 1);

          fetchStory();
        }
      } catch (error) {
        console.error("❌ Add character fail ayyindi:", error);
        alert(
          error.response?.data?.message || "Something went wrong bujji! 😢",
        );
      }
      return true;
    } else {
      console.warn("⚠️ Validation Failed! Fix these issues:", finalErrors);
      return false;
    }
  };

  const handleDeleteCharacter = async (characterId) => {
    if (!characterId || !id) return; // 'id' comes directly from useParams()
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/stories/${id}/character/${characterId}`,
      );
      fetchStory();
      await alert(res.data.message);
      setName("");
      setRole("");
      setAge("");
      setIsStarring(false);
    } catch (error) {
      console.error("❌ Delete character fail ayyindi:", error);
      alert(error.response?.data?.message || "Could not delete character");
    }
  };

  return (
    <main className="scriptigo-page">
      <section className="scriptigo-section flex-col">
        <h3 className="text-xl font-bold mb-6">
          {story.title || "Loading Story..."}
        </h3>

        {/* Form Grid Structure (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-fit w-full items-center">
          {/* Character Name */}
          <div className="flex flex-col gap-1 w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-fit w-full p-3 tracking-widest text-primary-50 border-b-2 outline-none transition-colors
                ${errors.name ? "border-b-red-500 focus:border-b-red-500" : "border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50"}`}
              placeholder="Character Name"
            />
            {errors.name && (
              <span className="text-xs text-red-400 mt-1 pl-2 font-medium">
                {errors.name}
              </span>
            )}
          </div>

          {/* Age Number Field */}
          <div className="flex flex-col gap-1 w-full">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`h-fit w-full p-3 tracking-widest text-primary-50 border-b-2 outline-none transition-colors
                ${errors.age ? "border-b-red-500 focus:border-b-red-500" : "border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50"}`}
              placeholder="Age"
              min="1"
            />
            {errors.age && (
              <span className="text-xs text-red-400 mt-1 pl-2 font-medium">
                {errors.age}
              </span>
            )}
          </div>

          {/* Role Dropdown */}
          {/* Role Dropdown Slot inside StoryCharactersPage.jsx [source: 2] */}
          <div className="flex flex-col gap-1 w-full">
            <Dropdown
              openWhen={isRoleDropdownOpen}
              options={roleOptions.sort((a, b) =>
                a.label.localeCompare(b.label),
              )}
              placeholder={"Role"}
              selectedValue={role} // 🌟 Binds parent state to drop down tracker
              onoptionchange={(selectedObject) => {
                setRole(selectedObject?.value || "");
              }}
              ontoggle={() => setIsRoleDropdownOpen((prev) => !prev)}
              hasError={isRoleDropdownError}
            />
            {errors.role && (
              <span className="text-xs text-red-400 mt-1 pl-2 font-medium">
                {errors.role}
              </span>
            )}
          </div>

          {/* Toggle Button Box */}
          <div
            className={`flex items-center justify-between p-3 border-b-2 border-b-primary-20 hover:border-b-primary-50 transition-colors w-full h-full min-h-12.5`}
          >
            <span className="text-primary-20 tracking-widest text-sm font-medium">
              Is Starring?
            </span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isStarring}
                onChange={(e) => setIsStarring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-50"></div>
            </label>
          </div>
        </div>

        {/* Validation Button */}
        <button
          onClick={handleValidateForm}
          className="mt-10 px-6 py-3 bg-primary-50 text-white rounded-xl shadow-md hover:bg-primary-60 font-semibold active:scale-95 transition-transform"
        >
          Add Character 🎭
        </button>
      </section>

      {/* --- Upgraded List & Pagination Section (StoriesPage Layout Model!) 🎬 --- */}
      <section className="scriptigo-section top-gap">
        <div className="scriptigo-section-wrapper flex-col gap-2">
          <h2>Cast & Characters Collection! 🎬</h2>

          <div className="flex flex-col justify-start items-start h-fit w-full p-4 bg-white-theme rounded-4xl">
            {characters.length === 0 ? (
              <p>No characters found!😭... add one using the form above✨</p>
            ) : (
              (() => {
                // Inline IIFE calculation block precisely tracking math pagination splits!
                const totalPages = Math.ceil(
                  characters.length / charactersPerPage,
                );
                const startIndex = (currentPage - 1) * charactersPerPage;
                const endIndex = startIndex + charactersPerPage;
                const paginatedCharacters = characters.slice(
                  startIndex,
                  endIndex,
                );

                return (
                  <>
                    {/* Render Loop for Paginated Cards */}
                    <div className="flex flex-col justify-start items-start h-fit w-full">
                      {paginatedCharacters.map((char, index) => (
                        <React.Fragment key={char._id || index}>
                          {/* Character Styled Layout Card */}
                          <div className="flex justify-between items-start h-fit w-full p-4 hover:bg-primary-90 rounded-2xl transition-all">
                            <div className="flex flex-col justify-start items-start h-fit w-full">
                              <p className="text-[1.5rem] tracking-widest text-primary-50 font-semibold">
                                {char.name}
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                Role:{" "}
                                <span className="text-primary-20 font-medium">
                                  {char.role}
                                </span>{" "}
                                | Age: {char.age}
                              </p>
                            </div>
                            <div className="flex flex-col justify-start items-end gap-4 h-fit w-fit">
                              {char.isStarring && (
                                <span className="bg-amber-100 text-amber-700 text-xs text-nowrap font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                  🌟 Star Cast
                                </span>
                              )}
                              <div className="flex justify-end items-start gap-2">
                                <button
                                  className="primary-button green"
                                  onClick={() =>
                                    handleDeleteCharacter(char._id)
                                  }
                                >
                                  <FaPen />
                                </button>
                                <button
                                  className="primary-button red"
                                  onClick={() =>
                                    handleDeleteCharacter(char._id)
                                  }
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Divider Insertion logic */}
                          {index !== paginatedCharacters.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Pagination Dynamic Control Switches Footer */}
                    <div className="flex justify-center items-center gap-4 h-fit w-full mt-8 pt-4 border-t border-t-primary-80">
                      <button
                        className="primary-button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <span className="text-primary-50 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="primary-button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
