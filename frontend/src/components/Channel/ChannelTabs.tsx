import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

function ChannelTabs() {
    const location = useLocation();

    const getValue = () => {
        if (location.pathname.includes("playlists")) return "playlist";
        if (location.pathname.includes("about")) return "about";
        return "videos";
    };

    const [value, setValue] = useState<string>(getValue());

    const handleChange = (
        _e: React.SyntheticEvent,
        newValue: string
    ) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab
                    label="Videos"
                    value="videos"
                    component={Link}
                    to=""
                />
                <Tab
                    label="Playlists"
                    value="playlist"
                    component={Link}
                    to="playlists"
                />
                <Tab
                    label="About"
                    value="about"
                    component={Link}
                    to="about"
                />
            </Tabs>
        </Box>
    );
}

export default ChannelTabs;