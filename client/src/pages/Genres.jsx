import React, { useEffect, useState } from "react";
import Dropdown from "../components/common/Dropdown";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX } from "react-icons/fa6";

export default function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [resetColor, setResetColor] = useState(false);
  const [placeholder, setPlaceholder] = useState("Name");
  const fetchGenres = async () => {
    const res = await axios.get("http://localhost:5000/api/genres");
    setGenres(Array.isArray(res.data.data) ? res.data.data : []);
  };
  const Divider = () => (
    <div className="h-0.5 w-full bg-white-dark opacity-20 rounded-md my-8" />
  );
  useEffect(() => {
    fetchGenres();
  }, []);
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
    const [name, setName] = useState(genre.name);
    const [editingName, setEditingName] = useState(genre.name || "");
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
        const res = await axios.delete(`http://localhost:5000/api/genre/${id}`);
        setPlaceholder(res.data.message);
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
            {formatDate(genre.created_at)}
            {String(genre.updated_at) !== String(genre.created_at)
              ? ` | Updated At: ${formatDate(genre.updated_at)}`
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
                handleDelete(genre.id);
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
                handleEdit(genre.id, editingName);
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
        <section className="sticky top-4 scriptigo-section top-gap z-40">
          <div className="fixed top-0 left-0 h-56 w-full bg-transparent backdrop-blur-2xl z-10 rounded-b-4xl" />
          <div className="scriptigo-section-wrapper">
            <form className="scriptigo-form z-20" onSubmit={handleSubmit}>
              <div className="input-group">
                <p>Add Genre</p>
                <div className="input-fields">
                  <div className="input-field col-span-2 gap-8">
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <button className="primary-button" type="submit">
                    Add Genre
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="scriptigo-section top-gap">
          <div className="scriptigo-section-wrapper flex-col gap-2">
            <h2>Your Genres</h2>
            <div className="flex flex-col justify-start items-start h-fit w-full p-8 bg-black-light rounded-4xl">
              {genres.length === 0 ? (
                <p>No Genres found!😭... add one using the form✨</p>
              ) : (
                genres.map((g, index) => (
                  <React.Fragment key={g.id || index}>
                    <GenreCard genre={g} />
                    {index !== genres.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
