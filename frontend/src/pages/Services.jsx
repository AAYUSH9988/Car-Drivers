import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const services = [
  {
    id: 1,
    title: 'Personal Driver',
    description: 'Dedicated chauffeuring for the discerning individual. Your schedule, executed with absolute discretion.',
    icon: 'person',
    features: ['On-demand availability', 'Route optimization', 'Privacy guaranteed'],
    price: 'From $150/hr',
    offset: 'md:col-start-2',
  },
  {
    id: 2,
    title: 'Airport Transfer',
    description: 'Seamless transitions between ground and air. Timing calculated to the minute.',
    icon: 'flight_takeoff',
    features: ['Flight tracking', 'Curbside coordination', 'Luggage handling'],
    price: 'From $200',
    offset: 'md:col-start-8 md:mt-32',
  },
  {
    id: 3,
    title: 'Event Transportation',
    description: 'Flawless logistics for high-profile gatherings. We manage the movement so you can focus on the moment.',
    icon: 'event',
    features: ['Fleet coordination', 'VIP handling', 'On-site management'],
    price: 'Custom Quote',
    offset: 'md:col-start-1',
  },
  {
    id: 4,
    title: 'Hourly Service',
    description: 'Fluid adaptability. Retain a vehicle and pilot for as long as your itinerary demands.',
    icon: 'schedule',
    features: ['Ultimate flexibility', 'Multiple stops', 'Standby readiness'],
    price: 'From $120/hr',
    offset: 'md:col-start-8 md:-mt-24',
  },
];

const stats = [
  { value: '500+', label: 'Elite Pilots' },
  { value: '15+', label: 'Global Cities' },
  { value: '0.01%', label: 'Acceptance Rate' },
];

const Services = () => {
  return (
    <div className="w-full bg-background">
      {/* ── Hero ── */}
      <section className="pt-24 md:pt-section-gap pb-16 md:pb-32 px-gutter md:px-margin-edge">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative">
            <div className="lg:col-span-8 lg:col-start-2">
              <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-lg lg:text-display-xl text-primary mb-8 leading-none">
                The Architecture of Movement.
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
                A curated approach to transportation. We blend precision logistics with unparalleled comfort, ensuring every journey is an exhibition of flawless execution.
              </p>
            </div>
            <div className="col-span-12 mt-12 md:mt-16 relative aspect-[21/9] lg:col-span-10 lg:col-start-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBma-3Z9T95ry3fBbVaW7MIkSrTjm2ONCvhhWJhlEXD2INJzn1FgCP1D3dEDxA4tbHPL69OkajxN_iSWaDs6nkAOyfceHtOq3JZk-OX7i0t96frAK-fcR6aE4n5pK663S-jzD8-y-DNr9rE1pHOyP0PWS8gXh1jLOi2a7TLZ0xG4exfBPeaVKCw0FXbAvsqX4l9KAMIjTEiR6ONSjTZdIw_ANue9--xJdSO8dKELMFOaotaMFrEVJIF_V7veLpb_iCCsCLDLk_EiE4"
                alt="Luxury car interior"
                className="w-full h-full object-cover grayscale opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="mb-section-gap px-gutter md:px-margin-edge">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter gap-y-24 relative">
          {services.map((service) => (
            <div
              key={service.id}
              className={`col-span-1 md:col-span-5 ${service.offset} border-t border-primary pt-6`}
            >
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
                {service.icon}
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
                {service.title}
              </h2>
              <p className="font-body-md text-body-md text-secondary mb-6">
                {service.description}
              </p>
              <ul className="font-ui-label text-ui-label text-primary mb-8 space-y-2 uppercase tracking-widest">
                {service.features.map((f, i) => (
                  <li key={i} className="border-b border-surface-variant pb-1">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="font-ui-label text-ui-label text-secondary uppercase tracking-widest">
                {service.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 md:py-32 px-gutter md:px-margin-edge bg-surface border-t border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="font-display-lg text-display-lg text-primary mb-2">{s.value}</p>
              <p className="font-ui-label text-ui-label text-secondary uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge text-center">
        <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary mb-6 max-w-4xl mx-auto">
          Elevate your transit.
        </h2>
        <p className="font-body-lg text-body-lg text-secondary max-w-xl mb-12 mx-auto">
          Experience the zenith of vehicular choreography. Reserve your GoPilot today.
        </p>
        <Link
          to="/pilots"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-surface-tint transition-colors duration-300 w-full md:w-auto"
        >
          Enlist Your Pilot
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </section>
    </div>
  );
};

export default Services;
