import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, Megaphone, Clock, BookOpen, CheckCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body?: string;
  content?: string;
  audience: string;
  postedBy: string;
  createdAt?: string;
  timestamp?: any;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  recipientId: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentAnnouncements() {
  const { userData } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!userData?.uid) return;
      try {
        // 1. Fetch public announcements (department-wide / college-wide)
        const annSnap = await getDocs(collection(db, 'announcements'));
        const all = annSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
        const filtered = all.filter(a =>
          a.audience === 'all' || a.audience === 'Computer Science' || a.audience === userData?.department
        );
        filtered.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : (a.timestamp?.seconds || 0) * 1000;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : (b.timestamp?.seconds || 0) * 1000;
          return tb - ta;
        });
        setAnnouncements(filtered);

        // 2. Fetch private notifications for THIS student only
        const notifQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userData.uid)
        );
        const notifSnap = await getDocs(notifQuery);
        const notifs = notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notifs);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userData]);

  const markAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vom-green"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications & Announcements</h1>
        <p className="text-gray-500 mt-1 text-sm">Your private notifications and department notices.</p>
      </div>

      {/* Private Notifications Section */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">My Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${notif.isRead ? 'border-gray-100 opacity-80' : 'border-vom-green/40 bg-emerald-50/30'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-vom-green text-white rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{notif.title}</h3>
                        {!notif.isRead && <span className="w-2 h-2 bg-vom-green rounded-full inline-block"></span>}
                      </div>
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed">{notif.content}</p>
                      <div className="flex items-center mt-3 space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span>Posted by: <strong>{notif.postedBy}</strong></span>
                      </div>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="flex-shrink-0 flex items-center text-xs font-semibold text-vom-green hover:underline"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Announcements Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-800">Department Announcements</h2>
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
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed">{ann.body || ann.content}</p>
                      <div className="flex items-center mt-3 space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {ann.createdAt 
                            ? new Date(ann.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                            : (ann.timestamp?.toDate ? ann.timestamp.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently')}
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
    </div>
  );
}
