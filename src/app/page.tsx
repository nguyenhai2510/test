/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoItemProps {
  videoId: string;
  isActive: boolean;
  isPlaying: boolean;
  togglePlay: (playerRef: React.RefObject<unknown>) => void;
}

const VideoItem = ({
  videoId,
  isActive,
  isPlaying,
  togglePlay,
}: VideoItemProps) => {
  const playerRef = useRef<unknown>(null);

  const opts = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      playsinline: 1,
    },
  };

  // Khi player sẵn sàng, lưu tham chiếu
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    if (isPlaying) {
      (playerRef.current as any).playVideo();
    }
    // event.target.mute(); // Mute video để tránh bị chặn autoplay
    // event.target.playVideo(); // Phát video ngay khi load
  };

  // Khi video kết thúc, tự động phát lại
  const onEnd = () => {
    if (playerRef.current) {
      (playerRef.current as any).seekTo(0); // Quay lại đầu video
      (playerRef.current as any).playVideo(); // Phát lại
    }
  };

  return (
    <div
      className={`video-container ${isActive ? "active" : ""}`}
      onClick={() => togglePlay(playerRef)}
    >
      <div className="swipe-overlay"></div>
      <YouTube
        videoId={videoId}
        opts={opts}
        className="youtube-player"
        onReady={onPlayerReady}
        onEnd={onEnd} // Lặp lại video
      />
    </div>
  );
};

export default function Home() {
  const videos = [
    { id: "-Qi0V9bdSKA", title: "Video 1" },
    { id: "n5agUKG4bEg", title: "Video 2" },
    { id: "Etgi38nad5k", title: "Video 3" },
    { id: "GP7PL4b4rwE", title: "Video 4" },
    { id: "uQvSbGlFLig", title: "Video 5" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Vuốt lên/xuống để chuyển video
  const handleSwipe = useCallback(
    (direction: string) => {
      let newIndex = currentIndex;
      if (direction === "up" && currentIndex < videos.length - 1) {
        newIndex = currentIndex + 1;
      } else if (direction === "down" && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setIsPlaying(true);
      }
    },
    [currentIndex, videos.length]
  );

  // Xử lý cuộn chuột
  const handleWheel = useCallback(
    (event: { deltaY: number }) => {
      if (event.deltaY > 0) {
        handleSwipe("up");
      } else if (event.deltaY < 0) {
        handleSwipe("down");
      }
    },
    [handleSwipe]
  );

  useEffect(() => {
    const container = document.querySelector(".swipe-container");
    if (container) {
      (container as any).addEventListener("wheel", handleWheel);
    }

    return () => {
      if (container) {
        (container as any).removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  const handlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"),
    onSwipedDown: () => handleSwipe("down"),
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  // Nhấn vào màn hình để tạm dừng hoặc phát video
  const togglePlay = (playerRef: React.RefObject<unknown>) => {
    if (playerRef.current) {
      if (isPlaying) {
        (playerRef.current as any).pauseVideo(); // Dừng video
      } else {
        (playerRef.current as any).playVideo(); // Phát video
      }
      setIsPlaying(!isPlaying);
    }
  };
  const shouldPreload = useCallback(
    (index: number) => Math.abs(index - currentIndex) <= 1,
    [currentIndex]
  );
  return (
    <div className="swipe-container" {...handlers}>
      {videos.map((video, index) => (
        <div
          key={index}
          className={`slide-item ${index === currentIndex ? "active" : ""}`}
          style={{
            transform: `translateY(${(index - currentIndex) * 100}vh)`,
            opacity: index === currentIndex ? 1 : 0.3,
            transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
            zIndex: videos.length - Math.abs(currentIndex - index),
          }}
        >
          {shouldPreload(index) && index === currentIndex && (
            <VideoItem
              videoId={video.id}
              isActive
              isPlaying={isPlaying}
              togglePlay={togglePlay} // Điều khiển phát/tạm dừng
            />
          )}
        </div>
      ))}
    </div>
  );
}
