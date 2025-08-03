import { Routes, Route } from 'react-router-dom'
import App from './App'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Comments from './pages/Comments'
import AuthLayout from './components/AuthLayout'
import PersistLogin from './components/PersistLogin'
import NotFound from './components/NotFound'
import Home from './pages/Home'
import VideoPage from './pages/VideoPage'
import CloudinaryPlayer from './components/Video/CloudinaryPlayer'

function AppRouter() {
    return (
        <Routes>
            {/* Protected Routes */}
            <Route element={<PersistLogin />}>
                <Route element={<AuthLayout authenticated={true} />}>
                    <Route path="/" element={<App />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/v/:id" element={<VideoPage/>} />
                        <Route path='/test' element={<CloudinaryPlayer/>}/>
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
