
import { UserCheck, Mail, Phone, BookOpen, MessageSquare } from 'lucide-react';

export default function StudentAdvisor() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Advisor</h1>
        <p className="text-gray-500 mt-1 text-sm">Your assigned academic advisor and contact details.</p>
      </div>

      {/* Advisor Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl font-bold flex-shrink-0">
          A
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">Your Advisor</h2>
          <p className="text-gray-500 text-sm mt-1">Department of Computer Science &nbsp;•&nbsp; Academic Advisor</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
            <a href="mailto:advisor@fcahptvom.edu.ng"
              className="flex items-center text-sm text-vom-green hover:underline">
              <Mail className="w-4 h-4 mr-1.5" /> advisor@fcahptvom.edu.ng
            </a>
            <span className="flex items-center text-sm text-gray-500">
              <Phone className="w-4 h-4 mr-1.5" /> +234 800 000 0000
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
            <a href="mailto:advisor@fcahptvom.edu.ng"
              className="inline-flex items-center px-4 py-2 bg-vom-green text-white rounded-lg text-sm font-medium hover:bg-vom-green-light transition-colors">
              <MessageSquare className="w-4 h-4 mr-2" /> Send Message
            </a>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start">
          <UserCheck className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-800">Advisor Assignment</p>
            <p className="text-sm text-blue-600 mt-1">
              Your advisor is assigned by the Head of Department. If you have not yet been assigned an advisor,
              please visit the Computer Science department office or contact the admin.
            </p>
          </div>
        </div>
      </div>

      {/* Office hours */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-vom-gold" /> Office Hours
        </h3>
        <div className="divide-y divide-gray-100">
          {[
            { day: 'Monday',    time: '10:00 AM – 12:00 PM' },
            { day: 'Wednesday', time: '2:00 PM – 4:00 PM' },
            { day: 'Friday',    time: '10:00 AM – 12:00 PM' },
          ].map(row => (
            <div key={row.day} className="flex justify-between py-3 text-sm">
              <span className="font-medium text-gray-700">{row.day}</span>
              <span className="text-gray-500">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
