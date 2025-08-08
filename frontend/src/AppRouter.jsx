import { Routes, Route } from 'react-router-dom'
import App from './App'

import AuthLayout from './components/AuthLayout'
import PersistLogin from './components/PersistLogin'
import NotFound from './components/NotFound'
import CloudinaryPlayer from './components/Video/CloudinaryPlayer'
import {
    Home,
    You,
    Channel,
    Comments,
    WatchHistory,
    LikedVideos,
    Login,
    Playlist,
    Signup,
    Subscription,
    VideoPage
} from "../src/pages/index"

import { ChannelAbout, ChannelPlaylist, ChannelPosts, ChannelVideos } from '../src/components/Channel'

function AppRouter() {
    return (
        <Routes>
            {/* Protected Routes */}
            <Route element={<PersistLogin />}>
                <Route element={<AuthLayout authenticated={true} />}>
                    <Route path="/" element={<App />}>
                        <Route index path="/" element={<Home />} />
                        <Route index path="/you" element={<You />} />
                        <Route index path="/playlist" element={<Playlist/>} />
                        <Route index path="/liked-videos" element={<LikedVideos/>} />
                        <Route index path="/history" element={<WatchHistory/>} />
                        <Route index path="/subscriptions" element={<Subscription/>} />
                        <Route path="/c/:id" element={<Channel />} >
                            <Route index element={<ChannelVideos />} />
                            <Route path='posts' element={<ChannelPosts />} />
                            <Route path='playlists' element={<ChannelPlaylist />} />
                            <Route path='about' element={<ChannelAbout />} />
                        </Route>
                        <Route path="/v/:id" element={<VideoPage />} />
                        <Route path='/test' element={<CloudinaryPlayer />} />
                    </Route>
                </Route>

                {/* Public Routes */}
                <Route element={<AuthLayout authenticated={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
            </Route>
            <Route path='*' element={<NotFound />} />

        </Routes>
    )
}

export default AppRouter
