import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX } from "react-icons/fa6";

export default function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState("");
  const [placeholder, setPlaceholder] = useState("Name");
  const [currentPage, setCurrentPage] = useState(1);
  const genresPerPage = 15;
  const fetchGenres = async () => {
    const res = await axios.get("http://localhost:5000/api/genres");
    setGenres(Array.isArray(res.data.data) ? res.data.data : []);
    setCurrentPage(1);
  };
  const Divider = () => (
    <div className="h-0.5 w-full bg-primary-80 rounded-md my-8" />
  );
  useEffect(() => {
    fetchGenres();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setPlaceholder("Please, enter name of Genre!");
      setTimeout(() => {
        setPlaceholder("Name");
      }, 2000);
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/genres", {
        name: name,
      });
      setName("");
      setCurrentPage(1);
      fetchGenres();
      setPlaceholder(res.data.message || "Genre Created successfully! 🥳");
      setTimeout(() => {
        setPlaceholder("Name");
      }, 2000);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        setPlaceholder("Genre name already exists! 😭");
      } else {
        setPlaceholder("Something went wrong! 😭");
      }
      setTimeout(() => {
        setPlaceholder("Name");
      }, 2000);
    }
  };
  const GenreCard = ({ genre }) => {
    const [name, _] = useState(genre.name);
    const [editingName, setEditingName] = useState(genre.name || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const formatDate = (dateString) => {
      if (!dateString) return "Just Now";
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
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
          `http://localhost:5000/api/genres/${id}`,
        );
        setPlaceholder(res.data.message);
        setCurrentPage(1);
        fetchGenres();
        setPlaceholder("Genre deleted successfully! 👍🏻");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    const handleEdit = async (id, name) => {
      try {
        const res = await axios.put(`http://localhost:5000/api/genres/${id}`, {
          name: name,
        });
        setPlaceholder(res.data.message);
        setIsEditing(false);
        setCurrentPage(1);
        fetchGenres();
        setPlaceholder("Genre updated successfully! 😎");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    return (
      <div className="flex justify-start items-start h-fit w-full">
        <div className="flex flex-col justify-start items-start h-fit w-full">
          <div className="scriptigo-form no-padding">
            <input
              type="text"
              className={`text-[1.75rem] ${isEditing ? "" : "border-b-transparent! px-0!"} text-primary-50`}
              placeholder={placeholder}
              value={isEditing ? editingName : name}
              onChange={(e) => setEditingName(e.target.value)}
              disabled={!isEditing}
              autoFocus
            />
          </div>
          <p className="text-gray-500">
            {formatDate(genre.createdAt || "")}
            {String(genre.updatedAt) !== String(genre.createdAt)
              ? ` | Updated At: ${formatDate(genre.updatedAt || "")}`
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
                handleDelete(genre._id);
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
                handleEdit(genre._id, editingName);
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
  return (
    <>
      <main className="scriptigo-page">
        <div />
        <section className="scriptigo-section top-gap z-40">
          {/* <div className="fixed top-0 left-0 h-56 w-full bg-transparent backdrop-blur-2xl z-10 rounded-b-4xl" /> */}
          <div className="scriptigo-section-wrapper bg-white-dark py-8">
            <form className="h-fit w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 h-fit w-full">
                <p className="p-4 text-primary-50 bg-primary-90 h-fit w-fit rounded-xl">
                  Add Genre
                </p>
                <div className="flex justify-between h-fit w-full gap-8">
                  <input
                    type="text"
                    className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none"
                    placeholder={placeholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
            <h2>Your Genres</h2>
            <div className="flex flex-col justify-start items-start h-fit w-full p-8 bg-white-theme rounded-4xl">
              {genres.length === 0 ? (
                <p>No Genres found!😭... add one using the form✨</p>
              ) : (
                (() => {
                  const totalPages = Math.ceil(genres.length / genresPerPage);
                  const startIndex = (currentPage - 1) * genresPerPage;
                  const endIndex = startIndex + genresPerPage;
                  const paginatedGenres = genres.slice(startIndex, endIndex);
                  return (
                    <>
                      <div className="flex flex-col justify-start items-start h-fit w-full">
                        {paginatedGenres.map((g, index) => (
                          <React.Fragment key={g.id || index}>
                            <GenreCard genre={g} />
                            {index !== paginatedGenres.length - 1 && (
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
