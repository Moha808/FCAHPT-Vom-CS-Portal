import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { calculateCGPA, getCGPACategory } from '../../lib/academicLogic';
import { getDefaultCourses } from '../../lib/defaultCourses';
import { BookMarked, History } from 'lucide-react';

export default function StudentHistory() {
  const { userData } = useAuthStore();
  const { enrollments, courses, loading, fetchStudentData } = useDataStore();

  useEffect(() => {
    if (userData?.uid && userData?.program) {
      fetchStudentData(userData.uid, userData.program, userData.level || 'ND 1');
    }
  }, [userData]);

  const activeCourses = useMemo(() => {
    return courses.length > 0 
      ? courses 
      : getDefaultCourses(userData?.program || '', userData?.level || '');
  }, [courses, userData]);

  // Group enrollments by Level and Semester
  const historyData = useMemo(() => {
    if (!enrollments.length) return [];

    const grouped: Record<string, any[]> = {};
    
    enrollments.forEach(enc => {
      const course = activeCourses.find(c => c.courseCode === enc.courseCode);
      if (course) {
        const groupKey = `${course.level} - Semester ${course.semester}`;
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push({ ...enc, course });
      }
    });

    // Compute stats for each group
    return Object.entries(grouped).map(([term, termCourses]) => {
      const termCgpa = calculateCGPA(termCourses, activeCourses);
      const category = getCGPACategory(termCgpa);
      const passed = termCourses.filter(c => c.status === 'passed').length;
      const failed = termCourses.filter(c => c.status === 'failed').length;
      
      return {
        term,
        courses: termCourses,
        cgpa: termCgpa,
        category,
        passed,
        failed,
      };
    }).sort((a, b) => a.term.localeCompare(b.term)); // basic alphabetical sort for terms

  }, [enrollments, activeCourses]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <History className="w-6 h-6 mr-3 text-vom-green" /> Academic History
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Comprehensive view of your past and present academic terms.</p>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No History Available</h3>
          <p className="text-gray-500 mt-1">You do not have any graded semesters on record yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {historyData.map((termData, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{termData.term}</h2>
                  <p className="text-sm text-gray-500">
                    {termData.passed} Passed • {termData.failed} Carryovers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-vom-green">{termData.cgpa}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase">{termData.category}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-gray-500 font-semibold text-xs border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-6">Course Code</th>
                      <th className="py-3 px-6">Title</th>
                      <th className="py-3 px-6 text-center">Credits</th>
                      <th className="py-3 px-6 text-center">Grade</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {termData.courses.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-6 font-bold text-gray-700">{item.course.courseCode}</td>
                        <td className="py-3 px-6 text-gray-600 font-medium">{item.course.title}</td>
                        <td className="py-3 px-6 text-gray-500 text-center">{item.course.creditUnits}</td>
                        <td className="py-3 px-6 font-bold text-center">{item.grade || '-'}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.status === 'passed' ? 'bg-green-100 text-green-700' :
                            item.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status === 'in_progress' ? 'Pending' : item.status === 'passed' ? 'Passed' : 'Carryover'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
