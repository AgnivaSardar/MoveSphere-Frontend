import React from 'react';
import '../styles/style.css';

const AIChatbot = () => {
  const BOTPRESS_URL =
    "https://cdn.botpress.cloud/webchat/v3.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/09/25/05/20250925051406-5RQPS68F.json";

  return (
    <section
      className="section"
      style={{
        backgroundColor: '#f9fafb',  // Light gray background for light mode
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',  // subtle shadow
        color: '#111111',  // dark text color
      }}
    >
      <h2 style={{ color: '#222222' }}>AI Chatbot</h2>
      <p className="muted" style={{ color: '#555555' }}>
        Ask compliance, infrastructure, or legal questions.
      </p>

      {/* Embed Botpress Webchat */}
      <div
        style={{
          backgroundColor: '#ffffff',  // white container background
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <iframe
          src={BOTPRESS_URL}
          title="AI Chatbot"
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            backgroundColor: '#ffffff'
          }}
          allow="microphone; fullscreen"
        />
      </div>
    </section>
  );
};

export default AIChatbot;
