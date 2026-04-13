import { useState } from "react";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as storeLogout } from "../store/authSlice";

function useLogout() {
    const [loading, setLoading] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logout = async (): Promise<boolean | undefined> => {
        setLoading(true);

        try {
            await axiosPrivate.post("/users/logout");

            dispatch(storeLogout());
            navigate("/login");

            return true;
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, logout };
}

export { useLogout };