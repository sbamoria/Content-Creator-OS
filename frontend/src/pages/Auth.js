import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { EnvelopeSimple, Lock, User } from '@phosphor-icons/react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('✅ Welcome back!');
      } else {
        await register(name, email, password);
        toast.success('✅ Account created successfully!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Authentication failed';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-heading font-bold text-primary mb-3">MonetizeFlow</h1>
          <p className="text-zinc-600">Transform your audience into revenue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-surface-border">
          <div className="flex gap-2 mb-6 bg-secondary rounded-full p-1">
            <button
              onClick={() => setIsLogin(true)}
              data-testid="login-tab"
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                isLogin ? 'bg-primary text-primary-foreground' : 'text-zinc-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              data-testid="register-tab"
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                !isLogin ? 'bg-primary text-primary-foreground' : 'text-zinc-600'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="name-input"
                    className="w-full pl-10 pr-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">Email</label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                  className="w-full pl-10 pr-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                  className="w-full pl-10 pr-4 py-3 bg-surface-input border border-transparent focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 rounded-lg transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="auth-submit-button"
              className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 rounded-full py-3 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
