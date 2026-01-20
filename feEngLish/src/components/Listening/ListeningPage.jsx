import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ExerciseList from "./ExerciseList";
import ListeningStatsPage from "./ListeningStatsPage";

const ListeningPage = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [activeTab, setActiveTab] = useState("exercises");
  const [user, setUser] = useState({
    username: "guest",
    role: "user",
  });

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("role");
    const usernameFromStorage = localStorage.getItem("username");

    setUser({
      username: usernameFromStorage || "guest",
      role: role || "user",
    });

    const path = location.pathname;
    if (path.includes("/listening/history")) {
      setActiveTab("history");
    } else if (path.includes("/listening/stats")) {
      setActiveTab("stats");
    } else {
      setActiveTab("exercises");
    }
  }, [location]);

  const renderContent = () => {
    switch (activeTab) {
      case "history":
        return;

      case "stats":
        return <ListeningStatsPage />;

      default:
        return <ExerciseList user={user} />;
    }
  };

  return (
    <div>
      <div className="h-[170px] bg-blue-50 flex justify-center items-center">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Listening Exercises
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Luyện nghe và điền từ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 px-4">
        <div className="border-b mb-6 flex space-x-6">
          {["exercises", "history", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "exercises"
                ? "Bài Tập"
                : tab === "history"
                  ? ""
                  : "Thống Kê"}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ListeningPage;
