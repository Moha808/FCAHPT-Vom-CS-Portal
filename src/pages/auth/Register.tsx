import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    matricNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science',
    program: 'ND Computer Science',
    level: 'ND 1',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useAuthStore();

  useEffect(() => {
    if (user && userData) {
      navigate(`/${userData.role === 'admin' ? 'admin' : userData.role}/dashboard`);
    }
  }, [user, userData, navigate]);

  const handleProgramChange = (programVal: string) => {
    const defaultLevel = programVal.startsWith('HND') ? 'HND 1' : 'ND 1';
    setFormData(prev => ({
      ...prev,
      program: programVal,
      level: defaultLevel
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // 1. Create user document
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: formData.name,
        matricNumber: formData.matricNumber,
        email: formData.email,
        role: 'student',
        department: formData.department,
        program: formData.program,
        level: formData.level,
      });

      // 2. Fetch courses for student's level & program to automatically seed their courses
      // Note: HND levels use ND course structure as base curriculum if HND specific courses aren't distinct
      const targetLevel = formData.level.startsWith('HND') 
        ? formData.level.replace('HND', 'ND') 
        : formData.level;

      const coursesSnap = await getDocs(collection(db, 'courses'));
      const batch = writeBatch(db);

      coursesSnap.docs.forEach(courseDoc => {
        const course = courseDoc.data();
        if (course.level === targetLevel || (targetLevel === 'ND 2' && course.level === 'ND 1')) {
          const enrollmentRef = doc(collection(db, 'enrollments'));
          batch.set(enrollmentRef, {
            studentId: uid,
            courseCode: course.courseCode,
            semester: course.semester,
            grade: null,
            status: 'in_progress',
            enrolledAt: new Date().toISOString(),
          });
        }
      });

      await batch.commit();
      // Navigation is now handled by the useEffect once userData is synced
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(err.message || 'Failed to register. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <div className="w-12 h-12 bg-vom-green rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4">
            V
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900">Student Registration</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-vom-green hover:text-vom-green-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Matric Number</label>
              <input type="text" name="matricNumber" required value={formData.matricNumber} onChange={handleChange}
                placeholder="e.g. FCAHPT/CS/2023/001"
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Department — fixed, read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input type="text" value="Computer Science" readOnly
                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <select 
                  name="program" 
                  value={formData.program} 
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm bg-white"
                >
                  <option value="ND Computer Science">ND</option>
                  <option value="HND Computer Science">HND</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select 
                  name="level" 
                  value={formData.level} 
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm bg-white"
                >
                  {formData.program.startsWith('HND') ? (
                    <>
                      <option value="HND 1">HND 1</option>
                      <option value="HND 2">HND 2</option>
                    </>
                  ) : (
                    <>
                      <option value="ND 1">ND 1</option>
                      <option value="ND 2">ND 2</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-vom-green hover:bg-vom-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vom-green transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-vom-green font-medium hover:underline">
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
