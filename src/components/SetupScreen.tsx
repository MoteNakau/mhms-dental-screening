// Setup screen for configuring backend URL
import { useState } from 'react';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [backendUrl, setBackendUrl] = useState(localStorage.getItem('mhms_backend_url') || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  async function testConnection() {
    if (!backendUrl) {
      setTestResult({ success: false, message: 'Please enter a backend URL' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(backendUrl + '?action=whoami');
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mhms_backend_url', backendUrl);
        setTestResult({ 
          success: true, 
          message: `Connected! Your email: ${data.email || 'Unknown'}` 
        });
        setTimeout(() => onComplete(), 1500);
      } else {
        setTestResult({ 
          success: false, 
          message: data.message || 'Connection failed' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Could not connect to backend. Check the URL and try again.' 
      });
    } finally {
      setTesting(false);
    }
  }

  function skipSetup() {
    // Allow offline-only mode
    localStorage.setItem('mhms_backend_url', '');
    onComplete();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🦷</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MHMS Oral Screening</h1>
          <p className="text-sm text-gray-600">Setup Required</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Backend URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://script.google.com/macros/s/..."
              value={backendUrl}
              onChange={e => setBackendUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Google Apps Script Web App URL
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${
              testResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.message}
            </div>
          )}

          <button
            onClick={testConnection}
            disabled={testing || !backendUrl}
            className="btn-primary w-full"
          >
            {testing ? 'Testing...' : 'Test & Save'}
          </button>

          <div className="text-center">
            <button
              onClick={skipSetup}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip (offline mode only)
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
            <strong>How to get your backend URL:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open your Google Apps Script project</li>
              <li>Click Deploy → New deployment</li>
              <li>Select "Web app"</li>
              <li>Set "Execute as: Me" and "Who has access: Anyone"</li>
              <li>Click Deploy and copy the URL</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
