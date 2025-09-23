import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";

import "./App.css";

import LandingPage from "./pages/LandingPage/LandingPage";
import ChatBotPage from "./pages/ChatBotPage";
import MapPage from "./pages/MapPage";
import Sidebar from "./components/sidebar/SideBar";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className={`chat-app-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={(path) => {
          navigate(path);
          setIsMenuOpen(false);
        }}
      />

      {/* Overlay */}
      <div
        className={`menu-overlay ${isMenuOpen ? "visible" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="chat-app-card">
        {/* Header (hidden on home) */}
        {!isHome && (
          <div className="chat-header">
            <button
              className="menu-button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <h1 className="chat-title">INGRES BOT</h1>

            {/* Right-side controls */}
            <div className="header-actions">
              <button
                className="dark-mode-button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>

              <div className="online-indicator" />
            </div>
          </div>
        )}

        {/* Routes */}
        {isHome ? (
          <LandingPage />
        ) : (
          <div className="chat-messages-container">
            <Routes>
              <Route path="/chat" element={<ChatBotPage />} />
              <Route path="/map" element={<MapPage />} />
            </Routes>
          </div>
        )}
      </div>
    </div>
  );
}
