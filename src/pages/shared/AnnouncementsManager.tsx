import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { Megaphone, Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function AnnouncementsManager() {
  const { userData } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all' // 'all' or department name
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // For simplicity, fetching all and sorting in memory. In prod, use orderBy query
      const snap = await getDocs(collection(db, 'announcements'));
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setAnnouncements(fetched);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await addDoc(collection(db, 'announcements'), {
        title: formData.title,
        body: formData.body,
        audience: formData.audience,
        postedBy: userData.name,
        timestamp: serverTimestamp()
      });
      setMsg({ type: 'success', text: 'Announcement posted successfully!' });
      setFormData({ title: '', body: '', audience: 'all' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to post announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
          <p className="text-gray-500 mt-1 text-sm">Post notices to students college-wide or specific to your department.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2.5 bg-vom-green text-white rounded-lg text-sm font-medium hover:bg-vom-green-light transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Announcement</>}
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-lg flex items-center text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Post New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green"
                placeholder="e.g. Mid-semester Exams Schedule"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green"
                placeholder="Write your announcement here..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={e => setFormData({...formData, audience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vom-green bg-white"
              >
                <option value="all">All Students (College-wide)</option>
                {userData?.department && (
                  <option value={userData.department}>Only {userData.department} Students</option>
                )}
              </select>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-vom-gold text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Megaphone className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="font-bold text-gray-900">Recent Announcements</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No announcements posted yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {announcements.map(ann => (
              <li key={ann.id} className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.audience === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {ann.audience === 'all' ? 'College-wide' : ann.audience}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{ann.body}</p>
                  <div className="flex items-center mt-3 text-xs text-gray-400 space-x-4">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {ann.timestamp?.toDate ? ann.timestamp.toDate().toLocaleString() : 'Just now'}</span>
                    <span>By: {ann.postedBy}</span>
                  </div>
                </div>
                {/* Allow deletion if user is admin or if they posted it */}
                {(userData?.role === 'admin' || userData?.name === ann.postedBy) && (
                  <button onClick={() => handleDelete(ann.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
