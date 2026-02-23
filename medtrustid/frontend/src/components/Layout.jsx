import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    const nav = useNavigate();
    // We can fetch user details from localStorage for the global nav
    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : {};

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/");
    };

    return (
        <>
            <Navbar user={user} onLogout={handleLogout} />
            <Outlet />
        </>
    );
}
