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
    VideoPage,
    SubscriptionVideos,
    Studio,
    WatchLater
} from "../src/pages/index"

import { ChannelAbout, ChannelPlaylist, ChannelPosts, ChannelVideos } from '../src/components/Channel'
import { ContentPlaylistTab, ContentPostsTab, ContentVideoTab } from "../src/components/Studio"
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
                        <Route path="/you" element={<You />} />
                        <Route path="/studio" element={<Studio />} >
                            <Route index element={<ContentVideoTab />} />
                            <Route path='pl' element={<ContentPlaylistTab />} />
                            <Route path='p' element={<ContentPostsTab />} />
                            <Route path='edit/v/:id' element={<EditVideoPage />} />
                        </Route>
                        <Route path="/playlist" element={<Playlist />} />
                        <Route path="/liked-videos" element={<LikedVideos />} />
                        <Route path="/history" element={<WatchHistory />} />
                        <Route path="/watch-later" element={<WatchLater />} />
                        <Route path="/subscriptions" element={<SubscriptionVideos />} />
                        <Route path="/c/:id" element={<Channel />} >
                            <Route index element={<ChannelVideos />} />
                            <Route path='posts' element={<ChannelPosts />} />
                            <Route path='playlists' element={<ChannelPlaylist />} />
                            <Route path='about' element={<ChannelAbout />} />
                        </Route>
                        <Route path='/feed/channel' element={<SubscribedChannel />} />
                        <Route path="/v/:id/Pl=/:p_id" element={<VideoPage />} />
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
