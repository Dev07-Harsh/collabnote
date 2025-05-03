import api from './api';



export const getNotes = (search = '', sort = 'newest') =>
  api.get(`/notes?search=${encodeURIComponent(search)}&sort=${sort}`);

export const createNote = (note) =>
  api.post('/notes', note);

export const updateNote = (id, note) =>
  api.put(`/notes/${id}`, note);

export const deleteNote = (id) =>
  api.delete(`/notes/${id}`);
