import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, writeBatch, addDoc } from 'firebase/firestore';
import { UserData, Enrollment, Course } from '../../types';
import { calculateCGPA } from '../../lib/academicLogic';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, AlertTriangle, ChevronRight, X, User, BookOpen, FileText, Save, CheckCircle } from 'lucide-react';
import ToastModal from '../../components/ToastModal';

import { ALL_COURSES } from '../../lib/defaultCourses';

export default function AdvisorStudents() {
  const { userData } = useAuthStore();
  const [students, setStudents] = useState<(UserData & { cgpa: string, carryovers: number })[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<(UserData & { cgpa: string, carryovers: number }) | null>(null);

  useEffect(() => {
    fetchStudentsAndData();
  }, [userData]);

  const fetchStudentsAndData = async () => {
    try {
      if (!userData?.department) return;

      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'student'),
        where('department', '==', userData.department)
      );
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
        <h1 className="text-2xl font-bold text-gray-900">My Advisees</h1>
        <p className="text-gray-500 mt-1 text-sm">Full roster of your assigned advisees. Click any student to grade courses & save advisor guidance.</p>
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
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-vom-green/10 text-vom-green font-bold text-xs flex items-center justify-center mr-3">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono">{student.matricNumber || '—'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {student.program}<br/>
                        <span className="text-xs font-semibold text-vom-green">{student.level}</span>
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
                        <button className="text-gray-400 group-hover:text-vom-green p-2 rounded-lg group-hover:bg-white transition-colors">
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal 
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

// ── Student Detail & Grading Modal Component ───────────────────────────────────
function StudentDetailModal({ 
  student, 
  studentEnrollments, 
  courses, 
  onClose,
  onRefreshData
}: { 
  student: UserData & { cgpa: string, carryovers: number };
  studentEnrollments: Enrollment[];
  courses: Course[];
  onClose: () => void;
  onRefreshData: () => void;
}) {
  const { userData } = useAuthStore();
  const [noteText, setNoteText] = useState('');
  const [savingData, setSavingData] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
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

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const q = query(
          collection(db, 'advisorNotes'),
          where('studentId', '==', student.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setNoteText(snap.docs[0].data().note || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNote();
  }, [student.uid]);

  const handleGradeChange = (courseCode: string, field: 'grade' | 'status', value: string) => {
    setGradeState(prev => {
      const current = prev[courseCode] || { grade: '-', status: 'in_progress' };
      let newGrade = current.grade;
      let newStatus = current.status;

      if (field === 'grade') {
        newGrade = value;
        if (value === 'A' || value === 'B' || value === 'C' || value === 'D' || value === 'E') {
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
    setSavedSuccess(false);

    try {
      // 1. Save Advisor Note
      const noteDocRef = doc(db, 'advisorNotes', `${userData?.uid}_${student.uid}`);
      await setDoc(noteDocRef, {
        advisorId: userData?.uid,
        advisorName: userData?.name,
        studentId: student.uid,
        studentName: student.name,
        note: noteText,
        updatedAt: new Date().toISOString(),
      });

      // 2. Save / Update Course Grades in enrollments collection
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
          gradedBy: userData?.name || 'Advisor',
          gradedAt: new Date().toISOString(),
        });
      });

      await batch.commit();

      // 3. Send announcement notification to the student
      try {
        await addDoc(collection(db, 'announcements'), {
          title: `Grades & Evaluation Updated`,
          content: `Your academic advisor ${userData?.name || 'Advisor'} has updated your semester course evaluation and advisor guidance. Check your portal to view your grades.`,
          postedBy: userData?.name || 'Academic Advisor',
          audience: student.department || 'Computer Science',
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error sending announcement:', err);
      }

      setSavedSuccess(true);
      setToast({
        isOpen: true,
        type: 'success',
        message: `Successfully saved grades and sent evaluation to ${student.name}!`
      });

      onRefreshData();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save advisor updates:', err);
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
        <div className="bg-gradient-to-r from-vom-green to-emerald-800 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
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
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Registered Modules</p>
              <p className="text-2xl font-black text-vom-green mt-1">{activeCourseList.length}</p>
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
                <BookOpen className="w-5 h-5 text-vom-green mr-2" /> Official Course Registration & Grade Entry
              </h3>
              <span className="text-xs text-gray-400 font-semibold">Select grades below to evaluate student</span>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold text-xs border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Semester</th>
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
                      <tr key={c.courseCode} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold text-vom-green">{c.courseCode}</td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{c.title}</td>
                        <td className="py-3 px-4 text-gray-500">Sem {c.semester}</td>
                        <td className="py-3 px-4 text-gray-500">{c.creditUnits} Units</td>
                        
                        {/* Grade Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={currentGrade}
                            onChange={(e) => handleGradeChange(c.courseCode, 'grade', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-vom-green outline-none bg-white"
                          >
                            <option value="-">- (Awaiting Grade)</option>
                            <option value="A">A (5.0 - Excellent)</option>
                            <option value="B">B (4.0 - Very Good)</option>
                            <option value="C">C (3.0 - Good)</option>
                            <option value="D">D (2.0 - Pass)</option>
                            <option value="E">E (1.0 - Pass)</option>
                            <option value="F">F (0.0 - Fail)</option>
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
                            <option value="failed">Carryover (Failed)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advisor Notes Section */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <FileText className="w-4 h-4 text-vom-green mr-2" /> Advisor Guidance & Recommendations
              </h3>
              {savedSuccess && (
                <span className="text-xs font-bold text-green-700 flex items-center bg-green-100 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> All Grades & Notes Saved Live!
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write advisement notes, academic warning details, or approval comments for this student..."
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-vom-green focus:border-transparent outline-none bg-white"
            />
          </div>

          {/* Submit Button Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingData}
              className="flex items-center px-6 py-2.5 bg-vom-green hover:bg-vom-green-light text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-vom-green/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingData ? 'Saving Student Evaluation...' : 'Save Grades & Send to Student'}
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
