import React, { useState, useContext } from 'react';
import { loginUser, registerUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'voter', region: 'North' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser(formData);
        alert('Registered successfully! Please login.');
        setIsRegister(false);
      } else {
        const { data } = await loginUser({ username: formData.username, password: formData.password });
        login(data.user, data.token);
        navigate(data.user.role === 'commission' ? '/admin' : '/voter');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">{isRegister ? 'Register' : 'Login'}</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        {isRegister && (
          <>
            <select
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="voter">Voter</option>
              <option value="commission">Election Commission</option>
            </select>
            <input
              type="text"
              placeholder="Region (e.g. North, South)"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
            />
          </>
        )}
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition">
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>
        <p onClick={() => setIsRegister(!isRegister)} className="text-sm text-center cursor-pointer text-blue-400 hover:underline">
          {isRegister ? 'Already registered? Login' : 'Need an account? Register'}
        </p>
      </form>
    </div>
  );
};

export default Login;