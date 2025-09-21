import React, { useState, useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import "./ChatBot.css";

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage = { id: generateId(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const botResponse = {
        id: generateId(),
        text: data.answer,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to fetch bot response:", error);
      const errorMessage = {
        id: generateId(),
        text: "Sorry, I couldn't get a response. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const Message = ({ text, sender }) => (
    <div className={`message-bubble message-${sender}`}>
      <span className="message-icon">
        {sender === "bot" ? <Bot size={20} /> : <User size={20} />}
      </span>
      <p className="message-text">{text}</p>
    </div>
  );

  return (
    <>
      {messages.length === 0 ? (
        <div className="empty-chat-message">
          <Bot size={48} className="empty-chat-icon" />
          <p className="empty-chat-text">Hello I am the INGRES chatbot!</p>
          <p className="empty-chat-subtext">Type a message below to begin.</p>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg) => (
            <Message key={msg.id} text={msg.text} sender={msg.sender} />
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
          placeholder="Type your message..."
        />
        <button type="submit" className="send-button" aria-label="Send message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="send-icon"
          >
            <path d="m22 2-7 19-3-8-8-3 19-7Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </form>
    </>
  );
}
