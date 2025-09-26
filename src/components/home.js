import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import FadeInOnScroll from './fadeInOnScroll.js';

// Slideshow component sliding left to right
const Slideshow = ({ images, interval = 3000 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="hero-slideshow-wrapper" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <div
        className="hero-slideshow"
        style={{
          display: 'flex',
          width: `${images.length * 100}%`,
          transform: `translateX(-${(100 / images.length) * current}%)`,
          transition: 'transform 1s ease-in-out',
          height: '100%',
        }}
      >
        {images.map((image, idx) => (
          <div
            key={idx}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: `${100 / images.length}%`,
              height: '100%',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const slideshowImages = [
    '/images/slide1.jpg',
    '/images/slide2.jpg',
    '/images/slide3.jpg',
    '/images/slide4.jpeg',
  ];

  return (
    <div>
      {/* Hero Section */}
      <header className="hero">
        <Slideshow images={slideshowImages} interval={4000} />
        <div className="hero-text">
          <h1>MoveSphere</h1>
          <p>
            A unified solution for transportation and logistics, focused on ports, harbours, and hangars.
            It streamlines compliance with step-by-step permit guidance, offers legal support, and provides
            a real-time infrastructure directory of warehouses, depots, and terminals with GPS and pricing details.
            Through a built-in dashboard, companies can manage inventory and fleets efficiently, reducing paperwork
            and enabling smarter, transparent logistics operations.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/infrastructure">Find infrastructure</Link>
            <Link className="btn" to="/compliance">Start compliance</Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="cards">
          <FadeInOnScroll className="card">
            <Link to="/compliance">
              <img src="/icons/compliance.png" alt="Compliance" />
              <h3>Compliance</h3>
              <p>Step-by-step licenses, permits, NOCs, nearest offices, and official links.</p>
            </Link>
          </FadeInOnScroll>

          <FadeInOnScroll className="card">
            <Link to="/infrastructure">
              <img src="/icons/infrastructure.png" alt="Infrastructure" />
              <h3>Infrastructure</h3>
              <p>Warehouses, hangars, ports, depots with capacity, availability, and pricing.</p>
            </Link>
          </FadeInOnScroll>

          <FadeInOnScroll className="card">
            <Link to="/legal">
              <img src="/icons/legal.png" alt="Legal" />
              <h3>Legal & Courts</h3>
              <p>Nearest courts, hall allocations, lawyer directory, and applicable acts.</p>
            </Link>
          </FadeInOnScroll>

          <FadeInOnScroll className="card">
            <Link to="/dashboard">
              <img src="/icons/dashboard.png" alt="Dashboard" />
              <h3>Company Dashboard</h3>
              <p>Cloud spreadsheet integration for inventory, fleet, and storage utilization.</p>
            </Link>
          </FadeInOnScroll>

          <FadeInOnScroll className="card">
            <Link to="/maps">
              <img src="/icons/maps.png" alt="Maps" />
              <h3>GPS & Maps</h3>
              <p>Find nearest offices, warehouses, ports, and get live directions.</p>
            </Link>
          </FadeInOnScroll>

          <FadeInOnScroll className="card">
            <Link to="/chatbot">
              <img src="/icons/chatbot.png" alt="Chatbot" />
              <h3>AI Chatbot</h3>
              <p>Ask for documents needed, nearby resources, or infra availability.</p>
            </Link>
          </FadeInOnScroll>

          {/* Bidding Card */}
          <FadeInOnScroll className="card">
            <Link to="/bidding">
              <img src="/icons/bidding.png" alt="Bidding" />
              <h3>Bidding</h3>
              <p>
                Participate in freight and logistics bids for securing warehouses.
              </p>
            </Link>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
};

export default Home;
