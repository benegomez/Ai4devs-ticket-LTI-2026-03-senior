import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AddCandidateForm from './components/AddCandidateForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <header className="App-header">
                <a className="App-link" href="/candidates/new">
                  Add New Candidate
                </a>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
              </header>
            </div>
          }
        />
        <Route path="/candidates/new" element={<AddCandidateForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
