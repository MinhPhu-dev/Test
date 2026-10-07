import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, Download, Terminal, 
  BookOpen, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react';
import { PYTHON_SOURCE_CODE } from '../constants/scienceData';

interface PythonSourceModalProps {
  onDownload: () => void;
}

export const PythonSourceModal: React.FC<PythonSourceModalProps> = ({ onDownload }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [viewSubTab, setViewSubTab] = useState<'app_py' | 'requirements' | 'terminal_guide'>('app_py');

  const reqContent = `streamlit>=1.32.0\npandas>=2.0.0\nnumpy>=1.24.0\nplotly>=5.18.0`;

  const copyToClipboard = (text: string, type: 'code' | 'req') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span>Mã nguồn hoàn chỉnh 1-File duy nhất</span>
              <span aria-hidden="true">·</span>
              <span>Python 3.9 - 3.12</span>
              <span aria-hidden="true">·</span>
              <span>Streamlit & Plotly Interactive</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mã Nguồn Python Streamlit (app.py) & Hướng Dẫn Cài Đặt
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Toàn bộ ứng dụng đã được đóng gói hoàn chỉnh trong file <code className="text-emerald-400 font-mono">app.py</code> với đầy đủ 4 phân hệ (1. Tính toán, 2. Bể chứa Cần Giờ, 3. Sàn giao dịch, 4. Hỏi đáp AI). Bạn có thể sao chép hoặc tải trực tiếp về máy để chạy trên môi trường cục bộ.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => copyToClipboard(PYTHON_SOURCE_CODE, 'code')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép app.py'}</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file app.py</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub tabs: app.py / requirements.txt / terminal guide */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewSubTab('app_py')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                viewSubTab === 'app_py' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>app.py (Mã nguồn Python chính)</span>
            </button>
            <button
              onClick={() => setViewSubTab('requirements')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                viewSubTab === 'requirements' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>requirements.txt</span>
            </button>
            <button
              onClick={() => setViewSubTab('terminal_guide')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                viewSubTab === 'terminal_guide' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Hướng dẫn lệnh chạy</span>
            </button>
          </div>
        </div>

        {/* Tab 1: app.py viewer */}
        {viewSubTab === 'app_py' && (
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[580px] scrollbar-thin">
            <pre className="text-slate-300 leading-relaxed">
              <code>{PYTHON_SOURCE_CODE}</code>
            </pre>
          </div>
        )}

        {/* Tab 2: requirements.txt viewer */}
        {viewSubTab === 'requirements' && (
          <div className="p-6 bg-slate-950 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Các thư viện cần thiết trong file requirements.txt:</span>
              <button
                onClick={() => copyToClipboard(reqContent, 'req')}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono"
              >
                {copiedReq ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReq ? 'Đã sao chép!' : 'Sao chép requirements'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-emerald-300 text-xs">
              {reqContent}
            </pre>
            <div className="text-xs text-slate-400">
              Lệnh cài đặt tự động: <code className="text-white bg-slate-800 px-2 py-1 rounded">pip install -r requirements.txt</code>
            </div>
          </div>
        )}

        {/* Tab 3: Terminal Guide */}
        {viewSubTab === 'terminal_guide' && (
          <div className="p-6 bg-slate-950 space-y-5 text-xs text-slate-300">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Hướng dẫn 3 bước chạy ứng dụng trên máy tính của bạn:</span>
              </h3>
            </div>

            {/* Step 1 */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="font-semibold text-emerald-400 text-xs">
                Bước 1: Mở Terminal / Command Prompt và cài đặt thư viện
              </div>
              <pre className="p-3 bg-black/60 rounded border border-slate-800 font-mono text-slate-200">
                pip install streamlit pandas numpy plotly
              </pre>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="font-semibold text-emerald-400 text-xs">
                Bước 2: Đặt file app.py vào thư mục dự án và khởi chạy
              </div>
              <pre className="p-3 bg-black/60 rounded border border-slate-800 font-mono text-slate-200">
                streamlit run app.py
              </pre>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="font-semibold text-emerald-400 text-xs">
                Bước 3: Mở trình duyệt Web
              </div>
              <p className="text-slate-400">
                Streamlit sẽ tự động bật tab trình duyệt hoặc bạn có thể mở đường dẫn:
              </p>
              <div className="font-mono text-emerald-400 text-sm font-bold">
                http://localhost:8501
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
