import { useState, useEffect, useRef } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaX } from "react-icons/fa6";

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
  isMenuTop = false,
  hasError = false,
  selectedValue = "",
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
      newSelection = [option] || "";
      ontoggle(); // Close the dropdown
    }

    setSelectedOptions(newSelection);
    if (onoptionchange) {
      if (hasmultipleoptions) {
        onoptionchange(newSelection);
      } else {
        onoptionchange(option);
      }
    }

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

  // Change this line inside Dropdown.jsx [source: 1]
  const displayPlaceholder =
    selectedOptions.length > 0
      ? `${placeholder} - ${selectedOptions.map((o) => o.label).join(", ")}`
      : placeholder;

  useEffect(() => {
    if (!selectedValue) {
      setSelectedOptions([]); // Clears selection instantly when parent resets state to ""
    } else if (!hasmultipleoptions) {
      // Keep dropdown display in sync if a single value is set from outside
      const matched = options.find((o) => o.value === selectedValue);
      if (matched) setSelectedOptions([matched]);
    }
  }, [selectedValue, options, hasmultipleoptions]);

  return (
    <div
      className="relative flex flex-col justify-start items-center h-full w-full"
      ref={dropdownRef}
    >
      <button
        className={`flex justify-between items-center h-full w-full border-b-2 py-3 px-4 ${isOpen ? "border-b-primary-50" : "border-b-primary-20"} ${hasError ? "border-b-red-500" : ""} px-2 outline-none`}
      >
        <p
          className={`truncate ${isOpen ? "text-primary-50" : "text-primary-20"} ${hasError ? "text-red-500" : ""}`}
          onClick={() => ontoggle()}
        >
          {displayPlaceholder}
        </p>
        <div className="flex justify-end items-center gap-4">
          <div
            className={`flex justify-start items-center h-fit p-2 rounded-xl text-red-400 hover:bg-red-200 cursor-pointer ${selectedOptions.length ? "opacity-100 blur-none pointer-events-auto" : "opacity-0 blur-3xl pointer-events-none"}`}
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
            }}
          >
            <FaX />
          </div>
          <IoMdArrowDropdown
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <ul
        className={`absolute ${isMenuTop ? "-top-56" : "top-16"} ${!isOpen && isMenuTop && "-top-64"} ${!isOpen && !isMenuTop && "top-24"} ${isOpen ? "pointer-events-auto opacity-100 blur-none" : "pointer-events-none opacity-0 blur-3xl"} z-50 flex flex-col justify-start items-start max-h-64 w-full p-1.5 rounded-2xl bg-white-dark/40 backdrop-blur-lg border border-primary-80 overflow-y-auto no-scrollbar`}
      >
        {/* Dropdown list lo starting lo "Unselect" option */}
        {options.map((option, index) => (
          <li
            key={index}
            className="flex flex-col justify-start items-start h-fit w-full"
          >
            <button
              className={`flex justify-start items-center h-fit w-full p-2 ${index === options.length - 1 ? "rounded-b-xl" : ""} ${index === 0 ? "rounded-t-xl" : ""} cursor-pointer ${
                selectedOptions.find((o) => o.value === option.value)
                  ? "bg-white-light font-bold"
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
            className="flex justify-start items-center h-fit w-full p-2 rounded-xl bg-gold-30 cursor-pointer hover:bg-white"
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
              navigate("/genres");
            }}
          >
            <p>Add Genre</p>
          </button>
        )}
      </ul>
    </div>
  );
}
