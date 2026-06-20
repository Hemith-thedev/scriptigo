import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";

export default function StoryCharactersPage() {
  const { id } = useParams();
  const [story, setStory] = useState({});
  const [characters, setCharacters] = useState([]);
  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await axios.get(`http://localhost:5000/api/stories/${id}`);
        setStory(res.data.data || {});
        setCharacters(res.data.data.characters || []);
      } catch (error) {
        console.error(error);
      }
    }
    fetchStory();
  }, []);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  return (
    <main className="scriptigo-page">
      <section className="scriptigo-section flex-col">
        <h3>{story.title}</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 h-fit w-full">
          <input
            type="text"
            className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none"
            placeholder="Name"
          />
          <Dropdown
            openWhen={isRoleDropdownOpen}
            options={[{ label: "Hero", value: "Hero" }]}
            placeholder={"Genres"}
            hasmultipleoptions={true}
            onoptionchange={(selectedObjects) => {
              // Ikkada object list ni just values (array of strings) ki marchi update cheyyi
              const selectedValues = selectedObjects.map((obj) => obj.value);
              setRole(selectedObjects);
              cn
            }}
            ontoggle={() => setIsRoleDropdownOpen((prev) => !prev)}
          />
        </div>
      </section>
    </main>
  );
}
