import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { Course } from '../../types';
import { BookMarked, Search, Plus, X, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react';
import ToastModal from '../../components/ToastModal';

export default function AdminCurricula() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      setCourses(snap.docs.map(d => d.data() as Course));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseCode: string) => {
    if (!window.confirm(`Are you sure you want to delete course ${courseCode}?`)) return;
    try {
      await deleteDoc(doc(db, 'courses', courseCode));
      setCourses(courses.filter(c => c.courseCode !== courseCode));
      setToast({ isOpen: true, type: 'success', message: `Course ${courseCode} deleted.` });
    } catch (err) {
      setToast({ isOpen: true, type: 'error', message: 'Failed to delete course.' });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  const filteredCourses = courses.filter(c => 
    c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curricula & Course Management</h1>
          <p className="text-gray-500 mt-1 text-sm">View, upload course files (CSV/JSON), and manage Computer Science courses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center bg-vom-green hover:bg-vom-green-light text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload / Add Courses
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <BookMarked className="w-5 h-5 mr-2 text-vom-gold" /> All Departmental Courses
          </h2>
          <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by code or title..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vom-green w-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {filteredCourses.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">No courses found matching your query.</div>
          ) : (
            filteredCourses.map(course => (
              <div key={course.courseCode} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-vom-green bg-emerald-50 px-2 py-0.5 rounded">
                      {course.courseCode}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1">{course.title}</h3>
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {course.creditUnits} Units
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between pt-1">
                  <span>{course.level} • Semester {course.semester}</span>
                  <span>{course.department}</span>
                </div>
                {course.prerequisites.length > 0 && (
                  <div className="flex items-center space-x-1 pt-1">
                    <span className="text-[11px] text-gray-400 font-medium">Prereqs:</span>
                    <div className="flex gap-1 flex-wrap">
                      {course.prerequisites.map(p => (
                        <span key={p} className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Units</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Dept</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Level & Sem</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Prerequisites</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No courses found.</td></tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course.courseCode} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-vom-green">{course.courseCode}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">{course.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.creditUnits} Units</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.department}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.level} • Semester {course.semester}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {course.prerequisites.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {course.prerequisites.map(p => (
                            <span key={p} className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-medium text-gray-600">{p}</span>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-right space-x-2">
                      <button onClick={() => setEditingCourse(course)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit Course">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteCourse(course.courseCode)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Course">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourseModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchCourses(); }}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <EditCourseModal 
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => { setEditingCourse(null); fetchCourses(); setToast({ isOpen: true, type: 'success', message: 'Course updated successfully.' }); }}
        />
      )}

      <ToastModal
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// ── Edit Course Modal Component ───────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSuccess }: { course: Course; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    courseCode: course.courseCode,
    title: course.title,
    creditUnits: course.creditUnits,
    department: course.department,
    level: course.level,
    semester: course.semester,
    prerequisitesRaw: course.prerequisites.join(', '),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditUnits' || name === 'semester' ? Number(value) : value
    }));
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) { setError('Course title is required.'); return; }

    setLoading(true);
    try {
      const prereqs = formData.prerequisitesRaw
        ? formData.prerequisitesRaw.split(',').map(p => p.trim().toUpperCase()).filter(Boolean)
        : [];

      const updatedCourse: Course = {
        courseCode: course.courseCode,
        title: formData.title.trim(),
        creditUnits: formData.creditUnits,
        department: formData.department,
        level: formData.level,
        semester: formData.semester,
        prerequisites: prereqs,
      };

      await setDoc(doc(db, 'courses', course.courseCode), updatedCourse);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to edit course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Edit Course: {course.courseCode}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Course Code</label>
                <input type="text" value={formData.courseCode} disabled className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Credit Units</label>
                <input type="number" name="creditUnits" required min={1} max={6} value={formData.creditUnits} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Course Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Target Level</label>
                <select name="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white">
                  <option value="ND 1">ND 1</option>
                  <option value="ND 2">ND 2</option>
                  <option value="HND 1">HND 1</option>
                  <option value="HND 2">HND 2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white">
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Prerequisites (Optional)</label>
              <input type="text" name="prerequisitesRaw" placeholder="Comma separated course codes" value={formData.prerequisitesRaw} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-vom-green hover:bg-vom-green-light text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Add / Upload Course Modal Component ─────────────────────────────────────────
function AddCourseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<'single' | 'file'>('single');
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    creditUnits: 3,
    department: 'Computer Science',
    level: 'ND 1',
    semester: 1,
    prerequisitesRaw: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditUnits' || name === 'semester' ? Number(value) : value
    }));
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.courseCode.trim()) { setError('Course code is required.'); return; }
    if (!formData.title.trim()) { setError('Course title is required.'); return; }

    setLoading(true);
    try {
      const formattedCode = formData.courseCode.trim().toUpperCase();
      const prereqs = formData.prerequisitesRaw
        ? formData.prerequisitesRaw.split(',').map(p => p.trim().toUpperCase()).filter(Boolean)
        : [];

      const newCourse: Course = {
        courseCode: formattedCode,
        title: formData.title.trim(),
        creditUnits: formData.creditUnits,
        department: formData.department,
        level: formData.level,
        semester: formData.semester,
        prerequisites: prereqs,
      };

      await setDoc(doc(db, 'courses', formattedCode), newCourse);
      setUploadedCount(1);
      setDone(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add course.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a CSV or JSON document to upload.');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          let parsedCourses: Course[] = [];

          if (file.name.endsWith('.json')) {
            const json = JSON.parse(text);
            parsedCourses = Array.isArray(json) ? json : [json];
          } else {
            // CSV parsing
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            // Skip header if present
            const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;
            
            for (let i = startIndex; i < lines.length; i++) {
              const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
              if (parts.length >= 2) {
                parsedCourses.push({
                  courseCode: parts[0].toUpperCase(),
                  title: parts[1],
                  creditUnits: Number(parts[2]) || 3,
                  department: parts[3] || 'Computer Science',
                  level: parts[4] || 'ND 1',
                  semester: Number(parts[5]) || 1,
                  prerequisites: parts[6] ? parts[6].split(';').map(p => p.trim().toUpperCase()).filter(Boolean) : [],
                });
              }
            }
          }

          if (parsedCourses.length === 0) {
            throw new Error('No valid courses found in document.');
          }

          const batch = writeBatch(db);
          parsedCourses.forEach(c => {
            const courseRef = doc(db, 'courses', c.courseCode);
            batch.set(courseRef, c);
          });

          await batch.commit();
          setUploadedCount(parsedCourses.length);
          setDone(true);
          setTimeout(onSuccess, 1500);
        } catch (err: any) {
          setError(err.message || 'Failed to parse file. Make sure file format matches CSV or JSON.');
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setError(err.message || 'Error reading file.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Upload Departmental Courses</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!done && (
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'single' ? 'border-vom-green text-vom-green bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Single Entry Form
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'file' ? 'border-vom-green text-vom-green bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Document Upload (CSV/JSON)
            </button>
          </div>
        )}

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-vom-green" />
              </div>
              <p className="font-semibold text-gray-900">{uploadedCount} Course(s) Uploaded Successfully!</p>
              <p className="text-sm text-gray-500 mt-1">Curriculum database updated for Computer Science.</p>
            </div>
          ) : activeTab === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Course Code</label>
                  <input 
                    type="text" 
                    name="courseCode" 
                    required 
                    placeholder="e.g. COS101" 
                    value={formData.courseCode} 
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Credit Units</label>
                  <input 
                    type="number" 
                    name="creditUnits" 
                    required 
                    min={1} 
                    max={6} 
                    value={formData.creditUnits} 
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Course Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g. Object-Oriented Programming II" 
                  value={formData.title} 
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Target Level</label>
                  <select 
                    name="level" 
                    value={formData.level} 
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white"
                  >
                    <option value="ND 1">ND 1</option>
                    <option value="ND 2">ND 2</option>
                    <option value="HND 1">HND 1</option>
                    <option value="HND 2">HND 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Semester</label>
                  <select 
                    name="semester" 
                    value={formData.semester} 
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Prerequisites (Optional)</label>
                <input 
                  type="text" 
                  name="prerequisitesRaw" 
                  placeholder="Comma separated course codes, e.g. COS101, COS104" 
                  value={formData.prerequisitesRaw} 
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-vom-green outline-none" 
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-vom-green hover:bg-vom-green-light text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Save Course'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-vom-green transition-colors bg-gray-50">
                <Upload className="w-10 h-10 text-vom-green mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">Select CSV or JSON Document</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Supported formats: .csv, .json</p>
                
                <input 
                  type="file" 
                  accept=".csv,.json"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-vom-green file:text-white hover:file:bg-vom-green-light cursor-pointer"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center"><FileText className="w-3.5 h-3.5 mr-1" /> Expected CSV Format:</p>
                <code className="block bg-white/80 p-1.5 rounded font-mono text-[11px] text-gray-700">
                  CourseCode, Title, CreditUnits, Department, Level, Semester, Prerequisites<br/>
                  COS301, Web Tech II, 3, Computer Science, ND 2, 2, COS203
                </code>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-vom-green hover:bg-vom-green-light text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Batch Uploading...' : 'Upload File Courses'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
