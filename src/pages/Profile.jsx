import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { User, Mail, Calendar, MapPin, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    title: useTranslation("Profile"),
    loading: useTranslation("Loading profile..."),
    error: useTranslation("Error loading profile"),
    retry: useTranslation("Retry"),
    details: {
      email: useTranslation("Email"),
      joined: useTranslation("Joined"),
      location: useTranslation("Location"),
      posts: useTranslation("Posts"),
      replies: useTranslation("Replies")
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/community/user/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{translations.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {translations.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{translations.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{translations.details.joined}: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{translations.details.posts}</h3>
                <p className="text-2xl font-bold text-primary">{user.postCount || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{translations.details.replies}</h3>
                <p className="text-2xl font-bold text-primary">{user.replyCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 