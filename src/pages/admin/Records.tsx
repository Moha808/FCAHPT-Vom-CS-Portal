import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, addDoc } from 'firebase/firestore';
import { UserData, Enrollment, Course } from '../../types';
import { calculateCGPA, getCGPACategory } from '../../lib/academicLogic';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, AlertTriangle, ChevronRight, X, User, BookOpen, Save } from 'lucide-react';
import ToastModal from '../../components/ToastModal';

import { ALL_COURSES } from '../../lib/defaultCourses';

export default function AdminRecords() {
  const [students, setStudents] = useState<(UserData & { cgpa: string, cgpaCategory: string, carryovers: number })[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<(UserData & { cgpa: string, cgpaCategory: string, carryovers: number }) | null>(null);

  useEffect(() => {
    fetchStudentsAndData();
  }, []);

  const fetchStudentsAndData = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      const studentData = snap.docs.map(doc => doc.data() as UserData);

      const enrollmentsSnap = await getDocs(collection(db, 'enrollments'));
      const allEnrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      setEnrollments(allEnrollments);
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnap.docs.length > 0 ? coursesSnap.docs.map(doc => doc.data() as Course) : ALL_COURSES;
      setCourses(allCourses);

      const enrichedStudents = studentData.map(student => {
        const studentEnrollments = allEnrollments.filter(e => e.studentId === student.uid);
        const cgpa = calculateCGPA(studentEnrollments, allCourses);
        const cgpaCategory = getCGPACategory(cgpa);
        const carryovers = studentEnrollments.filter(e => e.status === 'failed').length;
        return { ...student, cgpa, cgpaCategory, carryovers };
      });
      setStudents(enrichedStudents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-gold"></div></div>;

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Records</h1>
        <p className="text-gray-500 mt-1 text-sm">Full roster of all students. Click any student to manage their academic records and course grades.</p>
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
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vom-gold w-full"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Matric No</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Program / Level</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No students found.</td></tr>
              ) : (
                filteredStudents.map(student => {
                  const isAtRisk = parseFloat(student.cgpa) < 2.0 || student.carryovers >= 2;
                  return (
                    <tr 
                      key={student.uid} 
                      onClick={() => setSelectedStudent(student)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-vom-gold/20 text-vom-gold font-bold text-xs flex items-center justify-center mr-3">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono">{student.matricNumber || '—'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {student.program}<br/>
                        <span className="text-xs font-semibold text-vom-gold">{student.level}</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{student.cgpa}</td>
                      <td className="py-4 px-6 text-sm">
                        {isAtRisk ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 inline-flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> At-Risk
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Good Standing
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <button className="text-gray-400 group-hover:text-vom-gold p-2 rounded-lg group-hover:bg-white transition-colors">
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

      {/* Admin Grade Management Modal */}
      {selectedStudent && (
        <GradeManagementModal 
          student={selectedStudent} 
          studentEnrollments={enrollments.filter(e => e.studentId === selectedStudent.uid)}
          courses={courses.length > 0 ? courses : ALL_COURSES}
          onClose={() => setSelectedStudent(null)} 
          onRefreshData={fetchStudentsAndData}
        />
      )}
    </div>
  );
}

// ── Admin Grading Modal Component ───────────────────────────────────
function GradeManagementModal({ 
  student, 
  studentEnrollments, 
  courses, 
  onClose,
  onRefreshData
}: { 
  student: UserData & { cgpa: string, cgpaCategory: string, carryovers: number };
  studentEnrollments: Enrollment[];
  courses: Course[];
  onClose: () => void;
  onRefreshData: () => void;
}) {
  const { userData } = useAuthStore();
  const [savingData, setSavingData] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  // Compute active course list for student
  const studentLevel = student.level || 'ND 1';
  const targetLevel = studentLevel.includes('2') ? 'ND 2' : 'ND 1';
  const levelCourses = courses.filter(c => c.level === targetLevel || (targetLevel === 'ND 2' && c.level === 'ND 1'));
  const activeCourseList = levelCourses.length > 0 ? levelCourses : courses.filter(c => c.level === 'ND 1');

  // Local state for editing grades
  const [gradeState, setGradeState] = useState<Record<string, { grade: string; status: 'passed' | 'failed' | 'pending' | 'in_progress' }>>(() => {
    const initialMap: Record<string, { grade: string; status: 'passed' | 'failed' | 'pending' | 'in_progress' }> = {};
    
    activeCourseList.forEach(c => {
      const existing = studentEnrollments.find(e => e.courseCode === c.courseCode);
      initialMap[c.courseCode] = {
        grade: existing?.grade || '-',
        status: existing?.status || 'in_progress',
      };
    });
    return initialMap;
  });

  const handleGradeChange = (courseCode: string, field: 'grade' | 'status', value: string) => {
    setGradeState(prev => {
      const current = prev[courseCode] || { grade: '-', status: 'in_progress' };
      let newGrade = current.grade;
      let newStatus = current.status;

      if (field === 'grade') {
        newGrade = value;
        if (value === 'A' || value === 'B' || value === 'C' || value === 'D') {
          newStatus = 'passed';
        } else if (value === 'F') {
          newStatus = 'failed';
        } else {
          newStatus = 'in_progress';
        }
      } else if (field === 'status') {
        newStatus = value as any;
        if (value === 'in_progress') newGrade = '-';
      }

      return {
        ...prev,
        [courseCode]: { grade: newGrade, status: newStatus }
      };
    });
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingData(true);

    try {
      const batch = writeBatch(db);
      activeCourseList.forEach(course => {
        const state = gradeState[course.courseCode] || { grade: '-', status: 'in_progress' };
        const enrollmentDocId = `${student.uid}_${course.courseCode}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentDocId);

        batch.set(enrollmentRef, {
          studentId: student.uid,
          courseCode: course.courseCode,
          semester: course.semester,
          grade: state.grade === '-' ? null : state.grade,
          status: state.status,
          gradedBy: userData?.name || 'Administrator',
          gradedAt: new Date().toISOString(),
        });
      });

      // Also calculate new CGPA based on this state
      const mockUpdatedEnrollments = activeCourseList.map(c => ({
        courseCode: c.courseCode,
        grade: gradeState[c.courseCode]?.grade === '-' ? null : gradeState[c.courseCode]?.grade,
        status: gradeState[c.courseCode]?.status
      })) as any[];
      const newCgpa = calculateCGPA(mockUpdatedEnrollments, activeCourseList);
      const newCategory = getCGPACategory(newCgpa);

      // Save CGPA to User document
      const userRef = doc(db, 'users', student.uid);
      batch.update(userRef, {
        cgpa: newCgpa,
        cgpaCategory: newCategory,
        carryovers: mockUpdatedEnrollments.filter(e => e.status === 'failed').length
      });

      await batch.commit();

      // Send a TARGETED private notification to this specific student only
      // This goes into a 'notifications' collection scoped to the student's UID
      try {
        await addDoc(collection(db, 'notifications'), {
          title: `Grades & Evaluation Updated`,
          content: `Your official academic records and grades have been reviewed and updated by the administration. Please log in to view your updated results.`,
          postedBy: userData?.name || 'Academic Administrator',
          recipientId: student.uid,        // ← only this student receives it
          recipientName: student.name,
          type: 'grade_update',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error sending student notification:', err);
      }

      setToast({
        isOpen: true,
        type: 'success',
        message: `Successfully saved grades for ${student.name}!`
      });

      onRefreshData();
    } catch (err: any) {
      console.error('Failed to save grades:', err);
      setToast({
        isOpen: true,
        type: 'error',
        message: `Failed to save grades: ${err.message || 'Check database permissions.'}`
      });
    } finally {
      setSavingData(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-vom-gold/20 flex items-center justify-center text-vom-gold font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-vom-gold">{student.name}</h2>
              <p className="text-xs text-white/80">{student.matricNumber || 'Matric Pending'} • {student.program} ({student.level})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveAll} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Calculated CGPA</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{student.cgpa}</p>
              <p className="text-xs font-bold text-vom-gold mt-1">{student.cgpaCategory}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Registered Modules</p>
              <p className="text-2xl font-black text-vom-gold mt-1">{activeCourseList.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Carryovers</p>
              <p className={`text-2xl font-black mt-1 ${student.carryovers > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {student.carryovers}
              </p>
            </div>
          </div>

          {/* Enrolled Courses & Grading Table */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center">
                <BookOpen className="w-5 h-5 text-gray-700 mr-2" /> Official Course Grades
              </h3>
              <span className="text-xs text-gray-400 font-semibold">Admin Edit Mode</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 font-semibold text-xs border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Sem</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Assign Grade</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeCourseList.map(c => {
                    const currentGrade = gradeState[c.courseCode]?.grade || '-';
                    const currentStatus = gradeState[c.courseCode]?.status || 'in_progress';
                    return (
                      <tr key={c.courseCode} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-700">{c.courseCode}</td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{c.title}</td>
                        <td className="py-3 px-4 text-gray-500">{c.semester}</td>
                        <td className="py-3 px-4 text-gray-500">{c.creditUnits}</td>
                        
                        {/* Grade Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={currentGrade}
                            onChange={(e) => handleGradeChange(c.courseCode, 'grade', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                          >
                            <option value="-">- (Pending)</option>
                            <option value="A">A (4.0)</option>
                            <option value="B">B (3.0)</option>
                            <option value="C">C (2.0)</option>
                            <option value="D">D (1.0)</option>
                            <option value="F">F (0.0)</option>
                          </select>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleGradeChange(c.courseCode, 'status', e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold outline-none border ${
                              currentStatus === 'passed' ? 'bg-green-50 text-green-700 border-green-200' :
                              currentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="in_progress">In Progress</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Carryover</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button Bar */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={savingData}
              className="flex items-center px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingData ? 'Saving Grades...' : 'Save Academic Records'}
            </button>
          </div>

        </form>

        {/* Toast Modal Popup */}
        <ToastModal
          isOpen={toast.isOpen}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    </div>
  );
}
