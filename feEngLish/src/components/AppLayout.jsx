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
import ListWord from "./Listword";
import clsx from "clsx";
import styles from "../css/AppLayOut.module.css";
import ListUser from "./ListUser";
import Appkhac from "./Gomlaiflashcard";

import VocabsLayout from "./VocabsLayout";
import LayoutTopicQuiz from "./LayoutTopicQuiz";
import QuizListPage from "./QuizsList";
import QuizDetailPage from "./QuizDetail";
import QuizResultPage from "./QuizResultPage";
export const AppLayout = () => {
  return (
    <>
      <div className={clsx(styles.container_app, "mt-20")}></div>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/createword" element={<ProtectedRoute><CreateWord /></ProtectedRoute>} /> */}
        <Route path="/createword" element={<CreateWord />} />
        <Route path="/show_word" element={<ListWord />} />
        <Route path="/show_user" element={<ListUser />} />
        <Route path="/xemfl" element={<Appkhac />} />
        {/* Thêm fallback route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
        {/* Quiz */}
        <Route path="/quiz_topic" element={<LayoutTopicQuiz />} />
        <Route path="/quiz/topic/:topic" element={<QuizListPage />} />
        <Route path="/quiz/:id" element={<QuizDetailPage />} />
        <Route path="/quiz/:id/result" element={<QuizResultPage />} />
        {/* End Quiz */}
        <Route path="/vocab" element={<VocabsLayout />} />
        <Route path="/show_user" element={<ListUser />} />

        <Route path="/xemfl" element={<Appkhac />} />
      </Routes>
      <Page1></Page1>
      <Page2></Page2>
      <Page3></Page3>
      <ToastContainer />
    </>
  );
};
