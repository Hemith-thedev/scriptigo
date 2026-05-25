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
  const fetchTags = async () => {
    const res = await axios.get("http://localhost:5000/api/tags");
    setTags(Array.isArray(res.data.data) ? res.data.data : []);
  };
  useEffect(() => {
    fetchTags();
  }, []);
  const Divider = () => (
    <div className="h-0.5 w-full bg-white-dark opacity-20 rounded-md my-8" />
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
        const res = await axios.delete(`http://localhost:5000/api/tag/${id}`);
        setPlaceholder(res.data.message);
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
                className={`text-[1.75rem] ${isEditing ? "" : "border-b-transparent!"}`}
                placeholder={placeholder}
                value={isEditing ? editingName : name}
                onChange={(e) => setEditingName(e.target.value)}
                disabled={!isEditing}
                autoFocus
              />
            </div>
          </div>
          <p className="text-white-dark">
            {formatDate(tag.created_at)}
            {String(tag.updated_at) !== String(tag.created_at)
              ? ` | Updated At: ${formatDate(tag.updated_at)}`
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
                handleDelete(tag.id);
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
                handleEdit(tag.id, editingName, editingColor);
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
                <p>Add Tag</p>
                <div className="input-fields">
                  <div className="input-field col-span-2 gap-8">
                    <input
                      type="text"
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
                  </div>
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
            <div className="flex flex-col justify-start items-start h-fit w-full p-8 bg-black-light rounded-4xl">
              {tags.length === 0 ? (
                <p>No Tags found!😭... add one using the form✨</p>
              ) : (
                tags.map((t, index) => (
                  <React.Fragment key={t.id || index}>
                    <TagCard tag={t} />
                    {index !== tags.length - 1 && <Divider />}
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
