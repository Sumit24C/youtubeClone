import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { Box, Typography, CircularProgress } from '@mui/material';
import CardContainer from '../components/Main/CardContainer';
import PlaylistVideo from '../components/Playlist/PlaylistVideo';
import { useRef } from 'react';
import { extractErrorMsg } from '../utils';
import SearchCardContainer from '../components/Main/SearchCardContainer';

function SearchVideoPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const [videos, setVideos] = useState([]);
    const [limit, setLimit] = useState(9);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const observerRef = useRef(null);

    const fetchVideos = async (pageNum) => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get(`/videos/search?page=${pageNum}&limit=${limit}&query=${query}`);
            const { videos: newVideos, totalPages } = response.data.data;
            setVideos((prev) => [...prev, ...newVideos]);
            setTotalPages(totalPages);
            setPage(pageNum);
        } catch (error) {
                setErrorMsg(extractErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        ; (async function () {
            await fetchVideos(1);
        })();
    }, [query]);

    useEffect(() => {
        if (loading) return;

        if (observerRef.current) observerRef.current.disconnect();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && page < totalPages) {
                fetchVideos(page + 1);
            }
        });

        if (document.getElementById('scroll-anchor')) {
            observer.observe(document.getElementById('scroll-anchor'));
        }

        observerRef.current = observer;
    }, [page, loading, totalPages]);

    if (loading && videos.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    width: '100%',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p:7,
                px: 14
            }}
        >
            {videos && videos.length > 0 ? (
                videos.map((video, index) => (
                    <SearchCardContainer key={index} video={video}/>
                ))
            ) : (
                errorMsg ? (<p>{errorMsg}</p>) : (<p>No videos available</p>)
            )}

            <div id="scroll-anchor" style={{ height: '20px' }}></div>

            {loading && videos.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={30} />
                </Box>
            )}
        </Box>
    );
}

export default SearchVideoPage;