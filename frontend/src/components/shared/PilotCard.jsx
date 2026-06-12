import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined text-[12px] ${
          i < Math.floor(rating) ? 'text-primary' : 'text-outline-variant'
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
    ))}
  </div>
);

const PilotCard = ({ pilot, index = 0 }) => {
  const hasRating   = pilot.rating > 0;
  const hasPhoto    = pilot.profilePhoto && !pilot.profilePhoto.includes('ui-avatars');
  const initials    = (pilot.name || 'DP').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      viewport={{ once: true }}
      className="group flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[3/4] bg-surface-container-high overflow-hidden mb-0">
        {hasPhoto ? (
          <img
            src={pilot.profilePhoto}
            alt={pilot.name}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="w-full h-full object-cover grayscale opacity-85 group-hover:scale-[1.03] transition-transform duration-700"
            loading="lazy"
          />
        ) : null}
        {/* Fallback image */}
        <div
          className="absolute inset-0 bg-surface-container flex items-center justify-center"
          style={{ display: hasPhoto ? 'none' : 'flex' }}
        >
          <img
            src="/driver.png"
            alt="Driver"
            className="w-32 h-32 object-contain opacity-20 select-none"
          />
        </div>

        {/* Status pill */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {pilot.isAvailable ? (
            <span className="inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-primary px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              <span className="font-ui-label text-[10px] uppercase tracking-widest text-primary">Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-outline-variant px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant inline-block" />
              <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">Busy</span>
            </span>
          )}
          {pilot.status === 'active' && (
            <span className="inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-primary/50 px-2.5 py-1">
              <span className="material-symbols-outlined text-[11px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-ui-label text-[9px] uppercase tracking-widest text-primary">Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Info block ── */}
      <div className="border-t border-primary pt-4 pb-5 flex flex-col gap-3 flex-1">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-headline-lg text-[18px] md:text-[22px] text-primary leading-tight">
            {pilot.name || 'Unknown Pilot'}
          </h3>
          {hasRating ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-numbers text-[20px] text-primary leading-none tabular-nums">
                {pilot.rating.toFixed(1)}
              </span>
              <StarRating rating={pilot.rating} />
            </div>
          ) : (
            <span className="shrink-0 border border-outline-variant px-2 py-0.5 font-ui-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              New
            </span>
          )}
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {pilot.vehicleTypes?.slice(0, 3).map(v => (
            <span key={v} className="border border-outline-variant px-2 py-0.5 font-ui-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              {v}
            </span>
          ))}
          {pilot.experience > 0 && (
            <span className="border border-outline-variant px-2 py-0.5 font-ui-label text-[9px] uppercase tracking-widest text-on-surface-variant">
              {pilot.experience} yrs
            </span>
          )}
        </div>

        {/* Languages */}
        {pilot.languages?.length > 0 && (
          <p className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
            {pilot.languages.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Rate + CTA */}
        <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="font-numbers text-[28px] text-primary leading-none tabular-nums">
              ₹{pilot.hourlyRate || 0}
            </span>
            <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">/hr</span>
          </div>
          <Link
            to={`/pilot/${pilot._id}`}
            className="inline-flex items-center gap-1.5 font-ui-label text-[10px] uppercase tracking-widest text-primary border-b border-transparent hover:border-primary transition-all duration-200 pb-0.5"
          >
            View Profile
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform duration-200">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PilotCard;
