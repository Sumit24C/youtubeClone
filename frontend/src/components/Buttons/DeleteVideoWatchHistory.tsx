import { useState } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { Box, Button } from "@mui/material";

function DeleteVideoWatchHistory({
    videoId,
    setVideos,
}: {
    videoId: string;
    setVideos: React.Dispatch<React.SetStateAction<any[]>>;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [_errorMsg, setErrorMsg] = useState<string>("");

    const axiosPrivate = useAxiosPrivate();

    const handleDelete = async (): Promise<void> => {
        setLoading(true);
        setErrorMsg("");

        try {
            const response = await axiosPrivate.patch(
                `/users/watch-history/v/${videoId}`,
                {}
            );

            if (response.data) {
                setVideos((prev) =>
                    prev.filter((p) => p._id !== videoId)
                );
            }
        } catch (error: any) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flexShrink={0} ml={1}>
            <Button onClick={handleDelete} disabled={loading}>
                {loading ? "..." : "X"}
            </Button>
        </Box>
    );
}

export default DeleteVideoWatchHistory;