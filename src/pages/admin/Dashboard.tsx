import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { UserData } from '../../types';
import { Users, ShieldCheck, GraduationCap, UserPlus, X, Eye, EyeOff, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import ToastModal from '../../components/ToastModal';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => d.data() as UserData));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'advisor' | 'admin') => {
    try {
      const updates: any = { role: newRole };
      
      if (newRole === 'admin') {
        updates.program = '';
        updates.level = '';
        updates.department = '';
      } else if (newRole === 'advisor') {
        updates.program = '';
        updates.level = '';
      }

      await updateDoc(doc(db, 'users', userId), updates);
      setUsers(users.map(u => u.uid === userId ? { ...u, ...updates } : u));
      setToast({
        isOpen: true,
        type: 'success',
        message: `Role successfully updated to ${newRole}.`
      });
    } catch {
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Failed to update role. Please check your permissions.'
      });
    }
  };

  const handleAssignAdvisor = async (student: UserData, advisorId: string) => {
    try {
      const selectedAdvisor = users.find(u => u.uid === advisorId);
      const advisorName = selectedAdvisor?.name || 'Departmental Advisor';
      const advisorEmail = selectedAdvisor?.email || '';
      const advisorPhone = selectedAdvisor?.phone || '';

      const updates = {
        advisorId: advisorId,
        advisorName: advisorName,
        advisorEmail: advisorEmail,
        advisorPhone: advisorPhone,
      };

      // 1. Update student document
      await updateDoc(doc(db, 'users', student.uid), updates);
      setUsers(users.map(u => u.uid === student.uid ? { ...u, ...updates } : u));

      // 2. Post notification announcement to both parties
      await addDoc(collection(db, 'announcements'), {
        title: `Advisor Assignment: ${student.name}`,
        content: `Academic Advisor ${advisorName} has been assigned to student ${student.name} (${student.matricNumber || 'Student'}).`,
        postedBy: 'HOD (Admin)',
        audience: 'all',
        createdAt: new Date().toISOString(),
      });

      setToast({
        isOpen: true,
        type: 'success',
        message: `Assigned Advisor ${advisorName} to ${student.name}. Notification sent!`
      });
    } catch (err) {
      console.error(err);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Failed to assign advisor. Check permissions.'
      });
    }
  };

  const handleDeactivate = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === false ? 'reactivate' : 'deactivate'} this account?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: currentStatus === false ? true : false });
      setUsers(users.map(u => u.uid === userId ? { ...u, isActive: currentStatus === false ? true : false } : u));
      setToast({ isOpen: true, type: 'success', message: `Account ${currentStatus === false ? 'reactivated' : 'deactivated'}.` });
    } catch {
      setToast({ isOpen: true, type: 'error', message: 'Failed to update account status.' });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  const students = users.filter(u => u.role === 'student');
  const advisors = users.filter(u => u.role === 'advisor');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, assign advisors, and system configuration.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center bg-vom-green hover:bg-vom-green-light text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Staff Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6" />} label="Total Students" value={students.length} color="blue" />
        <StatCard icon={<GraduationCap className="w-6 h-6" />} label="Total Advisors" value={advisors.length} color="purple" />
        <StatCard icon={<ShieldCheck className="w-6 h-6" />} label="Total Admins" value={admins.length} color="green" />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">User Management & Advisor Assignment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Email / Matric</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Role / Dept</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Assigned Advisor</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.uid} className={`hover:bg-gray-50 transition-colors ${user.isActive === false ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {user.name}
                      {user.isActive === false && <span className="ml-2 text-xs text-red-500 font-bold">(Deactivated)</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.email}<br/>
                      <span className="text-xs text-gray-400 font-mono">{user.matricNumber || ''}</span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as any)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize focus:ring-2 focus:ring-vom-green outline-none
                          ${user.role === 'admin' ? 'bg-green-100 text-green-700' :
                            user.role === 'advisor' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'}`}
                      >
                        <option value="student">Student</option>
                        <option value="advisor">Advisor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <br/>
                      <span className="text-xs text-gray-500 mt-1 block">{user.role === 'admin' ? 'System' : (user.program || user.department || '—')}</span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {user.role === 'student' ? (
                        <select
                          value={user.advisorId || ''}
                          onChange={(e) => handleAssignAdvisor(user, e.target.value)}
                          className="border border-gray-300 rounded-md text-xs px-2 py-1.5 focus:ring-2 focus:ring-vom-green focus:border-transparent outline-none bg-white max-w-[160px]"
                        >
                          <option value="">Select Advisor...</option>
                          {advisors.map(adv => (
                            <option key={adv.uid} value={adv.uid}>{adv.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-right space-x-2">
                      <button onClick={() => setEditingUser(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Profile">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeactivate(user.uid, user.isActive !== false ? true : false)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title={user.isActive === false ? 'Reactivate' : 'Deactivate'}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchUsers(); }}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSuccess={() => { setEditingUser(null); fetchUsers(); setToast({ isOpen: true, type: 'success', message: 'User updated successfully.' }); }} 
        />
      )}

      {/* Toast Notification Modal */}
      <ToastModal
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-vom-green',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

// ── Create Staff Modal ─────────────────────────────────────────────────────────
function CreateStaffModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'advisor', department: 'Computer Science' });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password, returnSecureToken: false }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create account.');

      const newUid = data.localId;

      const { db } = await import('../../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', newUid), {
        uid: newUid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
      });

      setDone(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Create Staff Account</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-vom-green" />
              </div>
              <p className="font-semibold text-gray-900">Account created successfully!</p>
              <p className="text-sm text-gray-500 mt-1">The staff member can now log in.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                <input type="text" name="phone" placeholder="e.g. +234 803 000 1234" value={formData.phone} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm bg-white">
                    <option value="advisor">Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input type="text" value="Computer Science" readOnly
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-vom-green hover:bg-vom-green-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit User Modal Component ───────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }: { user: UserData, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    matricNumber: user.matricNumber || '',
    department: user.department || 'Computer Science',
    program: user.program || '',
    level: user.level || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Edit User Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address (Cannot change login email here)</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} disabled
                className="mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Matric Number</label>
                <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm" />
              </div>
            </div>

            {user.role === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <select name="program" value={formData.program} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm bg-white">
                    <option value="">Select...</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Computer Networking">Computer Networking</option>
                    <option value="Software Development">Software Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select name="level" value={formData.level} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green sm:text-sm bg-white">
                    <option value="">Select...</option>
                    <option value="ND 1">ND 1</option>
                    <option value="ND 2">ND 2</option>
                    <option value="HND 1">HND 1</option>
                    <option value="HND 2">HND 2</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 px-4 bg-vom-green hover:bg-vom-green-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
