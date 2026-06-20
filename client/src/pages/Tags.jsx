import React, { useEffect, useRef, useState } from "react";
import Dropdown from "../components/common/Dropdown";
import ColorPicker from "../components/common/ColorPicker";
import axios from "axios";
import { FaPen, FaTrash, FaCheck, FaX } from "react-icons/fa6";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [resetColor, setResetColor] = useState(false);
  const [placeholder, setPlaceholder] = useState("Name");
  const [currentPage, setCurrentPage] = useState(1);
  const tagsPerPage = 15;
  const fetchTags = async () => {
    const res = await axios.get("http://localhost:5000/api/tags");
    setTags(Array.isArray(res.data.data) ? res.data.data : []);
    setCurrentPage(1);
  };
  useEffect(() => {
    fetchTags();
  }, []);
  const Divider = () => (
    <div className="h-0.5 w-full bg-primary-80 rounded-md my-8" />
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !color.trim()) {
      setPlaceholder("Please, enter a Tag or select a color!");
      setTimeout(() => {
        setPlaceholder("Name");
        setColor("");
      }, 2000);
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/tags", {
        name,
        color,
      });
      setName("");
      setColor("");
      fetchTags();
      setPlaceholder(res.data.message || "Tag Created successfully! 🥳");
      setResetColor(true);
      setCurrentPage(1);
      setTimeout(() => {
        setPlaceholder("Name");
        setColor("");
        setResetColor(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        setPlaceholder("Tag name already exists! 😭");
      } else {
        setPlaceholder("Something went wrong! 😓");
      }
      setTimeout(() => {
        setPlaceholder("Name");
        setColor("");
        setResetColor(true);
      }, 2000);
      setResetColor(false);
    }
  };
  const TagCard = ({ tag }) => {
    const [name, setName] = useState(tag.name);
    const [color, setColor] = useState(tag.color);
    const [editingName, setEditingName] = useState(tag.name || "");
    const [editingColor, setEditingColor] = useState(tag.color || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const input = useRef(null);
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
        const res = await axios.delete(`http://localhost:5000/api/tags/${id}`);
        setPlaceholder(res.data.message);
        setCurrentPage(1);
        fetchTags();
        setPlaceholder("Tag deleted successfully! 👍🏻");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    const handleEdit = async (id, name, color) => {
      try {
        const res = await axios.put(`http://localhost:5000/api/tags/${id}`, {
          name: editingName,
          color: editingColor,
        });
        setPlaceholder(res.data.message);
        setIsEditing(false);
        setCurrentPage(1);
        fetchTags();
        setPlaceholder("Tag updated successfully! 😎");
        setTimeout(() => setPlaceholder("Name"), 2000);
      } catch (error) {
        console.error(error);
      }
    };
    return (
      <div className="flex justify-start items-start h-fit w-full bg-red-500/0">
        <div className="flex flex-col justify-start items-start h-fit w-full">
          <div className="flex justify-start items-center gap-2 h-fit w-full">
            <div
              className="flex min-h-8 min-w-8 rounded-lg"
              style={{ background: color }}
            />
            <div className="scriptigo-form no-padding">
              <input
                type="text"
                className={`text-[1.75rem] ${isEditing ? "" : "border-b-transparent!"} text-primary-50`}
                placeholder={placeholder}
                value={isEditing ? editingName : name}
                onChange={(e) => setEditingName(e.target.value)}
                disabled={!isEditing}
                autoFocus
              />
            </div>
          </div>
          <p className="text-gray-500">
            {formatDate(tag.createdAt)}
            {String(tag.updatedAt) !== String(tag.createdAt)
              ? ` | Updated At: ${formatDate(tag.updatedAt)}`
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
                handleDelete(tag._id);
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
                handleEdit(tag._id, editingName, editingColor);
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  return (
    <>
      <main className="scriptigo-page">
        <div />
        <section className="scriptigo-section top-gap z-40">
          {/* <div className="fixed top-0 left-0 h-56 w-full bg-transparent backdrop-blur-2xl z-10 rounded-b-4xl" /> */}
          <div className="scriptigo-section-wrapper bg-white-dark py-8">
            <form className="flex h-fit w-full z-20" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 h-fit w-full">
                <p
                  className="p-4 text-primary-50 bg-primary-90 h-fit w-fit rounded-xl"
                  id="story-page-form-heading"
                >
                  Add Tag
                </p>
                <div className="form-fields grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] h-fit w-full gap-8">
                  <input
                    type="text"
                    className="h-fit w-full p-4 tracking-widest text-primary-50 border-b-2 border-b-primary-20 hover:border-b-primary-50 focus:border-b-primary-50 outline-none"
                    placeholder={placeholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <ColorPicker
                    onselect={(color) => {
                      setColor(color);
                      console.log(color);
                    }}
                    reset={resetColor}
                  />
                  <button className="primary-button" type="submit">
                    Add Tag
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="scriptigo-section top-gap z-10">
          <div className="scriptigo-section-wrapper flex-col gap-2">
            <h2>Your Tags</h2>
            <div className="flex flex-col justify-start items-start h-fit w-full p-8 bg-white-theme rounded-4xl">
              {tags.length === 0 ? (
                <p>No Tags found!😭... add one using the form✨</p>
              ) : (
                (() => {
                  const totalPages = Math.ceil(tags.length / tagsPerPage);
                  const startIndex = (currentPage - 1) * tagsPerPage;
                  const endIndex = startIndex + tagsPerPage;
                  const paginatedTags = tags.slice(startIndex, endIndex);
                  return (
                    <>
                      <div className="flex flex-col justify-start items-start h-fit w-full">
                        {paginatedTags.map((t, index) => (
                          <React.Fragment key={t.id || index}>
                            <TagCard tag={t} />
                            {index !== paginatedTags.length - 1 && <Divider />}
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
