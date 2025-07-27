import React from 'react';
import styles from './Legal.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: July 24, 2025</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, add concert experiences, or contact us for support. This may include:</p>
          <ul>
            <li>Name and email address for account creation</li>
            <li>Concert information you choose to share (artist names, venues, dates, ratings, notes)</li>
            <li>Profile information and preferences</li>
            <li>Communications with our support team</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your concert entries and rankings</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Develop new features and services</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
          <ul>
            <li>With your explicit permission</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of certain communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section>
          <h2>8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at privacy@join-encore.com</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 