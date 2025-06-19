
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;