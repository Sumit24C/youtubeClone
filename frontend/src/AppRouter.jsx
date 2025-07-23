import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Signup from './pages/Signup'

const AppRouter = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [

        ]
    }, 
    {
        path: '/login',
        element: ""
    },
    {
        path: '/signup',
        element: <Signup/>
    },
])

export default AppRouter