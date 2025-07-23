import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useConcerts } from '../../contexts/ConcertContext';

const Profile = () => {
  const { user } = useAuth();
  const { personalConcerts } = useConcerts();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: 'New York, NY', // Default location
    profileImage: '/mock/user1.jpg'
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    newComments: true,
    friendActivity: true,
    concertReminders: false,
    emailDigest: true
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // TODO: Implement profile update logic
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1>Profile Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className={styles.content}>
        <Card className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImage}>
              <img src={profileData.profileImage} alt="Profile" />
              {isEditing && (
                <button className={styles.changePhoto}>
                  Change Photo
                </button>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h2>{profileData.name}</h2>
              <p>{profileData.location}</p>
              <p className={styles.stats}>
                <span>{personalConcerts.filter(concert => concert.rating).length} concerts ranked</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className={styles.formSection}>
              <h3>Personal Information</h3>
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <div className={styles.formActions}>
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" secondary onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className={styles.profileDetails}>
                  <div className={styles.detailRow}>
                    <label>Full Name</label>
                    <p>{profileData.name}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Email</label>
                    <p>{profileData.email}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Location</label>
                    <p>{profileData.location}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </div>
          </form>
        </Card>

        <Card className={styles.settingsCard}>
          <h3>Notification Preferences</h3>
          <div className={styles.notificationSettings}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Comments on Your Rankings</h4>
                <p>Get notified when someone comments on your concert rankings</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.newComments}
                  onChange={() => handleNotificationToggle('newComments')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Friend Activity</h4>
                <p>Get notified when friends add new concert rankings</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.friendActivity}
                  onChange={() => handleNotificationToggle('friendActivity')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Concert Reminders</h4>
                <p>Get reminded to rank concerts after attending them</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.concertReminders}
                  onChange={() => handleNotificationToggle('concertReminders')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Weekly Email Digest</h4>
                <p>Receive a weekly summary of your friends' concert rankings</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.emailDigest}
                  onChange={() => handleNotificationToggle('emailDigest')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </Card>

        <Card className={styles.dangerCard}>
          <h3>Danger Zone</h3>
          <div className={styles.dangerActions}>
            <div className={styles.dangerAction}>
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all your concert rankings</p>
              </div>
              <Button secondary className={styles.deleteButton}>
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 