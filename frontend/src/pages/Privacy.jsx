import usePageTitle from '../hooks/usePageTitle';

const Privacy = () => {
  usePageTitle('Privacy Policy');

  return (
    <div className="min-h-screen bg-surface px-gutter md:px-margin-edge py-20 max-w-[860px] mx-auto">
      <div className="mb-12 border-b border-primary pb-8">
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
          Legal
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
          Privacy Policy
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Last updated: June 2026
        </p>
      </div>

      <div className="space-y-10 font-body-md text-body-md text-on-surface leading-relaxed">
        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide when registering (name, email, phone), booking data
            (locations, dates, payment details), and usage data (pages visited, features used).
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">2. How We Use Your Data</h2>
          <p>
            Your data is used to process bookings, communicate service updates, improve platform
            performance, and comply with legal obligations. We do not sell your personal data to third
            parties.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">3. Data Storage & Security</h2>
          <p>
            Data is stored on secured servers with industry-standard encryption. Passwords are hashed
            and never stored in plain text. Profile photos are stored via ImageKit with access controls.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">4. Cookies</h2>
          <p>
            We use session cookies for authentication and local storage to persist your login state.
            No third-party tracking cookies are used.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time
            by contacting us. Account deletion removes all associated personal data within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">6. Contact</h2>
          <p>
            For privacy concerns, email us at{' '}
            <a href="mailto:privacy@gopilot.app" className="text-primary border-b border-primary hover:opacity-70 transition-opacity">
              privacy@gopilot.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
