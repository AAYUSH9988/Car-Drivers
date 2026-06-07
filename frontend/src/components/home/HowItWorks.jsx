import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Step = ({ number, title, description, isLast }) => {
  return (
    <div className="flex items-start relative">
      {/* Vertical divider line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 w-px h-[calc(100%-24px)] bg-outline-variant" />
      )}

      <div className="flex-shrink-0 w-8 h-8 border border-primary flex items-center justify-center mr-6">
        <span className="font-ui-label text-ui-label text-primary">{number}</span>
      </div>

      <div className="pb-12">
        <h3 className="font-headline-lg text-[20px] text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Define Your Route',
      description: 'Enter pickup and destination locations along with preferred date and time.'
    },
    {
      number: '02',
      title: 'Select Your Pilot',
      description: 'Browse curated profiles, ratings, and vehicle details.'
    },
    {
      number: '03',
      title: 'Confirm & Reserve',
      description: 'Secure your booking with a streamlined payment process.'
    },
    {
      number: '04',
      title: 'Arrive in Style',
      description: 'Experience precision logistics with professional chauffeurs.'
    }
  ];

  return (
    <section className="w-full pb-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        {/* Left: Steps */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Process
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              How It Works
            </h2>
          </motion.div>

          <div className="relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Step
                  {...step}
                  isLast={index === steps.length - 1}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Image + CTA */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative h-full min-h-[500px]"
          >
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Luxury chauffeur service"
              loading="lazy"
              className="w-full h-full object-cover grayscale opacity-80"
            />
            {/* Hard Overlap CTA */}
            <div className="absolute bottom-0 right-0 bg-background border-t border-l border-primary p-6 md:p-8 max-w-sm">
              <h3 className="font-headline-lg text-[20px] md:text-[24px] text-primary mb-3">
                Ready to Book?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Experience premium transportation with our professional pilots.
              </p>
              <Link
                to="/pilots"
                className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-3 tracking-widest hover:bg-on-surface transition-colors duration-300"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
