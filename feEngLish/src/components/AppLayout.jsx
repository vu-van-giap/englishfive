import { Route, Routes } from "react-router-dom";
import Content from "./content";
import Register from "./Register";
import Login from "./Login/Login";
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";
import CreateWord from "./CreateWord/CreateWord";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
export const AppLayout = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Content />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                {/* <Route path="/createword" element={<ProtectedRoute><CreateWord /></ProtectedRoute>} /> */}
                <Route path="/createword" element={<CreateWord />} />
            </Routes>
            <Page1></Page1>
            <Page2></Page2>
            <Page3></Page3>
            <ToastContainer /></>
    )
}