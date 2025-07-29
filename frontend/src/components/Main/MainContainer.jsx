import React from 'react'
import CardContainer from './CardContainer'
import { Grid, Box } from '@mui/material';
function MainContainer() {

    const videos = [
        {
            title: "How to Learn JavaScript in 2025",
            channel: "CodeWithSam",
            views: 125000,
            createdAt: "1 month ago",
            videoLink: "https://youtu.be/js-learn-2025",
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "10 CSS Tricks You Didn't Know",
            channel: "DesignDaily",
            views: 34200,
            createdAt: "3 weeks ago",
            videoLink: "https://csstricks.com/video",
            avatar: "https://avatars.com/design",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "React vs Vue in 2025",
            channel: "TechTalks",
            views: 89750,
            createdAt: "2 months ago",
            videoLink: "https://techtalks.com/react-vs-vue",
            avatar: "https://avatars.com/techtalks",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "Node.js Crash Course",
            channel: "BackEndMastery",
            views: 153400,
            createdAt: "6 months ago",
            videoLink: "https://backendmastery.com/node-crash",
            avatar: "https://avatars.com/backend",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "Top 5 VSCode Extensions for Devs",
            channel: "DailyDevTips",
            views: 50120,
            createdAt: "3 days ago",
            videoLink: "https://dailydev.com/vscode-top5",
            avatar: "https://avatars.com/dailydev",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "Build a Chat App with Socket.io",
            channel: "RealTimeCoder",
            views: 74430,
            createdAt: "1 year ago",
            videoLink: "https://realtimecoder.io/chat-app",
            avatar: "https://avatars.com/realtime",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "AI Tools Changing Web Dev",
            channel: "AIWebToday",
            views: 87000,
            createdAt: "2 weeks ago",
            videoLink: "https://aiwebtoday.com/tools2025",
            avatar: "https://avatars.com/aiweb",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "Understanding JavaScript Closures",
            channel: "JSDeepDive",
            views: 22000,
            createdAt: "5 days ago",
            videoLink: "https://jsdeepdive.com/closures",
            avatar: "https://avatars.com/jsdeepdive",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "Next.js App from Scratch",
            channel: "FrontendFuel",
            views: 118900,
            createdAt: "4 months ago",
            videoLink: "https://frontendfuel.com/nextjs-app",
            avatar: "https://avatars.com/frontendfuel",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        },
        {
            title: "How the Internet Works",
            channel: "ComputerBasics",
            views: 289000,
            createdAt: "2 years ago",
            videoLink: "https://computerbasics.com/internet101",
            avatar: "https://avatars.com/basics",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCABsXnFFsol-ATBbKd_ay3xivBgKIXROVGA&s"
        }
    ];

    return (
        <>
            <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(25vw, 1fr))"
                gap={2}
            >
                {videos.map((video, index) => (
                    <CardContainer video={video} key={index} />
                ))}
            </Box>


        </>
    )
}

export default MainContainer