import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { UserData } from '../../types';
import { UserCheck, Mail, Phone, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

export default function StudentAdvisor() {
  const { userData } = useAuthStore();
  const [assignedAdvisor, setAssignedAdvisor] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        if (userData?.advisorId) {
          try {
            const docSnap = await getDoc(doc(db, 'users', userData.advisorId));
            if (docSnap.exists()) {
              setAssignedAdvisor(docSnap.data() as UserData);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }

        // Fallback: search users collection for matching advisor name or any advisor in the department
        const allUsersSnap = await getDocs(collection(db, 'users'));
        const allUsers = allUsersSnap.docs.map(d => d.data() as UserData);
        
        // Find advisor by name if assigned
        if (userData?.advisorName) {
          const match = allUsers.find(u => u.role === 'advisor' && u.name === userData.advisorName);
          if (match) {
            setAssignedAdvisor(match);
            setLoading(false);
            return;
          }
        }

        // Find any advisor in the department
        const deptAdvisor = allUsers.find(u => u.role === 'advisor');
        if (deptAdvisor) {
          setAssignedAdvisor(deptAdvisor);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisor();
  }, [userData]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;
  }

  const advisorName = assignedAdvisor?.name || userData?.advisorName || 'Departmental Academic Advisor';
  const advisorEmail = assignedAdvisor?.email || userData?.advisorEmail || 'advisor.cs@fcahptvom.edu.ng';
  const advisorPhone = assignedAdvisor?.phone || userData?.advisorPhone || '+234 803 000 0000';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Academic Advisor</h1>
        <p className="text-gray-500 mt-1 text-sm">Your assigned advisor and consultation schedule.</p>
      </div>

      {/* Advisor Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-inner">
          {advisorName.charAt(0)}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{advisorName}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{userData?.department || 'Computer Science'} Department &nbsp;•&nbsp; Academic Advisor</p>
            </div>

            {userData?.advisorId || assignedAdvisor ? (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full w-max mx-auto sm:mx-0">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-vom-green" /> Officially Assigned
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-max mx-auto sm:mx-0">
                Departmental Advisor
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
            <a href={`mailto:${advisorEmail}`} className="flex items-center text-sm font-semibold text-vom-green hover:underline">
              <Mail className="w-4 h-4 mr-1.5" /> {advisorEmail}
            </a>
            <a href={`tel:${advisorPhone}`} className="flex items-center text-sm font-semibold text-gray-700 hover:text-vom-green">
              <Phone className="w-4 h-4 mr-1.5 text-gray-400" /> {advisorPhone}
            </a>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 justify-center sm:justify-start">
            <a href={`mailto:${advisorEmail}?subject=Academic%20Advisement%20Request%20-%20${encodeURIComponent(userData?.name || '')}`}
              className="inline-flex items-center px-4 py-2 bg-vom-green text-white rounded-xl text-sm font-semibold hover:bg-vom-green-light transition-colors shadow-xs">
              <MessageSquare className="w-4 h-4 mr-2" /> Email Advisor
            </a>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
        <div className="flex items-start">
          <UserCheck className="w-5 h-5 text-vom-green mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900 text-sm">Advisor Guidance & Consultation</p>
            <p className="text-sm text-gray-600 mt-1">
              Your advisor evaluates your course prerequisites, signs off on semester registrations, and monitors your CGPA progress. Contact your advisor if you need assistance with carryover courses.
            </p>
          </div>
        </div>
      </div>

      {/* Office hours */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-vom-gold" /> Office Consultation Hours
        </h3>
        <div className="divide-y divide-gray-100">
          {[
            { day: 'Monday',    time: '10:00 AM – 12:00 PM' },
            { day: 'Wednesday', time: '2:00 PM – 4:00 PM' },
            { day: 'Friday',    time: '10:00 AM – 12:00 PM' },
          ].map(row => (
            <div key={row.day} className="flex justify-between py-3 text-sm">
              <span className="font-medium text-gray-700">{row.day}</span>
              <span className="text-gray-500 font-semibold">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
