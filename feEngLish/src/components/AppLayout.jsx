import { Route, Routes } from "react-router-dom";
import Content from "./content";
import Register from "./Register";
import Login from "./Login/Login";
import Page2 from "./page2";
import Page3 from "./page3";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import clsx from "clsx";
import styles from "../css/AppLayOut.module.css";
import ListUser from "./ListUser";
// import flashcard
import Appkhac from "./Gomlaiflashcard";
import TopicSelection from "./TopicSelection";
import FlashcardViewer from "./FlashcardViewer";
// Import các component Vocab
import VocabHome from "./Vocab/VocabHome";
import VocabTopicPage from "./Vocab/VocabTopicPage";
import VocabDetailPage from "./Vocab/VocabDetailPage";
import VocabSearchPage from "./Vocab/VocabSearchPage";

// Import Quiz components
import LayoutTopicQuiz from "./Quiz/LayoutTopicQuiz";
import QuizListPage from "./Quiz/QuizsList";
import QuizDetailPage from "./Quiz/QuizDetail";
import QuizResultPage from "./Quiz/QuizResultPage";
import QuizList from "./Quiz/QuizMgr";

// Import Listening component
import ListeningPage from "./Listening/ListeningPage";

export const AppLayout = () => {
  return (
    <>
      <div className={clsx(styles.container_app, "mt-20")}></div>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* di sang flashcard */}
        <Route path="/flashcards/all" element={<FlashcardViewer />} />
        <Route path="/flashcards/topic/:topic" element={<FlashcardViewer />} />
        <Route path="/flashcards" element={<FlashcardViewer />} />
        {/* Quiz */}

        <Route path="/quiz_topic" element={<LayoutTopicQuiz />} />
        <Route
          path="/quiz/topic/:topic"
          element={
            <ProtectedRoute>
              <QuizListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/quiz/:id/result" element={<QuizResultPage />} />
        <Route path="/quiz_manager" element={<QuizList />} />
        {/* End Quiz */}

        {/* Vocab */}
        <Route path="/vocab" element={<VocabHome />} />
        <Route path="/vocab/search" element={<VocabSearchPage />} />
        <Route
          path="/vocab/topic/:topic"
          element={
            <ProtectedRoute>
              <VocabTopicPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocab/:id"
          element={
            <ProtectedRoute>
              <VocabDetailPage />
            </ProtectedRoute>
          }
        />
        {/* End Vocab */}

        {/* Listening */}
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/listening/history" element={<ListeningPage />} />
        <Route path="/listening/stats" element={<ListeningPage />} />

        <Route path="/show_user" element={<ListUser />} />
        <Route path="/xemfl" element={<Appkhac />} />
      </Routes>
      <Page2></Page2>
      <Page3></Page3>
      <ToastContainer />
    </>
  );
};
