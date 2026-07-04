import { useState, useEffect, useRef } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaX, FaPlus } from "react-icons/fa6";

export default function Dropdown({
  openWhen = false,
  options = [
    { label: "Action 1", value: "action 1" },
    {
      label: <span className="text-red-500">Action 2</span>,
      value: "action 2",
    },
    { label: "Action 3", value: "action 3" },
    {
      label: (
        <span className="flex justify-between h-fit w-full">
          <span className="text-ellipsis">Action 4</span>
          <span className="text-green-400">Done</span>
        </span>
      ),
      value: "action 4",
    },
    {
      label: (
        <span className="flex flex-col h-fit w-full">
          <span className="text-ellipsis bg-linear-to-br from-primary-50 via-pink-500 to-red-500 bg-clip-text text-transparent w-fit">
            Action 5
          </span>
          <span className="text-gray-500">Done</span>
        </span>
      ),
      value: "action 5",
    },
  ],
  onoptionchange = () => null,
  ontoggle = () => null,
  hasmultipleoptions = false,
  placeholder = "Select an option",
  type,
  isMenuTop = false,
  hasError = false,
  selectedValue = "",
  data,
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);
  // Use isOpen directly from props to control it from parent
  const isOpen = openWhen;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showClear, setShowClear] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Dropdown.jsx lo search filter update:
  const filteredOptions = options.filter((o) => {
    const searchLower = searchTerm.toLowerCase();

    // 1. Name check
    const nameMatch = String(o.value).toLowerCase().includes(searchLower);

    // 2. Extras (role, age etc.) check
    // Object.values(o.extras) ante extras lo unna prathi value ni check chestundi
    const extrasMatch = o.extras
      ? Object.values(o.extras).some((val) =>
          String(val).toLowerCase().includes(searchLower),
        )
      : false;

    return nameMatch || extrasMatch;
  });
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
    setShowClear(newSelection.length > 0);
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
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        ontoggle();
        setHighlightedIndex(-1);
        break;
    }
  };
  useEffect(() => {
    if (highlightedIndex >= 0 && itemsRef.current[highlightedIndex] && dropdownRef.current) {
      const listElement = dropdownRef.current.querySelector("ul");
      const itemElement = itemsRef.current[highlightedIndex];
      if (listElement && itemElement) {
        const itemTop = itemElement.offsetTop;
        const itemHeight = itemElement.offsetHeight;
        const listHeight = listElement.offsetHeight;
        const scrollTop = listElement.scrollTop;
        const buffer = 6;
        if (itemTop < scrollTop + buffer) {
          listElement.scrollTop = itemTop - buffer;
        } else if (itemTop + itemHeight > scrollTop + listHeight - buffer) {
          listElement.scrollTop = itemTop + itemHeight - listHeight + buffer;
        }
      }
      itemsRef.current[highlightedIndex].scrollIntoView({
        behaviour: "smooth",
        block: "nearest"
      })
    }
  }, [highlightedIndex]);
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
    if (inputRef.current) {
      if (isOpen) {
        inputRef.current.focus();
      } else {
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    }
  }, [isOpen]);

  // Change this line inside Dropdown.jsx [source: 1]
  const displayPlaceholder =
    selectedOptions.length > 0
      ? `${placeholder} - ${selectedOptions.map((o) => o.value).join(", ")}`
      : placeholder;

  useEffect(() => {
    // Reset chese logic ikkada perfect ga untundi
    if (!selectedValue || selectedValue.length === 0) {
      setSelectedOptions([]);
    } else if (!hasmultipleoptions) {
      const matched = options.find((o) => o.value === selectedValue);
      if (matched) setSelectedOptions([matched]);
    } else {
      // Multiple options unte, selectedValue (array) ni map chesi set cheyali
      const matched = options.filter((o) => selectedValue.includes(o.value));
      setSelectedOptions(matched);
    }
  }, [selectedValue, options.length, hasmultipleoptions]);

  return (
    <div
      className="relative flex flex-col justify-start items-center h-full w-full"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`flex justify-between items-center h-full w-full border-b-2 py-3 px-4 ${isOpen ? "border-b-primary-50" : "border-b-primary-20"} ${hasError ? "border-b-red-500" : ""} px-2 outline-none`}
      >
        <p
          className={`truncate ${isOpen ? "text-primary-50" : "text-primary-20"} ${hasError ? "text-red-500" : ""}`}
          onClick={() => ontoggle()}
          title={`${selectedOptions.map((o) => o.value).join(", ")}`}
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
        className={`absolute left-0 w-full z-50 flex flex-col justify-start items-start max-h-64 p-1.5 rounded-2xl bg-white-dark/40 backdrop-blur-lg border border-primary-80 overflow-y-auto no-scrollbar transition-all duration-300 ease-out
        ${
          isMenuTop
            ? "bottom-full mb-3 origin-bottom" // True: Trigger button paina correct ga styles stack avutayi
            : "top-full mt-3 origin-top" // False: Trigger button kinda automatic auto space sequence setup
        } 
        ${
          isOpen
            ? "pointer-events-auto opacity-100 scale-100 blur-none"
            : "pointer-events-none opacity-0 scale-95 blur-xl" // Extreme blur frames change chesa for lag avoidance
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full p-2 mb-2 border-b border-primary-20 outline-none text-sm"
          placeholder={`Search ${placeholder}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()} // Dropdown close avvakunda chudali
          onKeyDown={handleKeyDown}
        />
        {/* Dropdown list lo starting lo "Unselect" option */}
        {filteredOptions.map((option, index) => (
          <li
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            className="flex flex-col justify-start items-start h-fit w-full"
          >
            <button
              type="button"
              className={`flex justify-start items-center h-fit w-full p-2 ${index === filteredOptions.length - 1 ? "rounded-b-xl" : ""} ${index === 0 ? "rounded-t-xl" : ""} ${filteredOptions.length === 0 ? "rounded-xl" : ""} cursor-pointer ${
                selectedOptions.find((o) => o.value === option.value)
                  ? "bg-white-light"
                  : ""
              } hover:bg-white-theme/80 ${highlightedIndex === index ? "bg-primary-80! text-white!" : ""}`}
              onClick={() => {
                if (selectedOptions) {
                  handleOptionSelect(option);
                }
              }}
            >
              <p className="h-fit w-full text-left">{option.label}</p>
            </button>
          </li>
        ))}
        {type === "genres" && (
          <button
            type="button"
            className="flex justify-start items-center h-fit w-full p-2 rounded-xl bg-gold-30 cursor-pointer hover:bg-white"
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
              navigate("/genres");
            }}
          >
            <p className="flex justify-start items-center gap-2 text-primary-50">
              <span>
                <FaPlus />
              </span>{" "}
              Add Genre
            </p>
          </button>
        )}
        {type === "characters" && data && typeof data === "object" && (
          <button
            type="button"
            className="flex justify-start items-center h-fit w-full p-2 rounded-xl bg-gold-30 cursor-pointer hover:bg-white"
            onClick={() => {
              setSelectedOptions([]);
              onoptionchange([]);
              navigate(`/stories/${data.id}/characters`);
            }}
          >
            <p className="flex justify-start items-center gap-2 text-primary-50">
              <span>
                <FaPlus />
              </span>{" "}
              Add Character
            </p>
          </button>
        )}
      </ul>
    </div>
  );
}
