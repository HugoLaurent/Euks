import TrackRow from "@/components/TrackRow.jsx";

function TrackList({
  labels,
  onPurchase,
  onTrackSelect,
  selectedTrack,
  tracks,
}) {
  if (tracks.length === 0) {
    return (
      <div className="music-list-scroll max-h-170 space-y-3 overflow-y-auto pr-1">
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            {labels.emptyTitle}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {labels.emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="music-list-scroll max-h-170 space-y-3 overflow-y-auto">
      {tracks.map((track) => (
        <TrackRow
          key={`${track.title}-${track.artist}`}
          isActive={selectedTrack.title === track.title}
          labels={labels}
          onPurchase={onPurchase}
          onSelect={() => onTrackSelect(track)}
          track={track}
        />
      ))}
    </div>
  );
}

export default TrackList;
