import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import NotesPage from './pages/NotesPage';
import ProtectedRoute from './components/ProtectedRoute';
import NoteEditorPage from './pages/NoteEditorPage';


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<ProtectedRoute><NotesPage /></ProtectedRoute>}
      />
      {/* Real‑time editor */}
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
