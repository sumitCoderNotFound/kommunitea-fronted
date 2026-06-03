import { LegalLayout, H2 } from "./LegalLayout";

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>This Privacy Policy explains how Kommunitea collects, uses, and protects your personal data. Kommunitea is currently operated by Sumit Malviya as an independent project. Sumit Malviya is the data controller responsible for the personal data processed through the platform.</p>
      <p className="rounded-xl bg-sand-card p-4 text-sm text-ink-muted">This document is provided for transparency and is not legal advice. It will be reviewed and expanded as Kommunitea grows.</p>

      <H2>Who can use Kommunitea</H2>
      <p>Kommunitea is intended for users aged 16 and over. By creating an account you confirm that you are at least 16 years old.</p>

      <H2>What data we collect</H2>
      <p>We collect the information you provide and generate when using the platform, including: your name, email address, university or employer details, course or job title, city, profile information (bio, skills, interests, links), the posts and stories you create, and the messages you send to other users. We also record basic usage information such as your daily visit streak.</p>

      <H2>Why we collect it</H2>
      <p>We use your data to create and operate your account, to power core features (your profile, the community feed, messaging, notifications and streaks), to connect you with other members, and to keep the community safe through moderation. We do not sell your personal data.</p>

      <H2>Legal basis</H2>
      <p>Under UK GDPR, we process your data on the basis of performing our service to you (your account and its features) and our legitimate interest in running a safe, useful community.</p>

      <H2>How long we keep it</H2>
      <p>We keep your data for as long as your account is active. If you delete your account, your personal data is removed from our active systems.</p>

      <H2>Your rights</H2>
      <p>Under UK GDPR you have the right to access the data we hold about you, to correct it, and to have it deleted. You can download a copy of your data and delete your account at any time from your account Settings. You may also contact us directly to exercise these rights.</p>

      <H2>Data sharing</H2>
      <p>We use trusted infrastructure providers to host the platform and database. Your data is stored securely with these providers solely to operate Kommunitea. We do not share your data with advertisers.</p>

      <H2>Contact</H2>
      <p>For any privacy questions or data requests, contact us at malviyasumit2000@gmail.com.</p>
    </LegalLayout>
  );
}
