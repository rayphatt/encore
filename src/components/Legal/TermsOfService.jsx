import React from 'react';
import styles from './Legal.module.css';

const TermsOfService = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: July 24, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Encore ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>Encore is a concert memory collection platform that allows users to:</p>
          <ul>
            <li>Record and rate concert experiences</li>
            <li>View global concert rankings</li>
            <li>Share concert memories and notes</li>
            <li>Connect with other music enthusiasts</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>To use certain features of the Service, you must create an account. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Post false, misleading, or inappropriate content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2>5. Content and Intellectual Property</h2>
          <p>You retain ownership of content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive license to use, display, and distribute your content in connection with the Service.</p>
          <p>You represent that you have the right to share any content you submit and that it does not violate any third-party rights.</p>
        </section>

        <section>
          <h2>6. Privacy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.</p>
        </section>

        <section>
          <h2>7. Service Availability</h2>
          <p>We strive to provide reliable service but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.</p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Encore shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use.</p>
        </section>

        <section>
          <h2>9. Termination</h2>
          <p>We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice. You may also terminate your account at any time by contacting us.</p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. We will notify users of material changes by posting the new terms on this page and updating the "Last updated" date.</p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Encore operates, without regard to its conflict of law provisions.</p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at legal@join-encore.com</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 