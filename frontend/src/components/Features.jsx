import { motion } from 'framer-motion';
import { FaShieldAlt, FaClock, FaStar, FaUserTie } from 'react-icons/fa';

const features = [
  {
    number: '01',
    icon: <FaShieldAlt className="h-5 w-5" />,
    title: 'Verified Pilots',
    description: 'Comprehensive background checks and verification standards ensure absolute trust.'
  },
  {
    number: '02',
    icon: <FaClock className="h-5 w-5" />,
    title: '24/7 Availability',
    description: 'Precision scheduling — book any time, day or night, with guaranteed response.'
  },
  {
    number: '03',
    icon: <FaStar className="h-5 w-5" />,
    title: 'Top Rated Service',
    description: 'Peerless standards maintained through rigorous quality control and client feedback.'
  },
  {
    number: '04',
    icon: <FaUserTie className="h-5 w-5" />,
    title: 'Professional Training',
    description: 'Advanced protocols in safety, discretion, and etiquette define our pilots.'
  }
];

const Features = () => {
  return (
    <section className="w-full pb-section-gap">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
          Standards
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
          The Distinction
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="border-t border-primary pt-6 pb-8 md:pr-8"
          >
            <span className="font-display-xl text-[32px] text-primary leading-none block mb-6">
              {feature.number}
            </span>
            <h3 className="font-headline-lg text-[18px] md:text-[20px] text-primary mb-3">
              {feature.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
