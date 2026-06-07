import usePageTitle from '../hooks/usePageTitle';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { endpoints } from '../services/api';

const INPUT_CLS = 'w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body-md text-body-md text-primary placeholder-outline transition-colors outline-none';

const Profile = () => {
  usePageTitle('Account');
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phone: user.phone || '' });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?._id) return;
    try {
      const res = await endpoints.users.getStats(user._id);
      setStats(res.data?.data || res.data);
    } catch {
      // stats are non-critical
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      await endpoints.users.updateProfile(profileData);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...profileData }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await endpoints.users.updatePassword(user._id, { currentPassword, newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const res = await endpoints.users.updatePhoto(user._id, formData);
      const photoUrl = res.data?.data?.profilePhoto;
      if (photoUrl) {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, profilePhoto: photoUrl }));
      }
      toast.success('Photo updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setPhotoLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-px h-12 bg-primary animate-pulse" />
      </div>
    );
  }

  const TABS = ['profile', 'security', 'photo'];

  return (
    <div className="w-full bg-background min-h-screen pb-section-gap">
      {/* Header */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Account
            </span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic">
              {user.name}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">{user.email}</p>
            <div className="w-16 h-px bg-primary mt-6" />
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end lg:items-end mt-6 lg:mt-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 border border-primary px-6 py-4 font-ui-button text-ui-button uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="px-gutter md:px-margin-edge py-10 border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Bookings', value: stats.totalBookings ?? 0 },
              { label: 'Completed', value: stats.completedBookings ?? 0 },
              { label: 'Cancelled', value: stats.cancelledBookings ?? 0 },
              { label: 'Total Spent', value: `$${stats.totalSpent ?? 0}` },
            ].map((s, i) => (
              <div key={i}>
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-3">{s.label}</span>
                <div className="font-display-xl text-[36px] text-primary leading-none">{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="px-gutter md:px-margin-edge pt-12">
        <div className="max-w-[1440px] mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-12">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-4 font-ui-label text-ui-label uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab === 'profile' ? 'Profile Info' : tab === 'security' ? 'Security' : 'Photo'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-px bg-primary" />}
              </button>
            ))}
          </div>

          <div className="max-w-lg">
            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <FormField label="Full Name">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                    className={INPUT_CLS}
                    required
                  />
                </FormField>

                <FormField label="Email Address">
                  <input type="email" value={user.email} disabled className={`${INPUT_CLS} opacity-50 cursor-not-allowed`} />
                  <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                    Email address cannot be changed
                  </p>
                </FormField>

                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    className={INPUT_CLS}
                    placeholder="Enter phone number"
                  />
                </FormField>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <FormField label="Current Password">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                    className={INPUT_CLS}
                    required
                    placeholder="Enter current password"
                  />
                </FormField>

                <FormField label="New Password">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                    className={INPUT_CLS}
                    required
                    placeholder="Enter new password"
                  />
                </FormField>

                <FormField label="Confirm New Password">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    className={INPUT_CLS}
                    required
                    placeholder="Confirm new password"
                  />
                </FormField>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={e => setShowPasswords(e.target.checked)}
                    className="h-4 w-4 border-outline-variant text-primary bg-transparent cursor-pointer"
                  />
                  <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                    Show Passwords
                  </span>
                </label>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Photo Tab ── */}
            {activeTab === 'photo' && (
              <div className="space-y-8">
                <div>
                  <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
                    Current Photo
                  </span>
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-32 h-32 object-cover border border-primary grayscale"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-surface-container-high border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-outline-variant pt-6">
                  <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-6">
                    Upload New Photo
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={photoLoading}
                    className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {photoLoading ? 'Uploading...' : 'Choose Photo'}
                  </button>
                  <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-4">
                    Supported formats: JPG, PNG, WebP. Maximum 5MB.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div className="group">
    <label className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary">
      {label}
    </label>
    {children}
  </div>
);

export default Profile;
