import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

      if (!userDoc.exists()) {
        await auth.signOut();
        setError('No account record found. Contact the system administrator.');
        setLoading(false);
        return;
      }

      const role = userDoc.data().role;

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'advisor') {
        navigate('/advisor/dashboard');
      } else {
        // Student tried to use the staff portal — sign them out immediately
        await auth.signOut();
        setError('Access denied. This portal is for authorized staff only.');
        setLoading(false);
      }
    } catch (err: any) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* Top security badge */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center bg-vom-green/20 border border-vom-green/40 text-vom-green-light px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
          <Lock className="w-3 h-3 mr-1.5" />
          Restricted Access
        </div>

        {/* Logo */}
        <div className="w-16 h-16 bg-vom-green rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-vom-green/30">
          <ShieldCheck className="w-8 h-8 text-vom-gold" />
        </div>

        <h1 className="text-3xl font-extrabold text-white">Staff Portal</h1>
        <p className="mt-2 text-sm text-gray-400">
          FCAHPT Vom — Authorized Personnel Only
        </p>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 border border-gray-700 py-8 px-6 sm:rounded-2xl sm:px-10 shadow-2xl">

          {error && (
            <div className="mb-6 bg-red-900/40 border border-red-700 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vom-green focus:border-transparent sm:text-sm transition-shadow"
                placeholder="staff@fcahptvom.edu.ng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pr-11 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vom-green focus:border-transparent sm:text-sm transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  className="text-xs text-vom-green-light hover:text-vom-gold transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-vom-green hover:bg-vom-green-light rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-vom-green/20 mt-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-600">
            This is a restricted area. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-gray-600">
        Are you a student?{' '}
        <a href="/login" className="text-vom-green-light hover:underline">
          Go to Student Portal →
        </a>
      </p>
    </div>
  );
}
