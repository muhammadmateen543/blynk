import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

function CategoryMegaMenu() {
  const { categories = [] } = useCategories(); // fallback to avoid crash

  return (
    <div className="relative group">
      <span className="cursor-pointer font-semibold text-gray-700 hover:text-primary">
        Categories
      </span>

      <div className="absolute left-0 mt-2 hidden group-hover:flex bg-white shadow-lg p-6 z-50">
        <div className="grid grid-cols-3 gap-6 min-w-[600px]">
          {categories.map((cat) => (
            <Link
              to={`/category/${cat._id}`}
              key={cat._id}
              className="hover:text-primary transition"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-28 h-20 object-cover rounded mb-2"
                />
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryMegaMenu;
