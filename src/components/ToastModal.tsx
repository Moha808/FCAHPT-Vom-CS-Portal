import { CheckCircle, AlertCircle } from 'lucide-react';

interface ToastModalProps {
  isOpen: boolean;
  type: 'success' | 'error';
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ToastModal({ isOpen, type, title, message, onClose }: ToastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            type === 'success' ? 'bg-green-100 text-vom-green' : 'bg-red-100 text-red-600'
          }`}>
            {type === 'success' ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {title || (type === 'success' ? 'Success' : 'Notice')}
          </h3>
          
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-colors ${
              type === 'success' ? 'bg-vom-green hover:bg-vom-green-light' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
