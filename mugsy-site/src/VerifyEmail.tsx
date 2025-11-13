import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // Call verification API
    fetch(`${import.meta.env.VITE_NEWSLETTER_API || 'https://perfect-integrity-production.up.railway.app'}/api/newsletter/verify?token=${token}`)
      .then(response => {
        if (response.redirected) {
          // Successful verification, redirect to completion form
          window.location.href = response.url;
          return;
        }
        return response.json();
      })
      .then(data => {
        if (data?.error === 'token_expired') {
          setStatus('expired');
          setMessage('Verification link has expired. Please subscribe again.');
        } else if (data?.error) {
          setStatus('error');
          setMessage('Verification failed. Please try subscribing again.');
        } else {
          setStatus('success');
        }
      })
      .catch(error => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <img src="/img/mugsy-logo-red.png" alt="Red Mugsy" className="h-16 mx-auto mb-6" />
          
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">Redirecting you to complete your subscription...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-red-600 text-4xl mb-4">✗</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="btn-neo px-6 py-2"
              >
                Return to Home
              </button>
            </div>
          )}

          {status === 'expired' && (
            <div>
              <div className="text-orange-600 text-4xl mb-4">⏰</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/#community')}
                className="btn-neo px-6 py-2"
              >
                Subscribe Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;