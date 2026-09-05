import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { getDefaultCourses } from '../../lib/defaultCourses';
import { BookOpen, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function StudentCourses() {
  const { userData } = useAuthStore();
  const { enrollments, courses, loading, fetchStudentData } = useDataStore();

  useEffect(() => {
    if (userData?.uid && userData?.program) {
      fetchStudentData(userData.uid, userData.program, userData.level || 'ND 1');
    }
  }, [userData]);

  const displayCourses = useMemo(() => {
    // 1. If explicit enrollments exist in Firestore for this student, display them
    if (enrollments.length > 0) {
      const activeCourseList = courses.length > 0 ? courses : getDefaultCourses(userData?.program || '', userData?.level || '');
      return enrollments.map(e => {
        const course = activeCourseList.find(c => c.courseCode === e.courseCode);
        return {
          id: e.id || e.courseCode,
          courseCode: e.courseCode,
          title: course?.title || 'Computer Science Module',
          semester: e.semester || course?.semester || 1,
          creditUnits: course?.creditUnits || 3,
          grade: e.grade || '-',
          status: e.status || 'in_progress',
        };
      });
    }

    // 2. Fallback: If no enrollments exist in Firestore, derive courses from active/default curriculum
    const activeCourseList = courses.length > 0 ? courses : getDefaultCourses(userData?.program || '', userData?.level || '');
    const rawLevel = (userData?.level || 'ND 1').trim();
    
    // Normalize level string (e.g. "ND 1", "HND 1", "Level 1")
    const targetLevel = rawLevel.includes('2') ? 'ND 2' : 'ND 1';

    const matchingCourses = activeCourseList.filter(c => {
      const cLevel = c.level.trim();
      return cLevel === targetLevel || (targetLevel === 'ND 2' && cLevel === 'ND 1');
    });

    // If still empty (e.g. strict filter mismatch), return all ND 1 default courses
    const finalCourses = matchingCourses.length > 0 
      ? matchingCourses 
      : getDefaultCourses(userData?.program || '', 'ND 1');

    return finalCourses.map(c => {
      return {
        id: c.courseCode,
        courseCode: c.courseCode,
        title: c.title,
        semester: c.semester,
        creditUnits: c.creditUnits,
        grade: '-',
        status: 'in_progress',
      };
    });
  }, [enrollments, courses, userData]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Passed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Carryover
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> In Progress
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses & Academic Record</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Registered courses and progress for <span className="font-bold text-vom-green">{userData?.program || 'Computer Science'} ({userData?.level || 'ND 1'})</span>.
        </p>
      </div>

      {/* Mobile View: Cards */}
      <div className="block sm:hidden space-y-4">
        {displayCourses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No departmental courses found.</p>
          </div>
        ) : (
          displayCourses.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-vom-green bg-emerald-50 px-2 py-0.5 rounded">
                    {item.courseCode}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-1">{item.title}</h3>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100 text-xs">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-400">Semester</p>
                  <p className="font-bold text-gray-800">Sem {item.semester}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-400">Credits</p>
                  <p className="font-bold text-gray-800">{item.creditUnits} Units</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-400">Grade</p>
                  <p className="font-bold text-gray-900">{item.grade}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Full Table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Code</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No departmental courses found.</td>
                </tr>
              ) : (
                displayCourses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-vom-green">{item.courseCode}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">Semester {item.semester}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.creditUnits} Units</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{item.grade}</td>
                    <td className="py-4 px-6 text-sm">
                      {getStatusBadge(item.status)}
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
