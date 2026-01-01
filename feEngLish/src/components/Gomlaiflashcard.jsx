import React, { useState } from "react";
import FlashcardList from "./FlashcardList";
import FlashcardViewer from "./FlashcardViewer";
import CreateFlashcard from "./CreateFlashcard";

function Appkhac() {
  const [activeTab, setActiveTab] = useState("viewer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-6">English Flashcard App</h1>

          {/* Navigation tabs */}
          <nav className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                activeTab === "viewer"
                  ? "bg-white text-blue-500 font-bold shadow-lg transform -translate-y-1"
                  : "bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:transform hover:-translate-y-1"
              }`}
              onClick={() => setActiveTab("viewer")}
            >
              Flashcard Viewer
            </button>

            <button
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                activeTab === "list"
                  ? "bg-white text-blue-500 font-bold shadow-lg transform -translate-y-1"
                  : "bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:transform hover:-translate-y-1"
              }`}
              onClick={() => setActiveTab("list")}
            >
              All Flashcards
            </button>

            <button
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                activeTab === "create"
                  ? "bg-white text-blue-500 font-bold shadow-lg transform -translate-y-1"
                  : "bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:transform hover:-translate-y-1"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Create New
            </button>
          </nav>
        </header>

        {/* Main content */}
        <main className="p-8 min-h-[500px]">
          {activeTab === "viewer" && <FlashcardViewer />}
          {activeTab === "list" && <FlashcardList />}
          {activeTab === "create" && <CreateFlashcard />}
        </main>
      </div>
    </div>
  );
}

export default Appkhac;
