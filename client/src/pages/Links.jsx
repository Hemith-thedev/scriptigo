import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX, FaLink } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function LinksPage() {
  const [genres, setGenres] = useState([]);
  const [stories, setStories] = useState([]);
  const [tags, setTags] = useState([]);
  const fetchGenres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/genres");
      const genreList = res.data.data || [];
      const ALL_GENRES = genreList.map((g) => ({
        label: g.name,
        value: g.name,
      }));
      setGenres(ALL_GENRES);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };
  const fetchStories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stories");
      setStories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };
  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  useEffect(() => {
    fetchGenres();
    fetchStories();
    fetchTags();
  }, []);
  const StoryCard = ({ details }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(details.title || "");
    const [storyGenres, setStoryGenres] = useState(
      JSON.parse(details.genres || []),
    );
    return (
      <div className="flex justify-between items-start h-fit w-full p-8 bg-black-light rounded-4xl">
        <div className="flex flex-col justify-start items-start h-fit w-full">
          <h4 className="text-gold-50">{details.title}</h4>
          <div className="flex justify-start items-start gap-2">
            {storyGenres.map((g, index) => (
              <div key={index} className="p-2 bg-black-theme/30 rounded-xl">
                <p>{g}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-start items-end gap-2">
          <button
            className="primary-button yellow"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/link-to/story/${details._id}`);
            }}
          >
            <FaLink />
          </button>
        </div>
      </div>
    );
  };
  return (
    <>
      <main className="scriptigo-page">
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper flex-col gap-4">
            {stories.map((story, index) => (
              <StoryCard key={story._id} details={story} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
