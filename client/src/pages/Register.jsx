import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import LoadingOverlay from '../components/LoadingOverlay';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage]   = useState('Creating account…');
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage('Creating account…');

   const timer = setTimeout(() => {
     setMessage('Waking up server—it might take a moment…');
   }, 3000);
    try {
      const token = await register(form.username, form.email, form.password);
      setToken(token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <>
     {loading && <LoadingOverlay message={message} />}
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required minLength="6" />
        <button type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Sign Up'}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
    </>
  );
}
