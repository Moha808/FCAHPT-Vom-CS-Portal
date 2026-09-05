import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'Failed to send reset email. Please check the address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <div className="w-12 h-12 bg-vom-green rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4">
            V
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your institutional email and we'll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-vom-green" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Sent!</h3>
              <p className="text-gray-600 text-sm mb-6">
                A password reset link has been sent to <strong>{email}</strong>. Check your inbox and spam folder.
              </p>
              <Link to="/login" className="text-vom-green font-medium hover:underline flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form className="space-y-6" onSubmit={handleReset}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vom-green focus:border-transparent sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-vom-green hover:bg-vom-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vom-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-vom-green font-medium hover:underline flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
