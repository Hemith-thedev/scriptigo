import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaX, FaPlus } from "react-icons/fa6";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const base_url = "http://localhost:5000/api";

export default function StoryAttachmentPage() {
  const { id } = useParams();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [story, setStory] = useState({});
  const [tags, setTags] = useState([]);
  const [genres, setGenres] = useState([]);
  const [assignedTags, setAssignedTags] = useState([]);
  const [assignedGenres, setAssignedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  useEffect(() => {
    setPageLoaded(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  useGSAP(
    () => {
      if (!pageLoaded) return;
      const tl = gsap.timeline({ delay: 0.2 });
      tl.fromTo(
        [
          ".story-title",
          ".scriptigo-section-wrapper > h4", // Titles
          ".scriptigo-section-wrapper > div", // Containers & Tags
        ],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.25, // Stagger koncham thaggichanu, smooth ga untundi
          ease: "power2.out",
        },
      );
    },
    {
      scope: document.querySelector(".scriptigo-page"),
      dependencies: [pageLoaded],
    },
  );

  // Fetch story details
  const fetchStory = async () => {
    try {
      const res = await axios.get(`${base_url}/stories/${id}`);
      setStory(res.data.data);
      setEditingTitle(res.data.data.title);
      const storyTags = Array.isArray(res.data.data.tags)
        ? res.data.data.tags
        : [];
      setAssignedTags(storyTags);

      const storyGenres = Array.isArray(res.data.data.genres)
        ? res.data.data.genres
        : [];
      setAssignedGenres(storyGenres);
    } catch (error) {
      console.error("Error fetching story:", error);
    }
  };

  // Fetch all tags
  const fetchTags = async () => {
    try {
      const res = await axios.get(`${base_url}/tags`);
      setTags(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Fetch all genres
  const fetchGenres = async () => {
    try {
      const res = await axios.get(`${base_url}/genres`);
      setGenres(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStory(), fetchTags(), fetchGenres()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

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

  // Get available tags (not already assigned)
  const availableTags = useMemo(() => {
    return tags.filter((tag) => !assignedTags.includes(tag.name));
  }, [tags, assignedTags]);

  // Get available genres (not already assigned)
  const availableGenres = useMemo(() => {
    return genres.filter((genre) => !assignedGenres.includes(genre.name));
  }, [genres, assignedGenres]);

  // Add tag to story
  const handleAddTag = async (tagName, tagColor) => {
    const newTag = { name: tagName, color: tagColor };
    setAssignedTags([...assignedTags, newTag]);

    try {
      await axios.post(`${base_url}/stories/${id}/tags`, {
        tagName,
        tagColor,
      });
      fetchStory();
    } catch (error) {
      console.error("Error adding tag:", error);
      setAssignedTags(assignedTags.filter((t) => t !== newTag));
    }
  };

  // Remove tag from story
  const handleRemoveTag = async (tagToRemove) => {
    setAssignedTags(assignedTags.filter((t) => t !== tagToRemove));

    try {
      await axios.delete(`${base_url}/stories/${id}/tags/${tagToRemove}`);
      fetchStory();
    } catch (error) {
      console.error("Error removing tag:", error);
      setAssignedTags(assignedTags);
    }
  };

  // Add genre to story
  const handleAddGenre = async (genreName) => {
    setAssignedGenres([...assignedGenres, genreName]);

    try {
      await axios.post(`${base_url}/stories/${id}/genres`, {
        genre: genreName,
      });
      fetchStory();
    } catch (error) {
      console.error("Error adding genre:", error);
      setAssignedGenres(assignedGenres.filter((g) => g !== genreName));
    }
  };

  // Remove genre from story
  const handleRemoveGenre = async (genreToRemove) => {
    setAssignedGenres(assignedGenres.filter((g) => g !== genreToRemove));

    try {
      await axios.delete(`${base_url}/stories/${id}/genres/${genreToRemove}`);
      fetchStory();
    } catch (error) {
      console.error("Error removing genre:", error);
      setAssignedGenres(assignedGenres);
    }
  };

  const GoldDivider = () => (
    <div className="relative flex h-fit w-full">
      <div className="min-h-1 w-full rounded-[50%] bg-primary-50"></div>
      <div className="absolute min-h-1 w-full rounded-[50%] bg-primary-50 blur-xl"></div>
      <div className="absolute min-h-1 w-full rounded-[50%] bg-primary-50 blur-xl"></div>
    </div>
  );

  if (loading) {
    return (
      <main className="scriptigo-page">
        <section className="scriptigo-section">
          <div className="scriptigo-section-wrapper flex-col">
            <p>Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="scriptigo-page">
      <section className="scriptigo-section z-10">
        <div className="scriptigo-section-wrapper flex-col">
          <div
            className={`scriptigo-form no-padding bg-transparent! w-full ${isEditing ? "select-auto" : "select-none"}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className={`story-title text-[1.75rem] ${isEditing ? "" : "border-b-transparent! px-0!"} h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none ${isEditing ? "pointer-events-auto" : "pointer-events-none border-0!"} text-5xl w-full`}
              id="editingTitle"
              readOnly={!isEditing}
            />
          </div>

          {/* Tags Section */}
          <div className="flex flex-col justify-start items-start gap-4 h-fit w-full p-8 bg-white-theme rounded-4xl shadow-xl hover:shadow-2xl hover:shadow-primary-50/50 mt-8">
            <h4 className="uppercase">Tags</h4>
            <div className="flex flex-wrap gap-2 h-fit w-full">
              {assignedTags.length > 0 ? (
                assignedTags
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tag, index) => {
                    const tagData = tags.find((t) => t.name === tag.name);
                    return (
                      <div
                        key={index}
                        className="flex justify-start items-center gap-2 p-2 bg-white-dark rounded-xl"
                        style={{
                          borderLeft: tagData.color
                            ? `3px solid ${tagData.color}`
                            : "red",
                        }}
                      >
                        <p>{tag.name}</p>
                        <button
                          className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme/50 hover:text-red-500 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <FaX className="size-2" />
                        </button>
                      </div>
                    );
                  })
              ) : (
                <p>You have not assigned any Tags yet!</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Available Tags Selection Section */}
      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper flex-col max-h-36 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {tags
              // Ikkada filter cheddam bangaram!
              .filter((tag) => !assignedTags.some((at) => at.name === tag.name))
              .map((tag) => (
                <div
                  key={tag._id}
                  className="flex justify-start items-center gap-2 p-2 bg-white-dark border border-white-light/50 rounded-xl"
                >
                  <p className="text-sm">{tag.name}</p>
                  <button
                    className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme cursor-pointer"
                    onClick={() => handleAddTag(tag.name, tag.color)}
                  >
                    <FaPlus className="size-2" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper flex-col py-6">
          <GoldDivider />
        </div>
      </section>

      <section className="scriptigo-section z-10">
        <div className="scriptigo-section-wrapper flex-col">
          <div className="flex flex-col justify-start items-start gap-4 h-fit w-full p-8 rounded-4xl bg-white-theme shadow-xl hover:shadow-2xl hover:shadow-primary-50/50">
            <h4 className="uppercase">Genres</h4>
            <div className="flex flex-wrap gap-2 h-fit w-full">
              {assignedGenres.length > 0 ? (
                assignedGenres.map((genre, index) => (
                  <div
                    key={index}
                    className="flex justify-start items-center gap-2 p-2 bg-white-dark rounded-xl"
                  >
                    <p>{genre}</p>
                    <button
                      className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme/50 hover:text-red-500 cursor-pointer"
                      onClick={() => handleRemoveGenre(genre)}
                    >
                      <FaX className="size-2" />
                    </button>
                  </div>
                ))
              ) : (
                <p>You have not assigned any Genres yet!</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="scriptigo-section">
        <div className="scriptigo-section-wrapper flex-col max-h-36 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <div
                key={genre.id}
                className="flex justify-start items-center gap-2 p-2 bg-white-dark border border-white-light/50 rounded-xl"
              >
                <p>{genre.name}</p>
                <button
                  className="flex justify-center items-center min-h-2 p-2 rounded-md bg-white-theme/0 border-none outline-none hover:bg-white-theme cursor-pointer"
                  onClick={() => handleAddGenre(genre.name)}
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
