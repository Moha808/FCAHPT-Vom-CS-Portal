import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Complaint } from '../../types';
import { MessageSquare, Send, CheckCircle, Clock, HelpCircle } from 'lucide-react';

export default function StudentComplaints() {
  const { userData } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Grade Dispute / Result Issue',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [userData]);

  const fetchComplaints = async () => {
    try {
      if (!userData?.uid) return;
      const q = query(
        collection(db, 'complaints'),
        where('studentId', '==', userData.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
      setComplaints(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setSubmitting(true);
    setSuccessMsg(false);

    try {
      const newComplaint: Omit<Complaint, 'id'> = {
        studentId: userData?.uid || '',
        studentName: userData?.name || 'Student',
        studentEmail: userData?.email || '',
        studentMatric: userData?.matricNumber || 'N/A',
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'complaints'), newComplaint);
      setFormData({ category: 'Grade Dispute / Result Issue', subject: '', message: '' });
      setSuccessMsg(true);
      fetchComplaints();
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Complaints & Grievances</h1>
        <p className="text-gray-500 mt-1 text-sm">Submit official complaints directly to the Head of Department & HOD Admin.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Complaint Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <MessageSquare className="w-5 h-5 text-vom-green" />
            <h2 className="font-bold text-gray-900">Lodge a New Complaint</h2>
          </div>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-start text-xs text-green-800">
              <CheckCircle className="w-4 h-4 text-vom-green mr-2 flex-shrink-0 mt-0.5" />
              <span>Complaint submitted successfully! The Head of Department has been notified.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Complaint Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-vom-green outline-none bg-white"
              >
                <option value="Grade Dispute / Result Issue">Grade Dispute / Result Issue</option>
                <option value="Course Enrollment & Prerequisite Issue">Course Enrollment & Prerequisite Issue</option>
                <option value="Advisor Assignment Inquiry">Advisor Assignment Inquiry</option>
                <option value="General Academic Grievance">General Academic Grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Missing Grade for COS201"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-vom-green outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Detailed Explanation</label>
              <textarea
                rows={5}
                required
                placeholder="Provide full details of your complaint (course code, semester, session, advisor notes, etc.)..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-vom-green outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-vom-green hover:bg-vom-green-light text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-vom-green/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting to HOD...' : 'Submit Official Complaint'}
            </button>
          </form>
        </div>

        {/* Right Column: History of Complaints */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg flex items-center">
              <Clock className="w-5 h-5 text-vom-gold mr-2" /> Complaint History & Status
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
              {complaints.length} Submitted
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>
          ) : complaints.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No complaints filed yet.</p>
              <p className="text-xs text-gray-400 mt-1">Fill out the form on the left if you encounter any result or academic issues.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-vom-green bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {c.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-1">{c.subject}</h3>
                    </div>
                    {c.status === 'resolved' ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Pending HOD Review
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    "{c.message}"
                  </p>

                  {c.response && (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-vom-green flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Official Response from HOD:
                      </p>
                      <p className="text-gray-800">{c.response}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 pt-1 text-right">
                    Filed on {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
