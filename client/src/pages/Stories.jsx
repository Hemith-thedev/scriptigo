import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/common/Dropdown";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";
import { IoMdPerson } from "react-icons/io";

export default function StoriesPage() {
  const [genres, setGenres] = useState([]);
  const [stories, setStories] = useState([]);
  const [genresDropdownOpen, setGenresDropdownOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("Name");
  const [data, setData] = useState({
    title: "",
    genres: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 15;
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
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };
  useEffect(() => {
    fetchGenres();
    fetchStories();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  const Divider = () => (
    <div className="h-0.5 w-full bg-primary-80 rounded-md my-4" />
  );
  const navigate = useNavigate();
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
        const res = await axios.delete(
          `http://localhost:5000/api/stories/${id}`,
        );
        setPlaceholder(res.data.message);
        setCurrentPage(1);
        fetchGenres();
        fetchStories();
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
        setCurrentPage(1);
        fetchGenres();
        fetchStories();
        setPlaceholder("Genre updated successfully! 😎");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    return (
      <div className="flex justify-start items-start h-fit w-full p-4 hover:bg-primary-90 rounded-2xl cursor-pointer">
        <div className="flex flex-col justify-start items-start h-fit w-full">
          <div className="flex h-fit w-full bg-red-500" onClick={() => navigate(`/stories/${story._id}`)}>
            <input
              type="text"
              className={`text-[1.75rem] ${isEditing ? "" : "border-b-transparent! px-0!"} h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none`}
              placeholder={placeholder}
              value={isEditing ? editingName : name}
              onChange={(e) => setEditingName(e.target.value)}
              disabled={!isEditing}
              autoFocus
              title={name}
            />
          </div>
          <p className="text-gray-500">
            {formatDate(story.createdAt)}
            {String(story.updatedAt) !== String(story.createdAt)
              ? ` | Updated At: ${formatDate(story.updatedAt)}`
              : ""}
          </p>
        </div>
        <div className="flex justify-end items-start gap-2">
          <button
            className="primary-button green"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/stories/${story._id}/attachments`);
            }}
          >
            <GrAttachment />
          </button>
          <button
            className="primary-button"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/stories/${story._id}/characters`);
            }}
          >
            <IoMdPerson />
          </button>
          
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
                handleDelete(story._id);
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
                handleEdit(story._id, editingName, story.genres);
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
        genres: [],
      });
      setCurrentPage(1);
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
        <section className="scriptigo-section top-gap z-40">
          {/* <div className="fixed top-0 left-0 h-56 w-full bg-white-dark/70 backdrop-blur-2xl z-10 rounded-b-4xl" /> */}
          <div className="scriptigo-section-wrapper bg-white-dark py-8">
            <form className="flex h-fit w-full z-20" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 h-fit w-full">
                <p
                  className="p-4 text-primary-50 bg-primary-90 h-fit w-fit rounded-xl"
                  id="story-page-form-heading"
                >
                  Add Story
                </p>
                <div className="form-fields grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] h-fit w-full gap-8">
                  <input
                    type="text"
                    className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none"
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
                    }}
                    ontoggle={() => setGenresDropdownOpen(!genresDropdownOpen)}
                    type={"genres"}
                  />
                  <button className="primary-button text-nowrap" type="submit">
                    Add Story
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="scriptigo-section top-gap">
          <div className="scriptigo-section-wrapper flex-col gap-2">
            <h2>Your imaginations!</h2>
            <div className="flex flex-col justify-start items-start h-fit w-full p-4 bg-white-theme rounded-4xl">
              {stories.length === 0 ? (
                <p>No Stories found!😭... add one using the form✨</p>
              ) : (
                (() => {
                  const totalPages = Math.ceil(stories.length / storiesPerPage);
                  const startIndex = (currentPage - 1) * storiesPerPage;
                  const endIndex = startIndex + storiesPerPage;
                  const paginatedStories = stories.slice(startIndex, endIndex);
                  return (
                    <>
                      <div className="flex flex-col justify-start items-start h-fit w-full">
                        {paginatedStories.map((story, index) => (
                          <React.Fragment key={index}>
                            <StoryCard story={story} />
                            {index !== paginatedStories.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex justify-center items-center gap-4 h-fit w-full mt-8 pt-4 border-t border-t-primary-80">
                        <button
                          className="primary-button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </button>
                        <span className="text-primary-50 font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="primary-button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
