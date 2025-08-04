import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

// Login/Signup Component
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 Referral Dashboard
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="ml-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Demo credentials info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Demo Account:</strong><br/>
            Email: akshad@example.com<br/>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
    fetchLeaderboard();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRewardStatus = (amount) => {
    if (amount >= 5000) return { text: '👑 Certificate + Goodies', unlocked: true };
    if (amount >= 2500) return { text: '🚀 LinkedIn Shoutout', unlocked: true };
    if (amount >= 1000) return { text: '🎉 Free Swag Kit', unlocked: true };
    return { text: 'Keep going to unlock rewards!', unlocked: false };
  };

  const getNextReward = (amount) => {
    if (amount < 1000) return `₹${1000 - amount} more for Swag Kit`;
    if (amount < 2500) return `₹${2500 - amount} more for LinkedIn Shoutout`;
    if (amount < 5000) return `₹${5000 - amount} more for Certificate + Goodies`;
    return 'All rewards unlocked! 🎉';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const currentUser = dashboardData || user;
  const userRank = leaderboard.findIndex(u => u.referralCode === currentUser.referralCode) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🎯 Referral Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {currentUser.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">💰 Total Raised</h3>
                <p className="text-3xl font-bold">₹{currentUser.donationsRaised?.toLocaleString()}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">🏆 Your Rank</h3>
                <p className="text-3xl font-bold">#{userRank || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">🎯 Referral Code</h3>
                <p className="text-xl font-mono font-bold">{currentUser.referralCode}</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">👤 Your Profile</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Name:</span>
                      <p className="text-lg font-semibold">{currentUser.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Email:</span>
                      <p className="text-lg">{currentUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Referral Code:</span>
                      <p className="text-lg font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                        {currentUser.referralCode}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Current Status</h3>
                    <p className="text-lg mb-2">{getRewardStatus(currentUser.donationsRaised).text}</p>
                    <p className="text-sm text-gray-600">{getNextReward(currentUser.donationsRaised)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((currentUser.donationsRaised / 5000) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">🎁 Rewards & Unlockables</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border-2 text-center ${
                  currentUser.donationsRaised >= 1000 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-semibold mb-2">Free Swag Kit</h3>
                  <p className="text-gray-600 mb-3">₹1,000 raised</p>
                  {currentUser.donationsRaised >= 1000 ? (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ✅ Unlocked!
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm">
                      🔒 Locked
                    </span>
                  )}
                </div>

                <div className={`p-6 rounded-xl border-2 text-center ${
                  currentUser.donationsRaised >= 2500 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-lg font-semibold mb-2">LinkedIn Shoutout</h3>
                  <p className="text-gray-600 mb-3">₹2,500 raised</p>
                  {currentUser.donationsRaised >= 2500 ? (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ✅ Unlocked!
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm">
                      🔒 Locked
                    </span>
                  )}
                </div>

                <div className={`p-6 rounded-xl border-2 text-center ${
                  currentUser.donationsRaised >= 5000 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="text-4xl mb-3">👑</div>
                  <h3 className="text-lg font-semibold mb-2">Certificate + Goodies</h3>
                  <p className="text-gray-600 mb-3">₹5,000 raised</p>
                  {currentUser.donationsRaised >= 5000 ? (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ✅ Unlocked!
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm">
                      🔒 Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">🏆 Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Referral Code</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount Raised</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr 
                      key={user.referralCode}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        user.referralCode === currentUser.referralCode 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {user.name}
                        {user.referralCode === currentUser.referralCode && 
                          <span className="ml-2 text-sm text-blue-600 font-bold">(You)</span>
                        }
                      </td>
                      <td className="py-4 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {user.referralCode}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-lg">
                        ₹{user.donationsRaised.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;