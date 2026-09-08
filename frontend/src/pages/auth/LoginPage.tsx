import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Successfully logged in');
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 400) {
          toast.error('Invalid email or password. Please try again.');
        } else if (status >= 500) {
          toast.error('We are experiencing technical difficulties. Please try again later.');
        } else {
          toast.error(error.response.data?.message || 'An unexpected error occurred. Please try again.');
        }
      } else {
        toast.error('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="admin@inocyte.com"
      />
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        placeholder="••••••••"
        endElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-brand-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />
      <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
        Sign in
      </Button>
    </form>
  );
};
