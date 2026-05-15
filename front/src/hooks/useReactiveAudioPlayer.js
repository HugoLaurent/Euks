import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPreviewSrc } from "@/data";

function parseDuration(duration) {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function cleanupNodes(sourceRef, analyserRef, animationFrameRef) {
  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }

  if (sourceRef.current) {
    try {
      sourceRef.current.disconnect();
    } catch {
      // Source may already be disconnected.
    }
  }

  if (analyserRef.current) {
    try {
      analyserRef.current.disconnect();
    } catch {
      // Analyser may already be disconnected.
    }
  }

  sourceRef.current = null;
  analyserRef.current = null;
}

function createAudioElement(track) {
  const audio = new Audio(track.audioSrc || defaultPreviewSrc);
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";
  return audio;
}

function useReactiveAudioPlayer(track) {
  const fallbackDuration = useMemo(
    () => parseDuration(track.duration),
    [track.duration],
  );

  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const analyserDataRef = useRef(null);
  const animationFrameRef = useRef(null);
  const activeTrackRef = useRef(track);

  const [isPlaying, setIsPlaying] = useState(false);
  const [energy, setEnergy] = useState(0.12);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState(track.duration);

  const ensureAudioElement = () => {
    if (!audioRef.current) {
      audioRef.current = createAudioElement(track);
    }

    return audioRef.current;
  };

  const updateFrame = () => {
    const audio = audioRef.current;
    const analyser = analyserRef.current;

    if (!audio || !analyser || !analyserDataRef.current) {
      return;
    }

    analyser.getByteFrequencyData(analyserDataRef.current);

    const bins = analyserDataRef.current;
    const lowEnd = bins.slice(0, 18);
    const midRange = bins.slice(18, 54);
    const lowAverage =
      lowEnd.reduce((sum, value) => sum + value, 0) /
      Math.max(lowEnd.length, 1);
    const midAverage =
      midRange.reduce((sum, value) => sum + value, 0) /
      Math.max(midRange.length, 1);
    const nextEnergy = Math.min(
      (lowAverage * 0.65 + midAverage * 0.35) / 255,
      1,
    );

    const nextDuration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fallbackDuration;
    const nextProgress = Math.min(audio.currentTime / nextDuration, 1);

    setEnergy(nextEnergy);
    setProgress(nextProgress);
    setCurrentTime(formatTime(audio.currentTime));
    setDuration(formatTime(nextDuration));

    if (!audio.paused && !audio.ended) {
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    } else {
      setIsPlaying(false);
      if (audio.ended) {
        setEnergy(0.12);
      }
    }
  };

  const ensureAudioGraph = async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContextClass();
    }

    const audio = ensureAudioElement();
    const context = contextRef.current;
    await context.resume();

    if (!sourceRef.current) {
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.86;
      analyserDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(context.destination);

      sourceRef.current = source;
      analyserRef.current = analyser;
    }

    return { audio, context };
  };

  const togglePlayback = async () => {
    const setup = await ensureAudioGraph();

    if (!setup) {
      return;
    }

    const { audio } = setup;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateFrame);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const seekToProgress = (nextProgress) => {
    const audio = ensureAudioElement();
    const safeProgress = Math.min(Math.max(nextProgress, 0), 1);
    const totalDuration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fallbackDuration;
    const nextTime = totalDuration * safeProgress;

    audio.currentTime = nextTime;
    setProgress(safeProgress);
    setCurrentTime(formatTime(nextTime));
    setDuration(formatTime(totalDuration));

    if (!audio.paused && !audio.ended) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const nextSrc = track.audioSrc || defaultPreviewSrc;
    activeTrackRef.current = track;

    setProgress(0);
    setCurrentTime("0:00");
    setDuration(track.duration);
    setEnergy(0.12);

    if (!audio) {
      return;
    }

    const shouldResume = !audio.paused;
    audio.pause();
    audio.currentTime = 0;

    if (audio.src !== new URL(nextSrc, window.location.href).href) {
      audio.src = nextSrc;
      audio.load();
    }

    if (shouldResume) {
      void audio.play().then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updateFrame);
      });
    } else {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(formatTime(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(1);
      setEnergy(0.12);
      setCurrentTime(duration);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [duration]);

  useEffect(() => {
    return () => {
      cleanupNodes(sourceRef, analyserRef, animationFrameRef);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, []);

  return {
    currentTime,
    duration,
    energy,
    isPlaying,
    progress,
    seekToProgress,
    togglePlayback,
  };
}

export default useReactiveAudioPlayer;
