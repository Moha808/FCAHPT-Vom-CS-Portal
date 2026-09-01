import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserData, Enrollment, Course } from '../../types';
import { calculateCGPA } from '../../lib/academicLogic';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, AlertTriangle, ChevronRight } from 'lucide-react';


export default function AdvisorStudents() {
  const { userData } = useAuthStore();
  const [students, setStudents] = useState<(UserData & { cgpa: string, carryovers: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudentsAndData();
  }, [userData]);

  const fetchStudentsAndData = async () => {
    try {
      if (!userData?.department) return; // Wait until userData is available

      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'student'),
        where('department', '==', userData.department)
      );
      const snap = await getDocs(q);
      const studentData = snap.docs.map(doc => doc.data() as UserData);

      const enrollmentsSnap = await getDocs(collection(db, 'enrollments'));
      const allEnrollments = enrollmentsSnap.docs.map(doc => doc.data() as Enrollment);
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnap.docs.map(doc => doc.data() as Course);

      const enrichedStudents = studentData.map(student => {
        const studentEnrollments = allEnrollments.filter(e => e.studentId === student.uid);
        const cgpa = calculateCGPA(studentEnrollments, allCourses);
        const carryovers = studentEnrollments.filter(e => e.status === 'failed').length;
        return { ...student, cgpa, carryovers };
      });
      setStudents(enrichedStudents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 mt-1 text-sm">Full roster of your assigned advisees.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Student Roster</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vom-green w-full"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Program / Level</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Carryovers</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No students found.</td></tr>
              ) : (
                filteredStudents.map(student => {
                  const isAtRisk = parseFloat(student.cgpa) < 2.0 || student.carryovers >= 2;
                  return (
                    <tr key={student.uid} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{student.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {student.program}<br/>
                        <span className="text-xs text-gray-400">{student.level}</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">{student.cgpa}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{student.carryovers}</td>
                      <td className="py-4 px-6 text-sm">
                        {isAtRisk ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center w-max">
                            <AlertTriangle className="w-3 h-3 mr-1" /> At-Risk
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            On Track
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <button className="text-gray-400 hover:text-vom-green p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
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
