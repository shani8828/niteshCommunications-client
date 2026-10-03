import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import api from '../utils/api';

// Modular components
import ProfileEditTab from '../components/profile/ProfileEditTab';

const Profile = () => {
  const { t, i18n } = useTranslation(['cart', 'common', 'notifications', 'auth']);
  const { user, updateUserProfile } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  const currentLang = i18n.language || 'en';
  const isHindi = currentLang === 'hi';

  const handleUpdateProfile = useCallback(async (profileData) => {
    setActionLoading(true);
    try {
      const response = await api.put('/auth/me', profileData);
      updateUserProfile(response.data.user);
      showToast.success(isHindi ? 'प्रोफाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      showToast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [updateUserProfile, isHindi]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 relative">
     <ProfileEditTab
            user={user}
            isHindi={isHindi}
            t={t}
            onUpdateProfile={handleUpdateProfile}
            actionLoading={actionLoading}
          />
    </div>
  );
};

export default Profile;
