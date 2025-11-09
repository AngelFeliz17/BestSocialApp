import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import api from '../context/axios';

const Register: React.FC = () => {
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');

const navigate = useNavigate();

const createUser = async () => {
  setLoading(true);
  const userData = {
    username,
    email,
    password
  };

  await api.post("/users/register", userData).then(() => {
    navigate("/login");
    setLoading(false);
  }).catch((err) => {
    setError(err.response.data.msg)
    setLoading(false);
  })
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <Card className="p-8">
          <form className="space-y-6">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label="Username"
              type="text"
              placeholder="Choose a username"
            />
            
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email address"
              type="email"
              placeholder="Enter your email"
            />
            
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              type="password"
              placeholder="Create a password"
            />
            
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
            />
            {error ? <p style={{color: "red"}}>{error}</p> : null}
            <Button
              className="w-full"
              type="submit"
              onClick={createUser}
              disabled={loading || username === '' || email === '' || password === '' || confirmPassword === '' ? true : false}
            >
              { loading ? "Creating" : "Create user" }
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
