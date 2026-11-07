
export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onCategoryChange("")}
        className={`rounded-full px-5 py-2 transition ${
          selectedCategory === ""
            ? "bg-stone-900 text-white"
            : "border border-stone-300 hover:bg-stone-100"
        }`}
      >
        Toutes les catégories
      </button>

      {(Array.isArray(categories) ? categories : []).map((category) => (        
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          className={`rounded-full px-5 py-2 transition ${
            selectedCategory === category.id
              ? "bg-stone-900 text-white"
              : "border border-stone-300 hover:bg-stone-100"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
