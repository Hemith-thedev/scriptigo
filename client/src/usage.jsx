<Dropdown
  openWhen={genresDropdownOpen}
  options={genres}
  placeholder={"Genres"}
  hasmultipleoptions={true}
  onoptionchange={(selectedObjects) => {
    // Ikkada object list ni just values (array of strings) ki marchi update cheyyi
    const selectedValues = selectedObjects.map((obj) => obj.value);
    setData((prev) => ({
      ...prev,
      genres: selectedValues,
    }));
  }}
  ontoggle={() => setGenresDropdownOpen(!genresDropdownOpen)}
  type={"genres"}
/>;

<ColorPicker
  onselect={(color) => {
    setColor(color);
    console.log(color);
  }}
  reset={resetColor}
/>;

function InitAppWindow({ visibleIf, onclick }) {
  return (
    <div className={`init-app-window ${visibleIf ? "" : "hidden"}`}>
      <div className="flex flex-col justify-center items-center">
        <h1>Scriptigo</h1>
        <p>Script with Flow!✨</p>
        <button className="primary-button" onClick={onclick}>
          Let's go!
        </button>
      </div>
    </div>
  );
}

<InitAppWindow
  visibleIf={showWindow && window.location === "/"}
  onclick={() => {
    setShowWindow(false);
  }}
/>;
