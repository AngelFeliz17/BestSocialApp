import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import api from '../context/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    const userData = {
      email,
      password
    };

    await api.post("/users/login", userData).then((res) => {
      localStorage.setItem("token", res.data.token);
      navigate("/feed");
    }).catch((err) => {
      setError(err.response?.data?.msg || "Login error");
      setLoading(false);
    });
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <Card className="p-8">
          <form className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p style={{color: "red"}}>{error}</p> : null}
            <Button
              type="submit"
              className="w-full"
              onClick={login}
              disabled={loading || email === '' || password === '' ? true : false}
            >
              {loading ? "Signing in" : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
