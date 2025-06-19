import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { login } from '../authSlice';
import { useNavigate } from 'react-router-dom';
import { login as loginThunk } from '../authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If backend is not connected, allow login with any credentials
    dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        user: { name: email.split('@')[0], email },
        token: 'mock-token',
      },
    });
    navigate('/dashboard');
    // Old code for real backend:
    // const result = await dispatch(login({ email, password }));
    // if (result.meta.requestStatus === 'fulfilled') {
    //   navigate('/');
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
        <div className="text-center mt-4 text-blue-600">
          Don't have an account? <a href="/signup" className="underline">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 