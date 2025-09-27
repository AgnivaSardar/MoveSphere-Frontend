import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Company Info */}
        <div className="footer-section company-info">
          <h3>Logistics & Transportation</h3>
          <p>
            A unified solution for transportation and logistics, focused on ports, 
            harbours, and hangars. Streamline operations, reduce paperwork, and 
            enable smarter, transparent logistics management.
          </p>
          <p>&copy; 2025 Logistics & Transportation Platform. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/compliance">Compliance</Link></li>
            <li><Link to="/infrastructure">Infrastructure</Link></li>
            <li><Link to="/legal">Legal & Courts</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/maps">GPS & Maps</Link></li>
            <li><Link to="/chatbot">AI Chatbot</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:support@movesphere.com">support@movesphere.com</a></p>
          <p>Phone: <a href="tel:+911234567890">+91 62901 66815</a></p>
          <p>Address: D2 Block - 513, VIT Chennai</p>
        </div>

        {/* Social Media */}
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
