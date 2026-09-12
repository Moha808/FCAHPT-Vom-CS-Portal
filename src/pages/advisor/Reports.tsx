import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserData, Enrollment, Course } from '../../types';
import { calculateCGPA, getCGPACategory } from '../../lib/academicLogic';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';
import { ALL_COURSES } from '../../lib/defaultCourses';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AdvisorReports() {
  const { userData } = useAuthStore();
  const [students, setStudents] = useState<(UserData & { cgpa: string, carryovers: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    try {
      if (!userData?.uid) return;

      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'student'),
        where('advisorId', '==', userData.uid)
      );
      const snap = await getDocs(q);
      const studentData = snap.docs.map(doc => doc.data() as UserData);

      const enrollmentsSnap = await getDocs(collection(db, 'enrollments'));
      const allEnrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnap.docs.length > 0 ? coursesSnap.docs.map(doc => doc.data() as Course) : ALL_COURSES;

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

  const { stats, chartData, categoryData } = useMemo(() => {
    let totalCgpa = 0;
    let totalCarryovers = 0;
    let atRisk = 0;
    const categories: Record<string, number> = {
      'Distinction': 0, 'Upper Credit': 0, 'Lower Credit': 0, 'Pass': 0, 'Fail': 0, 'Awaiting Grading': 0
    };

    students.forEach(s => {
      const cgpa = parseFloat(s.cgpa);
      totalCgpa += cgpa;
      totalCarryovers += s.carryovers;
      if (cgpa < 2.0 || s.carryovers >= 2) atRisk++;
      
      const cat = getCGPACategory(s.cgpa);
      categories[cat]++;
    });

    const catData = Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    })).filter(item => item.value > 0);

    return {
      stats: {
        total: students.length,
        avgCgpa: students.length > 0 ? (totalCgpa / students.length).toFixed(2) : '0.00',
        atRisk,
        carryovers: totalCarryovers
      },
      chartData: students.map(s => ({
        name: s.name.split(' ')[0], // first name
        cgpa: parseFloat(s.cgpa),
        carryovers: s.carryovers
      })).slice(0, 20), // show up to 20 on bar chart
      categoryData: catData
    };
  }, [students]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#9ca3af'];

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advisee Reports</h1>
        <p className="text-gray-500 mt-1 text-sm">Academic analytics and performance metrics for your assigned students.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Advisees</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Average CGPA</p>
            <p className="text-2xl font-black text-gray-900">{stats.avgCgpa}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">At-Risk Students</p>
            <p className="text-2xl font-black text-gray-900">{stats.atRisk}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Carryovers</p>
            <p className="text-2xl font-black text-gray-900">{stats.carryovers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CGPA Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Performance Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student CGPA Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Top Students CGPA</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 4]} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="cgpa" name="CGPA" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
