import usePageTitle from '../hooks/usePageTitle';

const Terms = () => {
  usePageTitle('Terms of Service');

  return (
    <div className="min-h-screen bg-surface px-gutter md:px-margin-edge py-20 max-w-[860px] mx-auto">
      <div className="mb-12 border-b border-primary pb-8">
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
          Legal
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
          Terms of Service
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Last updated: June 2026
        </p>
      </div>

      <div className="space-y-10 font-body-md text-body-md text-on-surface leading-relaxed">
        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using GoPilot services, you accept and agree to be bound by these Terms of
            Service. If you do not agree, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">2. Service Description</h2>
          <p>
            GoPilot provides a platform connecting clients with professional chauffeur-driven vehicle
            services. We act as an intermediary and are not directly responsible for the actions of
            independent pilots (drivers) on the platform.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">3. User Responsibilities</h2>
          <p>
            Users must provide accurate information during registration, treat pilots with respect, and
            comply with all applicable laws. Misuse of the platform may result in account suspension.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">4. Bookings & Cancellations</h2>
          <p>
            Bookings confirmed on the platform are binding. Cancellations must be made at least 2 hours
            before the scheduled start time. Late cancellations may incur a fee.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">5. Limitation of Liability</h2>
          <p>
            GoPilot shall not be liable for indirect, incidental, or consequential damages arising from
            use of the service. Our maximum liability is limited to the amount paid for the specific
            booking in question.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of the platform after
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="font-headline-lg text-[20px] text-primary mb-4">7. Contact</h2>
          <p>
            For questions regarding these terms, contact us at{' '}
            <a href="mailto:legal@gopilot.app" className="text-primary border-b border-primary hover:opacity-70 transition-opacity">
              legal@gopilot.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
