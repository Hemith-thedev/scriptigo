import { useState } from "react";
import Dropdown from "../components/common/Dropdown";

export default function StoryScriptsPage() {
  const [isSpeakerDropdownOpen, setIsSpeakerDropdownOpen] = useState(true);
  return (
    <main className="scriptigo-page">
      <div />
      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper">Script Thread</div>
      </section>
      <section className="scriptigo-section fixed bottom-0 left-0 p-4">
        <div className="scriptigo-section-wrapper">
          <Dropdown
            openWhen={isSpeakerDropdownOpen}
            ontoggle={() => {
              setIsSpeakerDropdownOpen((prev) => !prev);
            }}
            isMenuTop
          />
        </div>
      </section>
    </main>
  );
}
