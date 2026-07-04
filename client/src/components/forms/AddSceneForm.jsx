import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Dropdown from "../common/Dropdown";

const SYMBOLS = [
  // --- COMMON SYMBOLS ---
  {
    label: "Trademark",
    value: "™",
    extras: { type: "symbol", unicode: "U+2122", name: "TRADE MARK SIGN" },
  },
  {
    label: "Registered",
    value: "®",
    extras: { type: "symbol", unicode: "U+00AE", name: "REGISTERED SIGN" },
  },
  {
    label: "Copyright",
    value: "©",
    extras: { type: "symbol", unicode: "U+00A9", name: "COPYRIGHT SIGN" },
  },
  {
    label: "Degree",
    value: "°",
    extras: { type: "symbol", unicode: "U+00B0", name: "DEGREE SIGN" },
  },

  // --- TEXT ENDINGS ---
  {
    label: "th",
    value: "ᵗʰ",
    extras: {
      type: "text-ending",
      elements: ["ᵗ", "ʰ"],
      usage: "ordinal numbers",
    },
  },
  {
    label: "st",
    value: "ˢᵗ",
    extras: {
      type: "text-ending",
      elements: ["ˢ", "ᵗ"],
      usage: "ordinal numbers",
    },
  },
  {
    label: "nd",
    value: "ⁿᵈ",
    extras: {
      type: "text-ending",
      elements: ["ⁿ", "ᵈ"],
      usage: "ordinal numbers",
    },
  },
  {
    label: "rd",
    value: "ʳᵈ",
    extras: {
      type: "text-ending",
      elements: ["ʳ", "ᵈ"],
      usage: "ordinal numbers",
    },
  },

  // --- NUMBERS ---
  {
    label: "Zero",
    value: "⁰",
    extras: { type: "number", math: "exponent", original: "0" },
  },
  {
    label: "One / First",
    value: "¹",
    extras: { type: "number", math: "exponent", original: "1" },
  },
  {
    label: "Two / Squared",
    value: "²",
    extras: { type: "number", math: "exponent", original: "2" },
  },
  {
    label: "Three / Cubed",
    value: "³",
    extras: { type: "number", math: "exponent", original: "3" },
  },
  {
    label: "Four",
    value: "⁴",
    extras: { type: "number", math: "exponent", original: "4" },
  },
  {
    label: "Five",
    value: "⁵",
    extras: { type: "number", math: "exponent", original: "5" },
  },
  {
    label: "Six",
    value: "⁶",
    extras: { type: "number", math: "exponent", original: "6" },
  },
  {
    label: "Seven",
    value: "⁷",
    extras: { type: "number", math: "exponent", original: "7" },
  },
  {
    label: "Eight",
    value: "⁸",
    extras: { type: "number", math: "exponent", original: "8" },
  },
  {
    label: "Nine",
    value: "⁹",
    extras: { type: "number", math: "exponent", original: "9" },
  },

  // --- MATH OPERATORS ---
  {
    label: "Plus",
    value: "⁺",
    extras: { type: "operator", math: "positive", original: "+" },
  },
  {
    label: "Minus",
    value: "⁻",
    extras: { type: "operator", math: "negative", original: "-" },
  },
  {
    label: "Equals",
    value: "⁼",
    extras: { type: "operator", math: "equality", original: "=" },
  },
];

export default function AddSceneForm({ storyId }) {
  const { id } = useParams();
  const [scene, setScene] = useState("");
  const [isNextScene, setIsNextScene] = useState(false); // Toggle state
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState("");

  useEffect(() => {
    if (selectedCharacter) {
      setScene((prev) => prev + selectedCharacter);
      setSelectedCharacter("");
    }
  }, [selectedCharacter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scene.trim()) return alert("Scene description rayali kada mama! ✍️");

    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/scripts", {
        story_id: id,
        order_id: 1,
        type: "scene",
        action: scene,
        is_next_scene: isNextScene, // Backend ki mana toggle logic pamputhunnam
        vocal: [],
      });
      setScene("");
      alert("Scene add ayindi mama! 🎉");
    } catch (error) {
      console.error(error);
      alert("Error vachindi mama, malli try cheyi! 😟");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full p-4">
      <div className="flex justify-between items-start h-fit w-full">
        <h3 className="text-primary-50 font-bold mb-2">Scene Explanation ✨</h3>
        <div>
          <Dropdown
            openWhen={isDropdownOpen}
            ontoggle={() => setIsDropdownOpen((prev) => !prev)}
            options={SYMBOLS}
            onoptionchange={(option) => {
              setSelectedCharacter(option.value);
            }}
            selectedValue={selectedCharacter}
          />
        </div>
      </div>

      {/* Scene Toggle UI */}
      <div className="flex items-center mb-4 gap-2">
        <input
          type="checkbox"
          checked={isNextScene}
          onChange={() => setIsNextScene(!isNextScene)}
          className="w-5 h-5"
        />
        <label className="text-sm">Next Scene ki vellali (Check cheyi!)</label>
      </div>

      <textarea
        className="w-full p-4 h-32 rounded-3xl border-2 border-primary-20 focus:border-primary-50 outline-none resize-none"
        placeholder="Scene details ikkada rayi..."
        value={scene}
        onChange={(e) => setScene(e.target.value)}
      ></textarea>

      <button
        type="submit"
        className="primary-button mt-4"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Scene"}
      </button>
    </form>
  );
}
