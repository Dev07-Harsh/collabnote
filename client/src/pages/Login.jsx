import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(form.email, form.password);
      setToken(token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      <form onSubmit={onSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>Don't have an account? <Link to="/register">Sign up</Link></p>
    </div>
  );
}
