import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, Megaphone, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  postedBy: string;
  timestamp: any;
}

export default function StudentAnnouncements() {
  const { userData } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const snap = await getDocs(collection(db, 'announcements'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
        // Show college-wide and department-specific
        const filtered = all.filter(a =>
          a.audience === 'all' || a.audience === userData?.department
        );
        // Sort newest first
        filtered.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setAnnouncements(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [userData]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1 text-sm">College-wide and department notices from your advisors and admin.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for updates from your department.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-vom-green/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 text-vom-green rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                    <p className="text-gray-600 mt-1 text-sm leading-relaxed">{ann.body}</p>
                    <div className="flex items-center mt-3 space-x-4 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {ann.timestamp?.toDate ? ann.timestamp.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                      </span>
                      <span>Posted by: <strong>{ann.postedBy}</strong></span>
                    </div>
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  ann.audience === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {ann.audience === 'all' ? 'College-wide' : ann.audience}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
