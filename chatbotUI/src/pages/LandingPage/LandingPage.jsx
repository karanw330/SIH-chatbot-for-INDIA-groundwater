import React, { useState, useEffect } from "react";
import { Map, MessageSquare, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropletAnimation, setDropletAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDropletAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenMap = () => navigate("/map");
  const handleOpenChatbot = () => navigate("/chat");
  const handleDashboard = () => navigate("/dashboard");

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>AQUAINSIGHTS</h2>
        </div>
        <div className="nav-links desktop-only">
          <a href="#home">HOME</a>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleDashboard();
            }}
          >
            DASHBOARD
          </a>
          <a
            href="https://ingres.iith.ac.in/home"
            target="_blank"
            rel="noopener noreferrer"
            className="portal-btn"
          >
            INGRES Portal
          </a>
        </div>
        <button
          className="mobile-menu-btn mobile-only"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="mobile-menu">
          <a href="#home" onClick={() => setIsMenuOpen(false)}>
            HOME
          </a>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleDashboard();
              setIsMenuOpen(false);
            }}
          >
            DASHBOARD
          </a>
          <a
            href="https://ingres.iith.ac.in/home"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
          >
            Portal
          </a>
        </div>
      )}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="text-section">
            <h1 className="hero-title">
              Groundwater insights.
              <br />
              <span className="highlight">One click away.</span>
            </h1>
            <p className="hero-description">
              Explore India's groundwater assessment across years & states with
              an interactive AI assistant.
            </p>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleOpenMap}>
                <Map size={20} /> Open Map
              </button>
              <button className="btn btn-secondary" onClick={handleOpenChatbot}>
                <MessageSquare size={20} /> INGRES ChatBot
              </button>
            </div>
          </div>

          <div className="visual-section">
            <div
              className={`water-droplet ${dropletAnimation ? "animate" : ""}`}
            >
              <div className="droplet-inner">
                <div className="water-level"></div>
                <div className="reflection"></div>
              </div>
              <div className="brand-text">AQUAINSIGHTS</div>
            </div>
            <div className="floating-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
