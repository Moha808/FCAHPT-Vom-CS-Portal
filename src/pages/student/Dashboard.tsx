import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { calculateCGPA, getDegreeAudit, getCourseRecommendations } from '../../lib/academicLogic';
import {
  Award, GraduationCap, CheckCircle2, Clock, AlertTriangle, BookOpen, ChevronRight, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Course, Enrollment } from '../../types';

// Default Computer Science curriculum fallback
const DEFAULT_CS_COURSES: Course[] = [
  { courseCode: 'COS101', title: 'Introduction to Computing', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'MTH101', title: 'Mathematics I', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'COS102', title: 'Computer Hardware Principles', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'COS103', title: 'Office Productivity Packages', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'COM101', title: 'Communication Skills I', creditUnits: 2, department: 'General Studies', level: 'ND 1', semester: 1, prerequisites: [] },

  { courseCode: 'COS104', title: 'Introduction to Programming (Python)', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS101'] },
  { courseCode: 'MTH102', title: 'Mathematics II', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['MTH101'] },
  { courseCode: 'COS105', title: 'Operating Systems I', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS102'] },
  { courseCode: 'COS106', title: 'Data & Information Processing', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS101'] },
  { courseCode: 'COM102', title: 'Communication Skills II', creditUnits: 2, department: 'General Studies', level: 'ND 1', semester: 2, prerequisites: ['COM101'] },

  { courseCode: 'COS201', title: 'Data Structures & Algorithms', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
  { courseCode: 'COS202', title: 'Database Management Systems', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS106'] },
  { courseCode: 'COS203', title: 'Web Technology I (HTML/CSS/JS)', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
  { courseCode: 'COS204', title: 'Object-Oriented Programming (Java)', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
  { courseCode: 'COS205', title: 'Computer Networks & Internet Technology', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS105'] },
];

export default function StudentDashboard() {
  const { userData } = useAuthStore();
  const { enrollments, courses, curriculum, loading, fetchStudentData } = useDataStore();

  useEffect(() => {
    if (userData?.uid && userData?.program) {
      fetchStudentData(userData.uid, userData.program, userData.level || 'ND 1');
    }
  }, [userData]);

  const activeCourses = useMemo(() => {
    return courses.length > 0 ? courses : DEFAULT_CS_COURSES;
  }, [courses]);

  // Unified enrollments array used for calculations
  const activeEnrollments = useMemo<Enrollment[]>(() => {
    if (enrollments.length > 0) return enrollments;

    const rawLevel = (userData?.level || 'ND 1').trim();
    const targetLevel = rawLevel.includes('2') ? 'ND 2' : 'ND 1';

    const levelCourses = activeCourses.filter(c => 
      c.level === targetLevel || (targetLevel === 'ND 2' && c.level === 'ND 1')
    );

    const finalCourses = levelCourses.length > 0 ? levelCourses : activeCourses.filter(c => c.level === 'ND 1');

    return finalCourses.map(c => ({
      studentId: userData?.uid || 'temp',
      courseCode: c.courseCode,
      semester: c.semester,
      session: '2025/2026',
      grade: null,
      status: 'pending',
    }));
  }, [enrollments, activeCourses, userData]);

  const cgpa = useMemo(() => calculateCGPA(activeEnrollments, activeCourses), [activeEnrollments, activeCourses]);
  const audit = useMemo(() => getDegreeAudit(activeEnrollments, curriculum, activeCourses), [activeEnrollments, curriculum, activeCourses]);
  const recommendations = useMemo(() => {
    if (!userData?.level) return [];
    return getCourseRecommendations(activeEnrollments, curriculum, activeCourses, userData.level);
  }, [activeEnrollments, curriculum, activeCourses, userData]);

  const passedCount  = activeEnrollments.filter(e => e.status === 'passed').length;
  const failedCount  = activeEnrollments.filter(e => e.status === 'failed').length;
  const pendingCount = activeEnrollments.filter(e => e.status === 'pending' || e.status === 'in_progress').length;
  const isAtRisk     = parseFloat(cgpa) < 2.0 && passedCount > 0;

  const cgpaTrend = [
    { semester: 'Sem 1', cgpa: 0 },
    { semester: 'Sem 2', cgpa: 0 },
    { semester: 'Current', cgpa: parseFloat(cgpa) },
  ];

  const courseStats = [
    { name: 'Passed',  value: passedCount,  fill: '#006400' },
    { name: 'Failed',  value: failedCount,  fill: '#ef4444' },
    { name: 'Pending', value: pendingCount, fill: '#f59e0b' },
  ];

  const cgpaLabel =
    parseFloat(cgpa) >= 3.5 ? 'Distinction' :
    parseFloat(cgpa) >= 3.0 ? 'Upper Credit' :
    parseFloat(cgpa) >= 2.5 ? 'Lower Credit' :
    parseFloat(cgpa) >= 2.0 ? 'Pass' : 'Awaiting Grading';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-vom-green"></div>
        <p className="text-sm text-gray-500">Loading your academic records…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userData?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {userData?.program} &nbsp;•&nbsp; {userData?.level} &nbsp;•&nbsp; Dept. of Computer Science
          </p>
        </div>
        {isAtRisk && (
          <div className="flex items-center bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            Academic Alert — visit your advisor immediately.
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="CGPA"
          value={cgpa}
          sub={cgpaLabel}
          icon={<Award className="w-5 h-5" />}
          color={parseFloat(cgpa) >= 2.0 ? 'green' : 'gray'}
        />
        <KpiCard
          label="Credits Earned"
          value={`${audit.completedCredits}`}
          sub={`of ${audit.requiredCredits || 48} required`}
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          label="Courses Passed"
          value={`${passedCount}`}
          sub={`${failedCount} carryovers`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          label="Pending Results"
          value={`${pendingCount}`}
          sub="awaiting grading"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Progress & Audit Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Degree Completion Progress</h2>
              <p className="text-xs text-gray-400 mt-0.5">Based on official NBTE Computer Science curriculum</p>
            </div>
            <span className="text-2xl font-black text-vom-green">{audit.percentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-vom-green to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(audit.percentage, 2)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium">Earned Units</span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{audit.completedCredits} Units</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium">Total Program Units</span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{audit.requiredCredits || 48} Units</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium">Registered Courses</span>
              <p className="font-bold text-vom-green text-sm mt-0.5">{activeEnrollments.length} Modules</p>
            </div>
          </div>
        </div>

        {/* Course Status Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h2 className="font-bold text-gray-900 text-base mb-2">Course Breakdown</h2>
          <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {courseStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-semibold pt-2 border-t border-gray-100">
            <span className="text-vom-green">● Passed ({passedCount})</span>
            <span className="text-red-500">● Failed ({failedCount})</span>
            <span className="text-amber-500">● Pending ({pendingCount})</span>
          </div>
        </div>
      </div>

      {/* Recommended Courses & CGPA Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Courses */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Recommended Courses for Registration</h2>
              <p className="text-xs text-gray-400 mt-0.5">Automated selection for {userData?.level || 'ND 1'}</p>
            </div>
            <Link to="/student/courses" className="text-xs font-bold text-vom-green hover:underline flex items-center">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-100">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-600">All current semester requirements are registered.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {recommendations.slice(0, 5).map(rec => (
                <div key={rec.courseCode} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-vom-green bg-emerald-50 px-2 py-1 rounded">
                      {rec.courseCode}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{rec.title}</p>
                      <p className="text-xs text-gray-400">Semester {rec.semester} • {rec.creditUnits} Units</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {rec.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CGPA Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-base">CGPA Progression</h2>
            <TrendingUp className="w-4 h-4 text-vom-green" />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrend}>
                <XAxis dataKey="semester" stroke="#9ca3af" fontSize={11} />
                <YAxis domain={[0, 4.0]} stroke="#9ca3af" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="cgpa" stroke="#006400" strokeWidth={3} dot={{ fill: '#006400', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card Component ──────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, color
}: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  const colorStyles: Record<string, { bg: string; iconBg: string; text: string }> = {
    green: { bg: 'bg-emerald-50/50', iconBg: 'bg-emerald-100 text-vom-green', text: 'text-vom-green' },
    blue:  { bg: 'bg-blue-50/50',    iconBg: 'bg-blue-100 text-blue-600',    text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50/50',   iconBg: 'bg-amber-100 text-amber-600',  text: 'text-amber-600' },
    red:   { bg: 'bg-red-50/50',     iconBg: 'bg-red-100 text-red-600',      text: 'text-red-600' },
    gray:  { bg: 'bg-gray-50/50',    iconBg: 'bg-gray-100 text-gray-600',    text: 'text-gray-700' },
  };

  const style = colorStyles[color] || colorStyles.gray;

  return (
    <div className={`p-5 rounded-2xl border border-gray-100 shadow-xs ${style.bg} space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
