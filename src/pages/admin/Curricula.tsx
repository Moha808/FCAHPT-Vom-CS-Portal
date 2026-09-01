import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Course } from '../../types';
import { BookMarked, Search } from 'lucide-react';

export default function AdminCurricula() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
    fetchCourses();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  const filteredCourses = courses.filter(c => 
    c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curricula Management</h1>
          <p className="text-gray-500 mt-1 text-sm">View and manage Computer Science department courses & prerequisites.</p>
        </div>
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
                  <span>{course.level} • S{course.semester}</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No courses found.</td></tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course.courseCode} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-vom-green">{course.courseCode}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">{course.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.creditUnits}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.department}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{course.level} • S{course.semester}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
