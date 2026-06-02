import { memo } from "react";
import TrackList from "@/components/TrackList.jsx";

function SelectionPanel({
  activeTags,
  labels,
  onPurchase,
  onTrackSelect,
  selectedTrack,
  tracks,
}) {
  const isVisible = activeTags.length > 0;

  return (
    <div
      className={`xl:w-155 xl:shrink-0 overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible
          ? "max-h-225 opacity-100 translate-y-0"
          : "max-h-0 pointer-events-none opacity-0 translate-y-3"
      }`}
    >
      <aside className="selection-panel-enter w-full rounded-[1.75rem] bg-slate-950/45 backdrop-blur md:p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              {labels.kicker}
            </p>
            <h3 className="text-2xl font-black text-white">
              {activeTags.join(" + ")}
            </h3>
          </div>

          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            {tracks.length} {labels.tracks}
          </span>
        </div>

        <TrackList
          labels={labels}
          onPurchase={onPurchase}
          onTrackSelect={onTrackSelect}
          selectedTrack={selectedTrack}
          tracks={tracks}
        />
      </aside>
    </div>
  );
}

export default memo(SelectionPanel);
