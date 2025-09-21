import React from "react";
import { Bot, Map, X, Home } from "lucide-react";

export default function Sidebar({ isMenuOpen, setIsMenuOpen, onNavigate }) {
  return (
    <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-close-button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-item" onClick={() => onNavigate("/")}>
          <Home size={20} />
          <span className="sidebar-item-text">Home</span>
        </li>
        <li className="sidebar-item" onClick={() => onNavigate("/chat")}>
          <Bot size={20} />
          <span className="sidebar-item-text">Chat</span>
        </li>
        <li className="sidebar-item" onClick={() => onNavigate("/map")}>
          <Map size={20} />
          <span className="sidebar-item-text">Map</span>
        </li>
      </ul>
    </div>
  );
}
