import { useState, useEffect, useRef } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export default function Dropdown({
  openWhen = false,
  options = [
    { label: "Action 1", value: "action 1" },
    { label: "Action 2", value: "action 2" },
    { label: "Action 3", value: "action 3" },
    { label: "Action 4", value: "action 4" },
    { label: "Action 5", value: "action 5" },
  ],
  onoptionchange,
  ontoggle,
  hasmultipleoptions = false,
  placeholder = "Select an option",
  type,
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  // Use isOpen directly from props to control it from parent
  const isOpen = openWhen;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showClear, setShowClear] = useState(false);
  const handleOptionSelect = (option) => {
    let newSelection;
    if (hasmultipleoptions) {
      const isSelected = selectedOptions.find((o) => o.value === option.value);
      newSelection = isSelected
        ? selectedOptions.filter((o) => o.value !== option.value)
        : [...selectedOptions, option];
    } else {
      newSelection = [option];
      ontoggle(); // Close the dropdown
    }

    setSelectedOptions(newSelection);
    if (onoptionchange) onoptionchange(newSelection);

    // Select chesina ventane state reset cheyi,
    // malli open chesinappudu timer work avvali kabatti
    setShowClear(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Oka vela dropdown open unna, click chesthunna element dropdown bayata unna, close chey
      if (
        openWhen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        ontoggle(); // Parent ki call chestunnam, adhi false chese la undali
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openWhen, ontoggle]); // openWhen change ayinappudu update avvali
  useEffect(() => {
    if (openWhen) {
      setShowClear(true);
    } else {
      setShowClear(false);
    }
  }, [openWhen, selectedOptions]);
  // Determine display text
  const displayPlaceholder =
    selectedOptions.length > 0
      ? selectedOptions.map((o) => o.label).join(", ")
      : placeholder;

  return (
    <div
      className="relative flex flex-col justify-start items-center h-full w-full"
      ref={dropdownRef}
    >
      <button
        className="flex justify-between items-center h-full w-full border-b-2 border-b-gold-20 px-2 outline-none"
        onClick={() => ontoggle()}
      >
        <p className="truncate text-gold-30">{displayPlaceholder}</p>
        <IoMdArrowDropdown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        className={`absolute ${isOpen ? "top-16 pointer-events-auto blur-none opacity-100" : "top-20 pointer-events-none blur-xl opacity-0"} z-50 flex flex-col justify-start items-start max-h-64 w-full p-1.5 rounded-2xl bg-black-light/40 backdrop-blur-lg border border-white/10 overflow-y-auto no-scrollbar`}
      >
        {/* Dropdown list lo starting lo "Unselect" option */}
        {showClear && selectedOptions.length > 0 && (
          <button
            className="flex justify-start items-center h-fit w-full p-2 rounded-xl text-red-400 hover:bg-black-light"
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
            }}
          >
            <p>{hasmultipleoptions ? "Clear All" : "Unselect"}</p>
          </button>
        )}
        {options.map((option, index) => (
          <li
            key={index}
            className="flex flex-col justify-start items-start h-fit w-full"
          >
            <button
              className={`flex justify-start items-center h-fit w-full p-2 rounded-xl hover:bg-black-light cursor-pointer ${
                selectedOptions.find((o) => o.value === option.value)
                  ? "bg-black-light font-bold"
                  : ""
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <p>{option.label}</p>
            </button>
          </li>
        ))}
        {type === "genres" && (
          <button
            className="flex justify-start items-center h-fit w-full p-2 rounded-xl bg-gold-30 hover:bg-gold-20 cursor-pointer"
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
              navigate("/genres")
            }}
          >
            <p>Add Genre</p>
          </button>
        )}
      </ul>
    </div>
  );
}
