
import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';

import { io } from 'socket.io-client';
import api from '../services/api';


export default function NoteEditorPage() {
   const { id } = useParams();
  const token = localStorage.getItem('token');
  // If for some reason someone hits this URL without logging in, redirect:
  if (!token) return <Navigate to="/login" replace />;

   const [content, setContent]         = useState('');
   const [title, setTitle]             = useState('');
   const [loading, setLoading]         = useState(true);
   const [activeUsers, setActiveUsers] = useState([]);

  const socketRef = useRef(null);
  const textareaRef = useRef();

  useEffect(() => {
    // Load the note content
    api.get(`/notes/${id}`)
      .then(({ data }) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Connect socket 
    socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api',''), {
      transports: ['websocket'],
      auth: { token }
    });

    const socket = socketRef.current;
    socket.emit('joinNote', id);
    socket.on('noteUpdated', updated => setContent(updated.content));
    socket.on('activeUsers', users => setActiveUsers(users));

    return () => {
      socket.emit('leaveNote', id);
      socket.disconnect();
    };
  }, [id, token]);

   const handleChange = e => {
     const newContent = e.target.value;
     setContent(newContent);

    socketRef.current.emit('editNote', { noteId: id, content: newContent });
   };

   if (loading) return <p>Loading note…</p>;

   return (
     <div className="editor-page">
       <h2>Editing: {title}</h2>

       <textarea
         ref={textareaRef}
         value={content}
         onChange={handleChange}
         rows={20}
         style={{ width: '100%', fontSize: '1rem' }}
       />

       {/* —— Presence & share block —— */}
       <div className="editor-info">
         <p><strong>Collaborators online:</strong></p>
         <ul>
           {activeUsers.map(u => (
             <li key={u.id}>{u.username}</li>
           ))}
         </ul>
         <p>Share this URL to collaborate:</p>
         <code>{window.location.href}</code>
       </div>
     </div>
   );
 }
