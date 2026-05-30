import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import { Tv } from 'lucide-react';

function App() {
  return (
    <Router>
      <header className="app-header">
        <div className="brand">
          <Tv size={28} />
          <span>WatchSync</span>
        </div>
        <div className="nav-links">
          <a href="/" className="btn btn-secondary">New Room</a>
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
