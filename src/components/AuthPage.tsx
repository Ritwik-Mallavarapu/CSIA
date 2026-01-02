import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogIn, UserPlus, Check, X } from 'lucide-react';

type AuthMode = 'role-select' | 'login-trainee' | 'login-admin' | 'signup';

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*...)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('role-select');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const { login, signup } = useAuth();

  const passwordValidation = validatePassword(password);

  const handleLoginTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'trainee');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.valid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      await signup({ username, email, password, fullName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      {mode === 'role-select' && (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-600 p-3 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dad&Dude</h1>
            <p className="text-gray-600 mb-8">Training Platform</p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('login-trainee');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-3 group"
              >
                <LogIn className="w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div>Trainee Login</div>
                  <div className="text-xs text-blue-200">Access your training dashboard</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setUsername('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-3 group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div>Trainee Sign Up</div>
                  <div className="text-xs text-green-200">Create your account</div>
                </div>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">Or</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMode('login-admin');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full bg-slate-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-3 group"
              >
                <LogIn className="w-5 h-5 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div>Administrator Login</div>
                  <div className="text-xs text-slate-300">Admin dashboard access</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'login-trainee' && (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setMode('role-select')}
              className="text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <div className="bg-blue-100 inline-flex p-3 rounded-full mb-4">
                <LogIn className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trainee Login</h2>
              <p className="text-gray-600 text-sm mt-1">Access your training account</p>
            </div>

            <form onSubmit={handleLoginTrainee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setUsername('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {mode === 'login-admin' && (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setMode('role-select')}
              className="text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <div className="bg-slate-100 inline-flex p-3 rounded-full mb-4">
                <Shield className="w-8 h-8 text-slate-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Administrator Login</h2>
              <p className="text-gray-600 text-sm mt-1">Access the admin panel</p>
            </div>

            <form onSubmit={handleLoginAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                  required
                  autoComplete="email"
                  placeholder="admin@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mode === 'signup' && (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setMode('role-select')}
              className="text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <div className="bg-green-100 inline-flex p-3 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 text-sm mt-1">Sign up as a trainee</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  required
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  required
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  required
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                {showPasswordRequirements && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {password.length >= 8 ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={password.length >= 8 ? 'text-green-700' : 'text-gray-600'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {/[A-Z]/.test(password) ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={/[A-Z]/.test(password) ? 'text-green-700' : 'text-gray-600'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-700' : 'text-gray-600'}>
                          One special character (!@#$%...)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !passwordValidation.valid}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login-trainee');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
