import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
        <p className="text-gray-500 mt-1 text-sm">Analytics and academic performance metrics.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start">
        <BarChart3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-800">Advanced Analytics Coming Soon</p>
          <p className="text-sm text-blue-600 mt-1">
            Full data visualization, PDF report generation, and historical trend analysis are currently in development.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-vom-green mr-2" /> Academic Performance Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">College Average CGPA</span>
              <span className="font-bold text-gray-900">3.12</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">Computer Science Dept. Average</span>
              <span className="font-bold text-gray-900">3.25</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-gray-600">Animal Health Dept. Average</span>
              <span className="font-bold text-gray-900">2.98</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" /> At-Risk Students
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">Total Flagged Students</span>
              <span className="font-bold text-red-600">42</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-600">Most Failed Course</span>
              <span className="font-bold text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">MTH101</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
