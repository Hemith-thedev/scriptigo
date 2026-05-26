import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaX, FaPlus } from "react-icons/fa6";
import { useMemo } from "react";

const base_url = "http://localhost:5000/api";

export default function StoryLink() {
  const { id } = useParams();
  const [genres, setGenres] = useState([]);
  const [stories, setStories] = useState([]);
  const [story, setStory] = useState({});
  const fetchGenres = async () => {
    const res = await axios.get(`${base_url}/genres`);
    setGenres(Array.isArray(res.data.data) ? res.data.data : []);
  };
  const fetchStories = async () => {
    const res = await axios.get(`${base_url}/stories`);
    setStories(Array.isArray(res.data.data) ? res.data.data : []);
  };
  const fetchStory = async () => {
    const res = await axios.get(`${base_url}/stories/${id}`);
    setStory(res.data.data);
    console.log(res.data.data);
  };
  useEffect(() => {
    fetchGenres();
    fetchStories();
    fetchStory();
  }, []);
  const StoryGenres = useMemo(() => {
    return typeof story.genres === "string"
      ? JSON.parse(story.genres)
      : Array.isArray(story.genres)
        ? story.genres
        : [];
  }, [story.genres]);
  const [editingGenres, setEditingGenres] = useState([]);
  const uncommonGenres = useMemo(() => {
    // genres lo unna 'name' ni, StoryGenres (strings) tho compare cheyyali
    return genres
      .filter((g) => !StoryGenres.includes(g.name))
      .filter((g) => !editingGenres.includes(g.name));
  }, [genres, StoryGenres]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(story.title);
  const [finalGenres, setFinalGenres] = useState(StoryGenres);
  useEffect(() => {
    const EditingTitleElement = document.getElementById("editingTitle");
    const handleClickOutside = (event) => {
      if (EditingTitleElement && !EditingTitleElement.contains(event.target)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
  console.log(story.genres, editingGenres);
  return (
    <main className="scriptigo-page">
      <section className="scriptigo-section z-10">
        <div className="scriptigo-section-wrapper flex-col">
          <div
            className={`scriptigo-form no-padding bg-transparent! ${isEditing ? "select-auto" : "select-none"}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className={`${isEditing ? "pointer-events-auto" : "pointer-events-none border-0!"} text-5xl`}
              id="editingTitle"
              readOnly={!isEditing}
            />
          </div>
          <div className="flex flex-col justify-start items-start gap-4 h-fit w-full p-8 rounded-4xl bg-black-light">
            <h6>Genres</h6>
            <div className="flex flex-wrap gap-2 h-fit w-full">
              {StoryGenres.map((g, index) => (
                <div
                  key={index}
                  className="flex justify-start items-center gap-2 p-2 bg-black-theme/30 rounded-xl"
                >
                  <p>{g}</p>
                  <button
                    className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme/10  cursor-pointer"
                    onClick={() => {
                      setGenres((prev) => [...prev, g.anme]);
                    }}
                  >
                    <FaX className="size-2" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex h-0.5 w-full bg-white-light/20 rounded-md"></div>
            {editingGenres.length === 0 ? (
              <p>You have not added any Genre yet!</p>
            ) : (
              <div className="flex flex-wrap gap-2 h-fit w-full">
                {editingGenres
                  .sort((a, b) => a.localeCompare(b))
                  .map((g, index) => (
                    <div
                      key={index}
                      className="flex justify-start items-center gap-2 p-2 bg-black-theme/30 rounded-xl"
                    >
                      <p>{g}</p>
                      <button
                        className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme/10  cursor-pointer"
                        onClick={() => {
                          setEditingGenres((prev) =>
                            prev.filter((genre) => genre !== g),
                          );
                        }}
                      >
                        <FaX className="size-2" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper flex-col py-6">
          <div className="relative flex h-fit w-full">
            <div className="min-h-1 w-full rounded-[50%] bg-gold-50 mix-blend-plus-lighter"></div>
            <div className="absolute min-h-1 w-full rounded-[50%] bg-gold-50 mix-blend-plus-lighter blur-xl"></div>
            <div className="absolute min-h-1 w-full rounded-[50%] bg-gold-50 mix-blend-plus-lighter blur-xl"></div>
          </div>
        </div>
      </section>
      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper flex-col">
          <div className="flex flex-wrap gap-2">
            {uncommonGenres
              .filter((genre) => !editingGenres.includes(genre.name))
              .map((g) => (
                <div
                  key={g.id}
                  className="flex justify-start items-center gap-2 p-2 bg-black-light rounded-xl"
                >
                  <p>{g.name}</p>
                  <button
                    className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-black-theme cursor-pointer"
                    onClick={() => {
                      setEditingGenres((prev) => [...prev, g.name]);
                    }}
                  >
                    <FaPlus className="size-2" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
