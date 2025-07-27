import React from 'react';
import styles from './Legal.module.css';

const CookiePolicy = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <h1>Cookie Policy</h1>
        <p className={styles.lastUpdated}>Last updated: July 24, 2025</p>

        <section>
          <h2>1. What Are Cookies</h2>
          <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.</p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly (authentication, security)</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Help us improve our website by collecting usage information</li>
          </ul>
        </section>

        <section>
          <h2>3. Types of Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <p>These cookies are necessary for the website to function and cannot be disabled. They include:</p>
          <ul>
            <li>Authentication cookies to keep you logged in</li>
            <li>Security cookies to protect against fraud</li>
            <li>Session cookies to maintain your current session</li>
          </ul>

          <h3>Performance and Analytics Cookies</h3>
          <p>These cookies help us understand how our website is used:</p>
          <ul>
            <li>Google Analytics cookies to track page views and user behavior</li>
            <li>Error tracking cookies to identify and fix issues</li>
            <li>Performance monitoring cookies to ensure fast loading times</li>
          </ul>

          <h3>Functional Cookies</h3>
          <p>These cookies remember your preferences:</p>
          <ul>
            <li>Language and region preferences</li>
            <li>Display settings and theme preferences</li>
            <li>Search history and recently viewed content</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>Some cookies are placed by third-party services that appear on our pages:</p>
          <ul>
            <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
            <li><strong>Social Media:</strong> For sharing content on social platforms</li>
            <li><strong>Payment Processors:</strong> For secure payment processing (if applicable)</li>
          </ul>
        </section>

        <section>
          <h2>5. Managing Your Cookie Preferences</h2>
          <p>You can control and manage cookies in several ways:</p>
          <ul>
            <li><strong>Browser Settings:</strong> Most browsers allow you to manage cookies through settings</li>
            <li><strong>Cookie Consent:</strong> We provide options to accept or decline non-essential cookies</li>
            <li><strong>Third-Party Opt-Out:</strong> You can opt out of third-party analytics services</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookie Duration</h2>
          <p>Cookies on our website may be:</p>
          <ul>
            <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Accept or decline non-essential cookies</li>
            <li>Delete existing cookies through your browser settings</li>
            <li>Set your browser to refuse cookies</li>
            <li>Be informed about what cookies we use and why</li>
          </ul>
        </section>

        <section>
          <h2>8. Updates to This Policy</h2>
          <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.</p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at privacy@join-encore.com</p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy; 