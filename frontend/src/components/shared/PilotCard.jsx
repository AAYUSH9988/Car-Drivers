import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const defaultPilotImage = "https://ui-avatars.com/api/?name=Default+Pilot&background=random";

const PilotCard = ({ pilot, index = 0 }) => {
  const imageUrl = pilot.profilePhoto || defaultPilotImage;

  const handleImageError = (e) => {
    e.target.src = defaultPilotImage;
    e.target.onerror = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      viewport={{ once: true }}
      className="border-t border-primary pt-6 group"
    >
      {/* Image */}
      <div className="relative h-64 md:h-72 bg-surface-container-high overflow-hidden mb-6">
        <img
          src={imageUrl}
          alt={pilot.name}
          onError={handleImageError}
          className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
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
          {pilot.rating?.toFixed(1) || '4.5'}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-6">
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
          {pilot.vehicleTypes?.length > 0 ? pilot.vehicleTypes.join(' / ') : 'Not specified'}
        </p>
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
          {pilot.languages?.length > 0 ? pilot.languages.join(' / ') : 'Not specified'}
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
          View Profile
          <span className="material-symbols-outlined text-[16px] ml-2">arrow_forward</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default PilotCard;
