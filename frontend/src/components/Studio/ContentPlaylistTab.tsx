import { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    CircularProgress,
} from "@mui/material";
import {
    displayCreatedAt,
    displayDuration,
    extractErrorMsg,
} from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import AnalyticsMenu from "../Buttons/AnalyticsMenu";
import type { Playlist } from "../../types/playlist";

function ContentPlaylistTab() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const axiosPrivate = useAxiosPrivate();

    const tableHeadings = [
        "Playlist",
        "Type",
        "Last Updated",
        "Videos",
        "Views",
        "Actions",
    ];

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        (async () => {
            try {
                const response = await axiosPrivate.get<{
                    data: Playlist[];
                }>("/dashboard/playlists");

                setPlaylists(response.data.data || []);
            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <Box p={4} textAlign="center">
                <CircularProgress />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Box p={4} textAlign="center" color="red">
                {errorMsg}
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer
                component={Paper}
                sx={{ bgcolor: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}
            >
                <Table>
                    {/* Head */}
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#2c2c2c" }}>
                            {tableHeadings.map((th, index) => (
                                <TableCell
                                    key={index}
                                    sx={{
                                        color: "gray",
                                        fontWeight: 500,
                                        textTransform: "uppercase",
                                        fontSize: "12px",
                                    }}
                                >
                                    {th}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* Body */}
                    <TableBody>
                        {playlists.map((playlist) => (
                            <TableRow
                                key={playlist._id}
                                hover
                                sx={{
                                    borderBottom: "1px solid #333",
                                    "&:hover": { bgcolor: "#1a1a1a" },
                                }}
                            >
                                {/* Playlist Info */}
                                <TableCell
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        minWidth: 300,
                                    }}
                                >
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar
                                            variant="rounded"
                                            src={playlist.lastVideo?.thumbnailUrl || ""}
                                            alt={playlist.name} // 🔥 fixed
                                            sx={{ width: 120, height: 70, borderRadius: 1 }}
                                        />

                                        {playlist.totalDuration && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 4,
                                                    right: 4,
                                                    bgcolor: "rgba(0,0,0,0.7)",
                                                    px: 0.5,
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {displayDuration(playlist.totalDuration)}
                                            </Box>
                                        )}
                                    </Box>

                                    <Box>
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {playlist.name} {/* 🔥 fixed */}
                                        </Typography>

                                        <Typography variant="body2" color="gray" noWrap>
                                            {playlist.description || "Add description"}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Visibility */}
                                <TableCell sx={{ minWidth: 120 }}>
                                    {playlist.isPrivate ? "Private" : "Public"}
                                </TableCell>

                                {/* Date */}
                                <TableCell sx={{ minWidth: 150 }}>
                                    {displayCreatedAt(playlist.updatedAt)}
                                </TableCell>

                                {/* Videos */}
                                <TableCell align="right">
                                    {playlist.totalVideos || 0}
                                </TableCell>

                                {/* Views */}
                                <TableCell align="right">
                                    {playlist.totalViews || 0}
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="right" sx={{ minWidth: 100 }}>
                                    <AnalyticsMenu
                                        id={playlist._id}
                                        setContents={setPlaylists}
                                        type="playlist"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                        {playlists.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{ py: 4, color: "gray" }}
                                >
                                    No playlists found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ContentPlaylistTab;