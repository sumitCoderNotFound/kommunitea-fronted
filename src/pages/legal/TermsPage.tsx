import { LegalLayout, H2 } from "./LegalLayout";

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>By using Kommunitea you agree to these Terms. Kommunitea is operated by Sumit Malviya as an independent project. If you do not agree, please do not use the platform.</p>
      <p className="rounded-xl bg-sand-card p-4 text-sm text-ink-muted">This document is provided for transparency and is not legal advice.</p>

      <H2>Eligibility</H2>
      <p>You must be at least 16 years old to use Kommunitea. You are responsible for keeping your login details secure.</p>

      <H2>Acceptable use</H2>
      <p>You agree to use Kommunitea respectfully and lawfully. You must not post content that is harmful, harassing, hateful, fraudulent, illegal, or that infringes others' rights. We may remove content or suspend accounts that break these rules or our Community Guidelines.</p>

      <H2>Your content</H2>
      <p>You keep ownership of the content you post. By posting, you grant Kommunitea permission to display that content within the platform so it functions as a community. You are responsible for the content you share.</p>

      <H2>Jobs and listings</H2>
      <p>Kommunitea does not guarantee the accuracy of job postings or other listings shared by users. Users should perform their own due diligence before applying or acting on any post.</p>

      <H2>Accommodation</H2>
      <p>Kommunitea acts only as a platform connecting users. We do not verify landlords, properties, or rental agreements. Please exercise caution and never send money without proper checks.</p>

      <H2>Disclaimer and liability</H2>
      <p>Kommunitea is provided "as is" as an early-stage community. To the extent permitted by law, we are not liable for interactions between users, content posted by users, or decisions you make based on information found on the platform.</p>

      <H2>Changes</H2>
      <p>We may update these Terms as the platform develops. Continued use after changes means you accept the updated Terms.</p>

      <H2>Contact</H2>
      <p>Questions about these Terms? Contact malviyasumit2000@gmail.com.</p>
    </LegalLayout>
  );
}
