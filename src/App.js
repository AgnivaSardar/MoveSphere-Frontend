import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Footer from './components/footer';
import Header from './components/header';
import Home from './components/home';
import Chatbot from './components/chatbot';
import Dashboard from './components/dashboard';
import Infrastructure from './components/infrastructure';
import Legal from './components/legal';
import Login from './components/login';
import SignUp from './components/signup';
import Maps from './components/maps';
import Compliance from './components/compliance';
import Bidding from './components/bidding';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/bidding" element={<Bidding />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
