import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const CompleteSubscription: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    hearAboutUs: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_NEWSLETTER_API || 'https://perfect-integrity-production.up.railway.app'}/api/newsletter/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          ...formData
        })
      });

      const data = await response.json();

      if (data.ok) {
        setCompleted(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-4">This subscription link is invalid or has expired.</p>
          <button onClick={() => navigate('/')} className="btn-neo px-6 py-2">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-green-600 text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Red Mugsy!</h2>
          <p className="text-gray-600 mb-4">
            Thank you {formData.firstName} for completing your subscription. You'll receive our latest updates and exclusive content!
          </p>
          <button onClick={() => navigate('/')} className="btn-neo px-6 py-2">
            Explore Red Mugsy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <img src="/img/mugsy-logo-red.png" alt="Red Mugsy" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h2>
          <p className="text-gray-600">
            Email verified: <span className="font-semibold text-red-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select gender (optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="private">Prefer not to say</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* How did you hear about us */}
          <div>
            <label htmlFor="hearAboutUs" className="block text-sm font-medium text-gray-700 mb-1">
              How did you hear about Red Mugsy? *
            </label>
            <select
              id="hearAboutUs"
              name="hearAboutUs"
              required
              value={formData.hearAboutUs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Please select...</option>
              <option value="social-media">Social Media (Twitter/X, Instagram, etc.)</option>
              <option value="discord">Discord</option>
              <option value="telegram">Telegram</option>
              <option value="reddit">Reddit</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="friend">Friend or Word of Mouth</option>
              <option value="crypto-community">Crypto Community</option>
              <option value="exchange">Exchange Listing</option>
              <option value="news-article">News Article or Blog</option>
              <option value="search-engine">Search Engine (Google, etc.)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            }`}
          >
            {loading ? 'Completing Subscription...' : 'Complete Subscription'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          * Required fields. Your information is secure and will only be used for newsletter delivery and improvements.
        </p>
      </div>
    </div>
  );
};

export default CompleteSubscription;