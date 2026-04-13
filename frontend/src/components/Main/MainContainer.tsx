import { useEffect, useRef, useState } from "react";
import CardContainer from "./CardContainer";
import { Box, CircularProgress } from "@mui/material";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { extractErrorMsg } from "../../utils/extractErrorMsg";
import type { Video } from "../../types/video";

function MainContainer() {
  const axiosPrivate = useAxiosPrivate();

  const [loading, setLoading] = useState<boolean>(false);
  const [_errorMsg, setErrorMsg] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchVideos = async (pageNum: number): Promise<void> => {
    setLoading(true);

    try {
      const response = await axiosPrivate.get(
        `/videos?page=${pageNum}`
      );

      const {
        videos: newVideos,
        totalPages,
      }: { videos: Video[]; totalPages: number } =
        response.data.data;

      setVideos((prev) => [...prev, ...newVideos]);
      setTotalPages(totalPages);
      setPage(pageNum);
    } catch (error: any) {
      if (!isCancel(error)) {
        setErrorMsg(extractErrorMsg(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < totalPages) {
        fetchVideos(page + 1);
      }
    });

    const anchor = document.getElementById("scroll-anchor");

    if (anchor) observer.observe(anchor);

    observerRef.current = observer;

    return () => observer.disconnect(); // 🔥 cleanup fix
  }, [page, loading, totalPages]);

  if (loading && videos.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        p: 2,
        gap: 2,
        minHeight: "300px",
        width: "100%",
      }}
    >
      {videos.length > 0 ? (
        videos.map((video) => (
          <CardContainer key={video._id} video={video} />
        ))
      ) : (
        <p>No videos available</p>
      )}

      <div id="scroll-anchor" style={{ height: "20px" }} />

      {loading && videos.length > 0 && (
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      )}
    </Box>
  );
}

export default MainContainer;