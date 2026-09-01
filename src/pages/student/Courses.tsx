import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BookOpen, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function StudentCourses() {
  const { userData } = useAuthStore();
  const { enrollments, courses, loading, fetchStudentData } = useDataStore();

  useEffect(() => {
    if (userData?.uid && userData?.program) {
      fetchStudentData(userData.uid, userData.program);
    }
  }, [userData]);

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
        <p className="text-gray-500 mt-1 text-sm">Complete history of your course enrollments, credit units, and grades.</p>
      </div>

      {/* Mobile View: Cards */}
      <div className="block sm:hidden space-y-4">
        {enrollments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No course enrollment history found.</p>
          </div>
        ) : (
          enrollments.map((enrollment) => {
            const course = courses.find(c => c.courseCode === enrollment.courseCode);
            return (
              <div key={enrollment.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-vom-green bg-emerald-50 px-2 py-0.5 rounded">
                      {enrollment.courseCode}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-1">{course?.title || 'Course Details'}</h3>
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400">Semester</p>
                    <p className="font-bold text-gray-800">Sem {enrollment.semester}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400">Credits</p>
                    <p className="font-bold text-gray-800">{course?.creditUnits || '-'} Units</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400">Grade</p>
                    <p className="font-bold text-gray-900">{enrollment.grade || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })
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
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No course history found.</td>
                </tr>
              ) : (
                enrollments.map((enrollment) => {
                  const course = courses.find(c => c.courseCode === enrollment.courseCode);
                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold text-vom-green">{enrollment.courseCode}</td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{course?.title || 'Unknown Course'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">Semester {enrollment.semester}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{course?.creditUnits || '-'} Units</td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{enrollment.grade || '-'}</td>
                      <td className="py-4 px-6 text-sm">
                        {getStatusBadge(enrollment.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
