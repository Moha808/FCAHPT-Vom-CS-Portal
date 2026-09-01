import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { calculateCGPA, getDegreeAudit, getCourseRecommendations } from '../../lib/academicLogic';
import {
  AlertTriangle, CheckCircle, BookOpen,
  GraduationCap, Award, ArrowRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function StudentDashboard() {
  const { userData } = useAuthStore();
  const { enrollments, courses, curriculum, loading, fetchStudentData } = useDataStore();

  useEffect(() => {
    if (userData?.uid && userData?.program) {
      fetchStudentData(userData.uid, userData.program);
    }
  }, [userData]);

  const cgpa = useMemo(() => calculateCGPA(enrollments, courses), [enrollments, courses]);
  const audit = useMemo(() => getDegreeAudit(enrollments, curriculum, courses), [enrollments, curriculum, courses]);
  const recommendations = useMemo(() => {
    if (!userData?.level) return [];
    return getCourseRecommendations(enrollments, curriculum, courses, userData.level);
  }, [enrollments, curriculum, courses, userData]);

  const passedCount  = enrollments.filter(e => e.status === 'passed').length;
  const failedCount  = enrollments.filter(e => e.status === 'failed').length;
  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const isAtRisk     = parseFloat(cgpa) < 2.0 || failedCount >= 2;

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
    parseFloat(cgpa) >= 2.0 ? 'Pass' : 'Fail';

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
          color={parseFloat(cgpa) >= 2.0 ? 'green' : 'red'}
        />
        <KpiCard
          label="Credits Earned"
          value={`${audit.completedCredits}`}
          sub={`of ${audit.requiredCredits} required`}
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          label="Courses Passed"
          value={`${passedCount}`}
          sub={`${failedCount} carryover${failedCount !== 1 ? 's' : ''}`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="purple"
        />
        <KpiCard
          label="Pending Results"
          value={`${pendingCount}`}
          sub="awaiting grading"
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-900">Degree Progress</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {audit.completedCredits} of {audit.requiredCredits} credit units completed
            </p>
          </div>
          <span className="text-3xl font-extrabold text-vom-green">{audit.percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-vom-green to-vom-green-light transition-all duration-1000"
            style={{ width: `${audit.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Start</span>
          <span>{audit.requiredCredits - audit.completedCredits} credits remaining</span>
          <span>Graduation</span>
        </div>
      </div>

      {/* Charts + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CGPA trend */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">CGPA Trend</h2>
            <p className="text-xs text-gray-400 mb-4">Performance across semesters</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cgpaTrend}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#006400" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#006400" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="semester" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0 / .1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="cgpa" stroke="#006400" strokeWidth={2.5} fill="url(#gc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course breakdown bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Course Breakdown</h2>
            <p className="text-xs text-gray-400 mb-4">Summary of your enrollment statuses</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseStats} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgb(0 0 0/.1)', fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}
                    fill="#006400"
                    label={false}
                  >
                    {courseStats.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendations panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 text-vom-gold mr-2" />
            <h2 className="font-bold text-gray-900">Recommended Next Semester</h2>
          </div>

          {recommendations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-vom-green" />
              </div>
              <p className="font-medium text-gray-700">All caught up!</p>
              <p className="text-sm text-gray-400 mt-1">No courses to recommend right now.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recommendations.map(course => (
                <div key={course.courseCode} className="p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-vom-green/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-900">{course.courseCode}</span>
                    <span className="text-xs bg-white border rounded px-1.5 py-0.5 text-gray-500 font-medium">{course.creditUnits} u</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 truncate">{course.title}</p>
                  <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    course.reason === 'Carryover'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {course.reason === 'Carryover' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {course.reason}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-800">
                <span>Total Units</span>
                <span>{recommendations.reduce((s, c) => s + c.creditUnits, 0)}</span>
              </div>
            </div>
          )}

          <Link
            to="/student/courses"
            className="mt-4 flex items-center justify-center text-sm text-vom-green font-semibold hover:underline"
          >
            View full course history <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    green:  'bg-green-100 text-vom-green',
    red:    'bg-red-100 text-red-600',
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
