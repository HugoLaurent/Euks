function TagSection({ activeTags, category, onTagClick, tags }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
        {category}
      </h3>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeTags.includes(tag)
                ? "border-cyan-200 bg-cyan-200 text-slate-950"
                : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/20"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagSection;
