import React, { useState } from "react";
import Dropdown from "../common/Dropdown";
import emotionOptions from "../../data/emotions.json";
import axios from "axios";

export default function AddVocalForm({ characters = [], storyId }) {
  const [vocal, setVocal] = useState({
    story_id: storyId,
    scene_id: "scene_2",
    order_id: 1,
    type: "speaking",
    speaker_name: "",
    emotions: [],
    action: "",
    vocal: [""],
    is_hidden: false,
    is_important: true,
    tags: ["plot-point"],
    is_next_scene: false,
  });

  const [isCharactersDropdownOpen, setIsCharactersDropdownOpen] =
    useState(false);
  const [isEmotionsDropdownOpen, setIsEmotionsDropdownOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verification layer checking
    if (
      !vocal.speaker_name ||
      !vocal.vocal[0] ||
      vocal.vocal[0].trim() === ""
    ) {
      alert("Speaker name and dialogue field fill cheyi mama! 📝");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/scripts/${storyId}/vocals`,
        vocal,
      );

      alert("Dialogue successfully add ayindi mama! 🎉💖");

      // Complete reset logic array tracking variable configuration directly setup execution clear tracking
      setVocal({
        story_id: storyId,
        scene_id: "scene_2",
        order_id: 1,
        type: "speaking",
        speaker_name: "", // Triggers standard single selection dropdown array reset logic safely
        emotions: [], // Triggers array standard mapping verification execution sequence logic safely
        action: "",
        vocal: [""],
        is_hidden: false,
        is_important: true,
        tags: ["plot-point"],
        is_next_scene: false,
      });
    } catch (error) {
      console.error("Error saving vocal:", error);
      alert("Something went wrong, malli try cheyi mama! 😟");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start w-full">
      <h3 className="text-2xl font-bold text-primary-50 mb-8 text-center w-full">
        New Vocal Script 🎙️
      </h3>

      <div className="flex items-center mb-4 gap-2">
        <input
          type="checkbox"
          checked={vocal.is_next_scene}
          onChange={(e) =>
            setVocal((prev) => ({ ...prev, is_next_scene: e.target.checked }))
          }
          className="w-5 h-5 cursor-pointer"
        />
        <label className="text-sm cursor-pointer select-none">
          Next Scene ki vellali (Check cheyi!)
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(500px,1fr))] h-fit w-full gap-6 relative z-50">
        {/* Character Single Dropdown Configuration Component Layer */}
        <div className="w-full relative">
          <Dropdown
            placeholder="Character"
            options={
              characters
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => {
                  const { name, ...extras } = c;
                  return {
                    label: (
                      <span className="flex justify-between items-start w-full text-left">
                        <span className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {c.name} {c.age ? `- ${c.age}` : ""}
                          </span>
                          <span className="text-xs text-gray-500">
                            {c.role || "No Role"}
                          </span>
                        </span>
                        {c.isStarring && (
                          <span className="text-amber-500">✨</span>
                        )}
                      </span>
                    ),
                    value: c.name,
                    extras: extras,
                  };
                }) || []
            }
            openWhen={isCharactersDropdownOpen}
            ontoggle={() => {
              setIsCharactersDropdownOpen((prev) => !prev);
              setIsEmotionsDropdownOpen(false);
            }}
            onoptionchange={(opt) =>
              setVocal((prev) => ({ ...prev, speaker_name: opt?.value || "" }))
            }
            selectedValue={vocal.speaker_name} // Reset state logic matching binding setup frame clear link
            type={"characters"}
            data={{ id: storyId }}
          />
        </div>

        {/* Emotions Multiple Selection Dropdown Component Setup Layer */}
        <div className="w-full relative">
          <Dropdown
            hasmultipleoptions={true}
            placeholder="Emotions"
            options={
              emotionOptions
                ?.sort((a, b) => a.label.localeCompare(b.label))
                .map((c) => {
                  return {
                    ...c,
                    label: (
                      <span
                        className="flex justify-between items-start w-full text-left"
                        title={c.extras?.situation || ""}
                      >
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {c.label}
                          </span>
                          {c.extras?.tags && (
                            <span className="text-xs text-gray-400">
                              {c.extras.tags.join(", ")}
                            </span>
                          )}
                        </span>
                      </span>
                    ),
                  };
                }) || []
            }
            openWhen={isEmotionsDropdownOpen}
            ontoggle={() => {
              setIsEmotionsDropdownOpen((prev) => !prev);
              setIsCharactersDropdownOpen(false);
            }}
            onoptionchange={(opts) => {
              const selectedEmotions = Array.isArray(opts)
                ? opts.map((o) => o.value)
                : [];
              setVocal((prev) => ({ ...prev, emotions: selectedEmotions }));
            }}
            // FIXED CONDITION HERE FOR RESET ENGINE TO TRIGGER SYNC SAFELY WITHIN CHILD TARGET PROPERTIES:
            selectedValue={
              vocal.emotions.length > 0 ? vocal.emotions.join(", ") : ""
            }
          />
        </div>
      </div>

      <div className="w-full mt-6">
        <input
          className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none transition-colors"
          placeholder="Action Description (e.g. He steps forward slowly...)"
          value={vocal.action}
          onChange={(e) =>
            setVocal((prev) => ({ ...prev, action: e.target.value }))
          }
        />
      </div>

      <div className="w-full mt-6">
        <label className="text-sm font-semibold text-primary-20 ml-2">
          Dialogue Context
        </label>
        <textarea
          className="w-full mt-2 p-4 h-32 rounded-3xl border-2 border-primary-20 outline-none focus:border-primary-50 resize-none transition-all"
          placeholder="Character em matladuthunnaro ikkada rayi mama..."
          value={vocal.vocal[0] || ""}
          onChange={(e) =>
            setVocal((prev) => ({ ...prev, vocal: [e.target.value] }))
          }
        ></textarea>
      </div>

      <button
        type="submit"
        className="primary-button mt-8 w-full py-4 rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all"
      >
        Add Vocal Script ✨
      </button>
    </form>
  );
}
