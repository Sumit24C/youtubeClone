import { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Button,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import ChannelStats from "../components/Studio/ChannelStats";
import { useSelector } from "react-redux";
import type { AuthState } from "../types/user";

type RootState = {
    auth: AuthState
};

function Studio() {
    const { userData } = useSelector(
        (state: RootState) => state.auth
    );

    const [tab, setTab] = useState<number>(0);
    const navigate = useNavigate();

    const handleTabChange = (
        _: React.SyntheticEvent,
        newValue: number
    ) => {
        setTab(newValue);
    };

    return (
        <Box
            sx={{
                px: { xs: 2, md: 6, lg: 10 },
                bgcolor: "#121212",
                minHeight: "100vh",
                color: "white",
                maxWidth: "1600px",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Button
                    variant="contained"
                    onClick={() =>
                        userData?.username &&
                        navigate(`/c/${userData.username}`)
                    }
                >
                    View Channel
                </Button>

                <ChannelStats />
            </Box>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="primary"
                sx={{ borderBottom: "1px solid #333", mb: 2 }}
            >
                <Tab
                    label="Videos"
                    onClick={() => navigate("")}
                />
                <Tab
                    label="Playlists"
                    onClick={() => navigate("pl")}
                />
            </Tabs>

            {/* Content */}
            <Outlet />
        </Box>
    );
}

export default Studio;