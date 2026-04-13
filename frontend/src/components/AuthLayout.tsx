import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../store/authSlice";

function AuthLayout({ authenticated = true }: { authenticated?: boolean }) {
    const { status } = useSelector((state: any) => state.auth);

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (authenticated && !status) {
            dispatch(logout());
            navigate("/login", {
                state: { from: location.pathname },
                replace: true,
            });
        } else if (!authenticated && status) {
            navigate("/", { replace: true });
        }
    }, [status, authenticated]);

    return <Outlet />;
}

export default AuthLayout;