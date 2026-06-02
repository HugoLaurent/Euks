import { memo } from "react";
import TagSection from "@/components/TagSection.jsx";

function TagPicker({ activeTags, labels, onTagClick, status, tagsByCategory }) {
  const hasTags = Object.values(tagsByCategory).some((tags) => tags.length > 0);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-3">
        <h2 className="text-4xl font-black">{labels.title}</h2>
        <p className="max-w-2xl text-sm text-slate-300">{labels.description}</p>
      </div>

      {status === "loading" ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 text-sm text-slate-300">
          {labels.loading}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 px-5 py-6 text-sm text-rose-50">
          <p className="font-semibold">{labels.errorTitle}</p>
          <p className="mt-2 leading-6 text-rose-100/90">
            {labels.errorDescription}
          </p>
        </div>
      ) : null}

      {status === "ready" && hasTags ? (
        <div className="space-y-6">
          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <TagSection
              key={category}
              activeTags={activeTags}
              category={labels.categories[category] ?? category}
              onTagClick={onTagClick}
              tags={tags}
            />
          ))}
        </div>
      ) : null}

      {status === "ready" && !hasTags ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-6 text-sm text-slate-300">
          {labels.empty}
        </div>
      ) : null}
    </div>
  );
}

export default memo(TagPicker);
