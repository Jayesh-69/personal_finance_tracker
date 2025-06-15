import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login.js';
import Dashboard from './components/dashboard.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            localStorage.getItem('user')
              ? <Dashboard />
              : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;