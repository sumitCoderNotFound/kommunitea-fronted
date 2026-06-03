import { LegalLayout, H2 } from "./LegalLayout";

export function ContactPage() {
  return (
    <LegalLayout title="Contact Us" updated="June 2026">
      <p>We'd love to hear from you, whether it's feedback, a question, a bug, or a safety concern.</p>
      <H2>Email</H2>
      <p>Reach us at <a href="mailto:malviyasumit2000@gmail.com" className="font-medium text-coral hover:underline">malviyasumit2000@gmail.com</a>. We aim to respond as soon as we can.</p>
      <H2>Safety & data requests</H2>
      <p>For reports about user behaviour, content concerns, or data requests (accessing or deleting your data), email the same address and we'll help. You can also manage your data directly from your account Settings.</p>
    </LegalLayout>
  );
}
