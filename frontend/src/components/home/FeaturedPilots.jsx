import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

// Import local pilot images
import pilot1Image from '@/assets/images/pilots/pilot2.jpg';
import pilot2Image from '@/assets/images/pilots/pilot4.jpg';
import pilot3Image from '@/assets/images/pilots/pilot5.jpg';

const PilotCard = ({ pilot, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="border-t border-primary pt-6 group"
  >
    {/* Image */}
    <div className="relative h-64 md:h-72 bg-surface-container-high overflow-hidden mb-6">
      <img
        src={pilot.profilePhoto}
        alt={pilot.name}
        className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700"
      />
      {pilot.isAvailable && (
        <div className="absolute bottom-0 left-0 bg-background border-t border-r border-primary px-3 py-2">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-primary">
            Available
          </span>
        </div>
      )}
    </div>

    {/* Name & Rating */}
    <div className="flex justify-between items-start mb-4">
      <h3 className="font-headline-lg text-[20px] md:text-[24px] text-primary">
        {pilot.name}
      </h3>
      <span className="font-display-xl text-[32px] text-primary leading-none">
        {pilot.rating}
      </span>
    </div>

    {/* Details */}
    <div className="space-y-2 mb-6">
      <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
        {pilot.vehicleTypes.join(' / ')}
      </p>
      <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
        {pilot.languages.join(' / ')}
      </p>
    </div>

    {/* Rate & CTA */}
    <div className="flex items-center justify-between border-t border-outline-variant pt-4">
      <div>
        <span className="font-display-xl text-[32px] text-primary leading-none">
          ${pilot.hourlyRate}
        </span>
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant ml-2">
          /hr
        </span>
      </div>
      <Link
        to={`/pilot/${pilot._id}`}
        className="inline-flex items-center font-ui-label text-ui-label uppercase tracking-widest text-primary hover:text-on-surface-variant transition-colors duration-300"
      >
        View
        <FaArrowRight className="ml-2 w-3 h-3" />
      </Link>
    </div>
  </motion.div>
);

const FeaturedPilots = () => {
  const featuredPilots = [
    {
      _id: "1",
      name: "David Johnson",
      profilePhoto: pilot1Image,
      rating: 4.9,
      vehicleTypes: ["Sedan", "SUV", "Luxury"],
      languages: ["English", "French"],
      hourlyRate: 45,
      isAvailable: true,
    },
    {
      _id: "2",
      name: "Sarah Williams",
      profilePhoto: pilot2Image,
      rating: 4.8,
      vehicleTypes: ["Luxury", "Premium"],
      languages: ["English", "Spanish"],
      hourlyRate: 50,
      isAvailable: true,
    },
    {
      _id: "3",
      name: "Michael Rodriguez",
      profilePhoto: pilot3Image,
      rating: 4.7,
      vehicleTypes: ["SUV", "Van"],
      languages: ["English", "Spanish", "Portuguese"],
      hourlyRate: 40,
      isAvailable: false,
    }
  ];

  return (
    <section className="w-full pb-section-gap">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="border-t border-primary pt-6 mb-12"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Featured
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              The Pilots
            </h2>
          </div>
          <Link
            to="/pilots"
            className="inline-flex items-center font-ui-label text-ui-label uppercase tracking-widest text-primary hover:text-on-surface-variant transition-colors duration-300 border border-primary px-6 py-3 self-start md:self-auto"
          >
            View All
            <FaArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* Pilot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {featuredPilots.map((pilot, index) => (
          <PilotCard key={pilot._id} pilot={pilot} index={index} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedPilots;
