import { useState, useEffect } from 'react';

export default function RescueDashboard() {
  const [stats, setStats] = useState({
    totalDiscovered: 0,
    liveBlogs: 0,
    withContacts: 0,
    lastRun: null
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);

  const addLog = (type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const startDiscovery = async () => {
    setIsRunning(true);
    setCurrentPhase('Starting comprehensive discovery...');
    addLog('info', '🚀 Starting comprehensive TypePad discovery');

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprehensive: true })
      });

      if (response.ok) {
        const data = await response.json();
        addLog('success', `Discovery complete! Found ${data.totalFound} blogs`);
        setStats(prev => ({ ...prev, ...data.stats }));
        setResults(data.results);
      } else {
        throw new Error('Discovery failed');
      }
    } catch (error) {
      addLog('error', `Discovery failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentPhase('');
    }
  };

  const exportResults = async () => {
    try {
      const response = await fetch('/api/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `typepad-rescue-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        addLog('success', '📁 Export completed successfully');
      }
    } catch (error) {
      addLog('error', `Export failed: ${error.message}`);
    }
  };

  useEffect(() => {
    // Load initial stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.totalDiscovered.toLocaleString()}</div>
          <div className="text-gray-600">Total Discovered</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{stats.liveBlogs.toLocaleString()}</div>
          <div className="text-gray-600">Live Blogs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.withContacts.toLocaleString()}</div>
          <div className="text-gray-600">With Contact Info</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-xl font-bold text-yellow-600">
            {stats.liveBlogs > 0 ? Math.round((stats.withContacts / stats.liveBlogs) * 100) : 0}%
          </div>
          <div className="text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Mission Control</h2>
          <div className="space-x-4">
            <button
              onClick={startDiscovery}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg"
            >
              {isRunning ? '🔄 Running Discovery...' : '🚀 Start Comprehensive Discovery'}
            </button>
            <button
              onClick={exportResults}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              📁 Export Results
            </button>
          </div>
        </div>

        {currentPhase && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="text-blue-800 font-medium">{currentPhase}</div>
          </div>
        )}

        {/* Live Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Ready to start discovery mission
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400">{log.timestamp}</span>
                      <span className={`font-medium ${
                        log.type === 'success' ? 'text-green-600' :
                        log.type === 'error' ? 'text-red-600' :
                        log.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Discoveries</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No discoveries yet
                </div>
              ) : (
                <div className="space-y-3">
                  {results.slice(0, 20).map((blog, index) => (
                    <div key={index} className="bg-white rounded p-3 shadow-sm">
                      <a href={blog.url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline font-medium text-sm">
                        {blog.url.replace('https://', '')}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {blog.author && `👤 ${blog.author}`}
                        {blog.emails?.length > 0 && ` • 📧 ${blog.emails.length} email(s)`}
                        {blog.lastPost && ` • 📅 ${blog.lastPost}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
