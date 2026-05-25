import React, { useEffect, useState } from "react";
import Dropdown from "../components/common/Dropdown";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX } from "react-icons/fa6";

export default function StoriesPage() {
  const [genres, setGenres] = useState([]);
  const [stories, setStories] = useState([]);
  const [genresDropdownOpen, setGenresDropdownOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("Name");
  const [data, setData] = useState({
    title: "",
    genres: [],
  });
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
  useEffect(() => {
    fetchGenres();
  }, []);
  const fetchStories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stories");
      setStories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };
  useEffect(() => {
    fetchStories();
  }, []);
  const Divider = () => (
    <div className="h-0.5 w-full bg-white-dark opacity-20 rounded-md my-8" />
  );
  const StoryCard = ({ story }) => {
    const [name, setName] = useState(story.title);
    const [editingName, setEditingName] = useState(story.title || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const formatDate = (dateString) => {
      if (!dateString) return "Just Now";
      const date = new Date(dateString);
      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatted = new Intl.DateTimeFormat("en-GB", options).format(date);
      const [datePart, timePart] = formatted.split(", ");
      return `${datePart.replace("", " ")} - ${timePart}`;
    };
    const handleDelete = async (id) => {
      try {
        const res = await axios.delete(`http://localhost:5000/api/stories/${id}`);
        setPlaceholder(res.data.message);
        fetchGenres();
        setPlaceholder("Genre deleted successfully! 👍🏻");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    const handleEdit = async (id, name, genres) => {
      try {
        const res = await axios.put(`http://localhost:5000/api/stories/${id}`, {
          title: name,
          genres: genres,
        });
        setPlaceholder(res.data.message);
        setIsEditing(false);
        fetchGenres();
        setPlaceholder("Genre updated successfully! 😎");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    return (
      <div className="flex justify-start items-start h-fit w-full bg-red-500/0">
        <div className="flex flex-col justify-start items-start h-fit w-full">
          <div className="scriptigo-form no-padding">
            <input
              type="text"
              className={`text-[1.75rem] ${isEditing ? "" : "border-b-transparent! px-0!"}`}
              placeholder={placeholder}
              value={isEditing ? editingName : name}
              onChange={(e) => setEditingName(e.target.value)}
              disabled={!isEditing}
              autoFocus
            />
          </div>
          <p className="text-white-dark">
            {formatDate(story.created_at)}
            {String(story.updated_at) !== String(story.created_at)
              ? ` | Updated At: ${formatDate(story.updated_at)}`
              : ""}
          </p>
        </div>
        <div className="flex justify-end items-start gap-2">
          {isEditing ? (
            <button
              className="primary-button red"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(false);
              }}
            >
              <FaX />
            </button>
          ) : isDeleting ? (
            <button
              className="primary-button green"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(story.id);
              }}
            >
              <FaCheck />
            </button>
          ) : (
            <button
              className="primary-button yellow"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
            >
              <FaPen />
            </button>
          )}
          {isEditing ? (
            <button
              className="primary-button green"
              onClick={(e) => {
                e.preventDefault();
                handleEdit(story.id, editingName, story.genres);
              }}
            >
              <FaCheck />
            </button>
          ) : isDeleting ? (
            <button
              className="primary-button red"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleting(false);
              }}
            >
              <FaX />
            </button>
          ) : (
            <button
              className="primary-button red"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleting(true);
              }}
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim() || !data.genres.length === 0) {
      setPlaceholder("Please, enter a title or select atleast any one Genre!");
      setTimeout(() => {
        setPlaceholder("Title");
      }, 2000);
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/stories", {
        title: data.title,
        genres: data.genres,
      });
      fetchStories();
      fetchGenres();
      setData({
        title: "",
        genres: []
      });
      setPlaceholder(res.data.message);
      setTimeout(() => {
        setPlaceholder("Title");
      }, 2000);
    } catch (error) {
      setPlaceholder(error);
      setTimeout(() => {
        setPlaceholder("Title");
      }, 2000);
    }
  };
  return (
    <>
      <main className="scriptigo-page">
        <div />
        <section className="sticky top-4 scriptigo-section top-gap z-40">
          <div className="fixed top-0 left-0 h-56 w-full bg-transparent backdrop-blur-2xl z-10 rounded-b-4xl" />
          <div className="scriptigo-section-wrapper">
            <form className="scriptigo-form z-20" onSubmit={handleSubmit}>
              <div className="input-group">
                <p>Add Story</p>
                <div className="input-fields">
                  <div className="input-field gap-8 col-span-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={data.title}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                    <Dropdown
                      openWhen={genresDropdownOpen}
                      options={genres}
                      placeholder={"Genres"}
                      hasmultipleoptions={true}
                      onoptionchange={(selectedObjects) => {
                        // Ikkada object list ni just values (array of strings) ki marchi update cheyyi
                        const selectedValues = selectedObjects.map(
                          (obj) => obj.value,
                        );
                        setData((prev) => ({
                          ...prev,
                          genres: selectedValues,
                        }));
                        console.log(selectedValues);
                      }}
                      ontoggle={() =>
                        setGenresDropdownOpen(!genresDropdownOpen)
                      }
                      type={"genres"}
                    />
                    <button
                      className="primary-button text-nowrap"
                      type="submit"
                    >
                      Add Story
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="scriptigo-section top-gap">
          <div className="scriptigo-section-wrapper flex-col gap-2">
            <h2>Your imaginations!</h2>
            <div className="flex flex-col justify-start items-start h-fit w-full p-8 bg-black-light rounded-4xl">
              {stories.length === 0 ? (
                <p>No Stories found!😭... add one using the form✨</p>
              ) : (
                <>
                  {stories.map((story, index) => (
                    <React.Fragment key={index}>
                      <StoryCard story={story} />
                      {index !== stories.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
