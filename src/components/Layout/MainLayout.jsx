import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';
import Button from '../UI/Button/Button';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/landing'); // Use React Router navigation
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              <h1>Encore</h1>
              <span className={styles.tagline}>Your Concert Memory Collection</span>
            </Link>
          </div>

          {user ? (
            <div className={styles.navActions}>
              <div className={styles.navLinks}>
                <Link to="/friends" className={styles.navLink}>Friends</Link>
                <Link to="/stats" className={styles.navLink}>Stats</Link>
              </div>
              
              <div className={styles.userMenu}>
                <button 
                  className={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <img 
                    src="/mock/user1.jpg" 
                    alt="Profile" 
                    className={styles.userAvatar}
                  />
                  <span className={styles.userName}>{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className={styles.userDropdown}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <span className={styles.icon}>👤</span>
                      Profile
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem}>
                      <span className={styles.icon}>⚙️</span>
                      Settings
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <span className={styles.icon}>🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Button secondary onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSections}>
            <div className={styles.footerSection}>
              <h4>About</h4>
              <Link to="/about">About Us</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/feedback">Feedback</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Follow Us</h4>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>Twitter</a>
                <a href="#" className={styles.socialLink}>Instagram</a>
                <a href="#" className={styles.socialLink}>Facebook</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 Encore - Your Personal Concert Ranking Platform</p>
            <select className={styles.languageSelect}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 