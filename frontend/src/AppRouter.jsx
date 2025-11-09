import { Routes, Route } from 'react-router-dom'
import App from './App'

import AuthLayout from './components/AuthLayout'
import PersistLogin from './components/PersistLogin'
import CloudinaryPlayer from './components/Video/CloudinaryPlayer'
import {
    Home,
    Channel,
    Comments,
    WatchHistory,
    LikedVideos,
    Login,
    Playlist,
    Signup,
    VideoPage,
    SubscriptionVideos,
    Studio,
    SearchVideoPage,
    NotFound,
    Profile
} from "../src/pages/index"

import { ChannelAbout, ChannelPlaylist, ChannelVideos } from '../src/components/Channel'
import { ContentPlaylistTab, ContentVideoTab } from "../src/components/Studio"
import SubscribedChannel from './pages/SubscribedChannel'
import EditVideoPage from './components/Studio/EditVideoPage'

function AppRouter() {
    return (
        <Routes>
            {/* Protected Routes */}
            <Route element={<PersistLogin />}>
                <Route element={<AuthLayout authenticated={true} />}>
                    <Route path="/" element={<App />}>
                        <Route index path="/" element={<Home />} />
                        <Route path="/studio" element={<Studio />} >
                            <Route index element={<ContentVideoTab />} />
                            <Route path='pl' element={<ContentPlaylistTab />} />
                            <Route path='edit/v/:id' element={<EditVideoPage />} />
                        </Route>
                        <Route path="/playlist" element={<Playlist />} />
                        <Route path="/liked-videos" element={<LikedVideos />} />
                        <Route path="/history" element={<WatchHistory />} />
                        <Route path="/subscriptions" element={<SubscriptionVideos />} />
                        <Route path="/c/:id" element={<Channel />} >
                            <Route index element={<ChannelVideos />} />
                            <Route path='playlists' element={<ChannelPlaylist />} />
                            <Route path='about' element={<ChannelAbout />} />
                        </Route>
                        <Route path='/feed/channel' element={<SubscribedChannel />} />
                        <Route path="/v/:id/Pl=/:p_id" element={<VideoPage />} />
                        <Route path="/v/s" element={<SearchVideoPage />} />
                        <Route path="/v/:id" element={<VideoPage />} />
                        <Route path='/test' element={<CloudinaryPlayer />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path='*' element={<NotFound />} />
                    </Route>
                </Route>

                {/* Public Routes */}
                <Route element={<AuthLayout authenticated={false} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Route>
            </Route>

        </Routes>
    )
}

export default AppRouter
