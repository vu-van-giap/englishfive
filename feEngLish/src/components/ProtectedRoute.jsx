import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
    const [checked, setChecked] = useState(false);
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) {
            toast.info("Vui lòng đăng nhập để truy cập trang này");
        }
        setChecked(true);
    }, [token]);
    if (!token && checked) {
        return <Navigate to="/login" replace />;
    }
    if (!token && !checked) {
        return null;
    }
    return children;
};

export default ProtectedRoute;
