import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Complaint, UserData, Course, Enrollment } from '../../types';
import { calculateCGPA } from '../../lib/academicLogic';
import { BarChart3, MessageSquare, CheckCircle, Clock, Send } from 'lucide-react';
import { ALL_COURSES } from '../../lib/defaultCourses';

export default function AdminReports() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ avgCgpa: '0.00', totalStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Complaints
      const snap = await getDocs(collection(db, 'complaints'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComplaints(list);

      // 2. Fetch Real Analytics for Students
      const usersSnap = await getDocs(collection(db, 'users'));
      const students = usersSnap.docs.map(d => d.data() as UserData).filter(u => u.role === 'student');
      
      const enrollmentsSnap = await getDocs(collection(db, 'enrollments'));
      const allEnrollments = enrollmentsSnap.docs.map(d => d.data() as Enrollment);
      
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnap.docs.length > 0 ? coursesSnap.docs.map(d => d.data() as Course) : ALL_COURSES;

      let totalCgpa = 0;
      students.forEach(student => {
        const studentEnrollments = allEnrollments.filter(e => e.studentId === student.uid);
        const cgpa = parseFloat(calculateCGPA(studentEnrollments, allCourses));
        totalCgpa += cgpa;
      });

      setStats({
        avgCgpa: students.length > 0 ? (totalCgpa / students.length).toFixed(2) : '0.00',
        totalStudents: students.length,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    if (!replyText.trim()) return;
    setSavingReply(true);
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: 'resolved',
        response: replyText.trim(),
        resolvedAt: new Date().toISOString(),
      });
      setReplyText('');
      setReplyingId(null);
      fetchData();
    } catch (err) {
      console.error('Error resolving complaint:', err);
    } finally {
      setSavingReply(false);
    }
  };

  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Department Reports & Student Complaints</h1>
        <p className="text-gray-500 mt-1 text-sm">HOD Admin center for resolving student grievances and monitoring departmental metrics.</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Average CGPA (All Students)</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.avgCgpa}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4 font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Pending Complaints</p>
            <h3 className="text-2xl font-black text-amber-600">{pendingComplaints.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-vom-green flex items-center justify-center mr-4 font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Complaints Resolved</p>
            <h3 className="text-2xl font-black text-vom-green">{complaints.length - pendingComplaints.length}</h3>
          </div>
        </div>
      </div>

      {/* HOD Student Complaints Center */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 text-vom-green mr-2" /> Student Complaints & Grievance Portal
          </h2>
          <span className="text-xs bg-emerald-100 text-vom-green px-3 py-1 rounded-full font-bold">
            {complaints.length} Total Complaints
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No student complaints filed yet.</div>
          ) : (
            <div className="space-y-4">
              {complaints.map(c => (
                <div key={c.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors bg-gray-50/50 space-y-3">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-vom-green bg-emerald-50 px-2.5 py-0.5 rounded">
                          {c.category}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">Student: {c.studentName} ({c.studentMatric || 'Matric Pending'})</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base mt-1">{c.subject}</h3>
                    </div>

                    {c.status === 'resolved' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full w-max flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-max flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Pending HOD Review
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 text-sm text-gray-700">
                    "{c.message}"
                  </div>

                  {c.response ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-vom-green flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-vom-green" /> Official HOD Response:
                      </p>
                      <p className="text-gray-800">{c.response}</p>
                    </div>
                  ) : replyingId === c.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write HOD resolution / response to student..."
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(''); }}
                          className="px-3 py-1.5 text-xs text-gray-600 font-semibold border rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => c.id && handleResolveComplaint(c.id)}
                          disabled={savingReply}
                          className="px-4 py-1.5 text-xs text-white font-bold bg-vom-green hover:bg-vom-green-light rounded-lg flex items-center"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Send & Mark Resolved
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 flex justify-between items-center text-xs">
                      <span className="text-gray-400">Filed: {new Date(c.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => { setReplyingId(c.id || null); setReplyText(''); }}
                        className="text-vom-green font-bold hover:underline"
                      >
                        + Respond & Resolve Complaint
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
