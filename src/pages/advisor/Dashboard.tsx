import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserData, Enrollment, Course } from '../../types';
import { calculateCGPA } from '../../lib/academicLogic';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, AlertTriangle, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdvisorDashboard() {
  const { userData } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, atRisk: 0, avgCgpa: '0.00' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userData?.department) return;
      try {
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

        let totalCgpa = 0;
        let atRiskCount = 0;

        studentData.forEach(student => {
          const studentEnrollments = allEnrollments.filter(e => e.studentId === student.uid);
          const cgpa = parseFloat(calculateCGPA(studentEnrollments, allCourses));
          const carryovers = studentEnrollments.filter(e => e.status === 'failed').length;
          
          if (!isNaN(cgpa)) totalCgpa += cgpa;
          if (cgpa < 2.0 || carryovers >= 2) atRiskCount++;
        });

        setStats({
          total: studentData.length,
          atRisk: atRiskCount,
          avgCgpa: studentData.length > 0 ? (totalCgpa / studentData.length).toFixed(2) : '0.00'
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userData]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advisor Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of your assigned advisees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Advisees</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Advisees At-Risk</p>
            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.atRisk}</h3>
          </div>
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Average CGPA</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.avgCgpa}</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 text-vom-green rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" /> Attention Required
          </h2>
          {stats.atRisk > 0 ? (
            <p className="text-gray-600 text-sm leading-relaxed">
              You have <strong className="text-red-600">{stats.atRisk} students</strong> currently flagged as at-risk due to a low CGPA or excessive carryover courses. Please review their files and schedule advisory sessions.
            </p>
          ) : (
            <p className="text-gray-600 text-sm leading-relaxed">
              All of your assigned students are currently in good academic standing. Great job!
            </p>
          )}
          <Link to="/advisor/students" className="mt-4 inline-flex items-center text-sm text-vom-green font-medium hover:underline">
            View student roster <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="font-bold text-gray-900 mb-2">Pending Approvals</h2>
          <p className="text-gray-500 text-sm mb-4">
            Course registration approvals for the upcoming semester will appear here once the registration window opens.
          </p>
          <button className="px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg text-sm cursor-not-allowed">
            No pending requests
          </button>
        </div>
      </div>
    </div>
  );
}
