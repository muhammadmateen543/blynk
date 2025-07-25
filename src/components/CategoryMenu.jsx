import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

export default function CategoryMenu({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const buildTree = (parentId = null) => {
    return categories
      .filter((cat) => String(cat.parent?._id || cat.parent) === String(parentId))
      .map((cat) => ({
        ...cat,
        children: buildTree(cat._id),
      }));
  };

  const tree = buildTree();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClickToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClickToggle}
        className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-blue-600 transition"
      >
        Categories <FiChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[260px] p-4 transition-opacity animate-fade-in">
          {tree.map((top) => (
            <CategoryItem key={top._id} item={top} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryItem({ item }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleItemClick = (e) => {
    if (hasChildren) {
      e.preventDefault(); // prevent navigation
      setOpen((prev) => !prev);
    }
  };

  return (
    <div className="mb-2">
      <Link
        to={`/category/${item._id}`}
        onClick={handleItemClick}
        className={`flex items-center justify-between text-[15px] font-semibold text-gray-800 hover:text-blue-600 transition ${
          hasChildren ? "cursor-pointer" : ""
        }`}
      >
        {item.name}
        {hasChildren && <FiChevronDown className={`transform transition ${open ? "rotate-180" : ""}`} size={14} />}
      </Link>

      {hasChildren && open && (
        <ul className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {item.children.map((child) => (
            <CategoryItem key={child._id} item={child} />
          ))}
        </ul>
      )}
    </div>
  );
}
