import { useEffect, useState } from "react";
import { MdHistory } from "react-icons/md";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { RiResetLeftFill } from "react-icons/ri";

export default function ColorPicker({ onchange = () => String, onselect = () => String, reset }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(100);
  const [label, setLabel] = useState(
    `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const color = { hue: hue, saturation: saturation, lightness, lightness };
  const [elementHovered, setElementHovered] = useState({
    hue: true,
    saturation: true,
    lightness: true,
  });
  const [generatedColors, setGeneratedColors] = useState([]);
  const [colorId, setColorId] = useState(null);
  useEffect(() => {
    setLabel(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    onchange(`hsl(${hue},${saturation}%,${lightness}%)`);
  }, [hue, saturation, lightness]);
  useEffect(() => {
    if (colorId !== null) {
      setHue(generatedColors[colorId].hue);
      setSaturation(generatedColors[colorId].saturation);
      setLightness(generatedColors[colorId].lightness);
    }
  }, [colorId]);
  const generatePerfectColor = () => {
    // Hue: 0 to 360 (Anni rainbow colors cover avtayi)
    setHue(Math.floor(Math.random() * 361));
    // Saturation: 70% to 90% (Vibrant ga, organic ga undadaniki)
    setSaturation(Math.floor(Math.random() * 21) + 70);
    // Lightness: 45% to 55% (Chala dark checked & chala light checked boundary)
    setLightness(Math.floor(Math.random() * 11) + 45);
    setGeneratedColors((prev) => [...prev, color]);
  };
  const resetColor = () => {
    setHue(0);
    setSaturation(0);
    setLightness(100);
  };
  const checkColor = () => {
    onselect(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    setSelectedColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    setIsOpen(false);
  }
  useEffect(() => {
    if (reset) {
      setHue(0);
      setSaturation(0);
      setLightness(100);
      setLabel(`hsl(${0}, ${0}%, ${100}%)`);
      setSelectedColor("");
    } else {
      return;
    }
  }, [reset]);
  return (
    <div className="relative flex flex-col justify-start items-center h-full w-full">
      <button
        className="flex justify-between items-center gap-2 h-full w-full border-b-2 border-b-gold-20 p-1.5 outline-none cursor-pointer"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className="text-gold-30 text-nowrap">Color -</p>
        <div
          style={{
            backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          }}
          className="flex justify-center items-center h-full w-full rounded-xl"
        >
        </div>
      </button>
      <div
        className={`absolute ${isOpen ? "top-16 pointer-events-auto blur-none opacity-100" : "top-20 pointer-events-none blur-xl opacity-0"} z-50 flex flex-col justify-start items-start gap-2 max-h-84 w-full p-1.5 rounded-2xl bg-black-light/40 backdrop-blur-lg border border-white/10 overflow-y-auto no-scrollbar`}
      >
        <div className="sticky top-0 flex justify-between items-center p-2 pl-4 bg-black-theme rounded-xl h-fit w-full">
          <p>{historyOpen ? "History" : label}</p>
          <div className="flex">
            <button
              type="button"
              className={`min-h-6 min-w-6 p-2 bg-transparent rounded-md cursor-pointer ${historyOpen ? "bg-white-theme text-black-theme" : "bg-transparent hover:bg-black-light"}`}
              onClick={() => setHistoryOpen((prev) => !prev)}
            >
              <MdHistory className="size-full" />
            </button>
          </div>
        </div>
        {historyOpen ? (
          <>
            {generatedColors.map((color, index) => {
              const this_color = `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
              return (
                <div
                  className="flex justify-between items-center h-fit w-full p-2 cursor-pointer hover:bg-black-light rounded-xl"
                  onClick={() => {
                    setColorId(index);
                    setHistoryOpen(false);
                  }}
                >
                  <div
                    className="min-h-10 min-w-10 rounded-md"
                    style={{
                      background: this_color,
                    }}
                  />
                  <p>{this_color}</p>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <div
              style={{
                backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
              }}
              className="flex min-h-24 w-full rounded-xl"
            ></div>
            <input
              type="range"
              value={hue}
              min={0}
              max={360}
              onChange={(e) => setHue(e.target.value)}
              className="hue"
              onMouseOver={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: true,
                  saturation: false,
                  lightness: false,
                }))
              }
              onMouseLeave={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: true,
                  saturation: true,
                  lightness: true,
                }))
              }
              style={{
                opacity: elementHovered.hue ? 1 : 0.3,
              }}
            />
            <input
              type="range"
              value={saturation}
              min={0}
              max={100}
              onChange={(e) => setSaturation(e.target.value)}
              className="saturation"
              style={{
                background: `linear-gradient(to right, black, hsl(${hue}, 100%, 50%))`,
                opacity: elementHovered.saturation ? 1 : 0.3,
              }}
              onMouseOver={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: false,
                  saturation: true,
                  lightness: false,
                }))
              }
              onMouseLeave={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: true,
                  saturation: true,
                  lightness: true,
                }))
              }
            />
            <input
              type="range"
              value={lightness}
              min={0}
              max={100}
              onChange={(e) => setLightness(e.target.value)}
              className="lightness"
              style={{
                background: `linear-gradient(to right, black, hsl(${hue}, ${saturation}%, 50%), white)`,
                opacity: elementHovered.lightness ? 1 : 0.3,
              }}
              onMouseOver={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: false,
                  saturation: false,
                  lightness: true,
                }))
              }
              onMouseLeave={() =>
                setElementHovered((prev) => ({
                  ...prev,
                  hue: true,
                  saturation: true,
                  lightness: true,
                }))
              }
            />
            <div className="flex justify-center items-center gap-1.5 h-fit w-full">
              <button
                className="primary-button text-2xl"
                onClick={generatePerfectColor}
                type="button"
              >
                <GiPerspectiveDiceSixFacesRandom />
              </button>
              <button
                className="primary-button red text-2xl"
                onClick={resetColor}
                type="button"
              >
                <RiResetLeftFill />
              </button>
              <button
                className="primary-button w-full green"
                onClick={checkColor}
                type="button"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
