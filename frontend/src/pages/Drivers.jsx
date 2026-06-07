import { useEffect, useState } from 'react';
import { FaSearch, FaSlidersHorizontal, FaXmark } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import driverService from '../services/driverService';

/* ─── Editorial Drivers Page ─── */

const PILOT_IMAGES = import.meta.glob('/src/assets/images/pilots/pilot*.jpg', { eager: true });
const getPilotImage = (id) => PILOT_IMAGES[`/src/assets/images/pilots/pilot${id}.jpg`]?.default || '';

const vehicleTypes = ['All', 'Sedan', 'SUV', 'Luxury', 'Van', 'Premium'];

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: '',
    minRating: '',
    maxPrice: '',
    availability: false,
  });

  /* fetch */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await driverService.getAvailableDrivers?.() || await driverService.getAllDrivers();
        if (mounted) {
          setDrivers(data);
          setFiltered(data);
        }
      } catch (err) {
        if (mounted) setError('Failed to load available pilots. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  /* apply filters */
  useEffect(() => {
    let results = [...drivers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      results = results.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.vehicleTypes?.some(v => v.toLowerCase().includes(q))
      );
    }

    if (filters.vehicleType && filters.vehicleType !== 'All') {
      results = results.filter(d =>
        d.vehicleTypes?.some(v => v.toLowerCase() === filters.vehicleType.toLowerCase())
      );
    }

    if (filters.minRating) {
      const min = parseFloat(filters.minRating);
      results = results.filter(d => (d.rating || 0) >= min);
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      results = results.filter(d => (d.hourlyRate || 0) <= max);
    }

    if (filters.availability) {
      results = results.filter(d => d.isAvailable);
    }

    setFiltered(results);
  }, [searchTerm, filters, drivers]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ vehicleType: '', minRating: '', maxPrice: '', availability: false });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <div className="w-px h-12 bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* ── Hero ── */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
            The Fleet
          </span>
          <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-lg text-primary tracking-tighter max-w-[12ch]">
            Available Pilots
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-lg">
            Browse our curated roster of elite driving professionals.
          </p>
        </div>
      </section>

      {/* ── Search & Filters Toolbar ── */}
      <section className="sticky top-16 md:top-20 z-30 bg-surface border-b border-outline-variant px-gutter md:px-margin-edge py-4">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or vehicle type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 pl-8 pr-4 py-2 font-body-md text-body-md text-primary placeholder-outline-variant outline-none transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(s => !s)}
            className="inline-flex items-center gap-2 font-ui-label text-ui-label uppercase tracking-widest text-primary border border-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-colors self-start md:self-auto"
          >
            <FaSlidersHorizontal className="w-3 h-3" />
            Filters
            {(filters.vehicleType || filters.minRating || filters.maxPrice || filters.availability) && (
              <span className="w-2 h-2 bg-tertiary-container" />
            )}
          </button>

          {(searchTerm || filters.vehicleType || filters.minRating || filters.maxPrice || filters.availability) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              <FaXmark className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto mt-6 pt-6 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Vehicle Type */}
            <div>
              <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
                Vehicle Type
              </label>
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters(f => ({ ...f, vehicleType: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 font-body-md text-body-md text-primary outline-none cursor-pointer"
              >
                {vehicleTypes.map(t => (
                  <option key={t} value={t === 'All' ? '' : t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(f => ({ ...f, minRating: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 font-body-md text-body-md text-primary outline-none cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
                Max Price / hr
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 font-body-md text-body-md text-primary placeholder-outline-variant outline-none"
              />
            </div>

            {/* Availability Toggle */}
            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availability}
                  onChange={(e) => setFilters(f => ({ ...f, availability: e.target.checked }))}
                  className="h-4 w-4 border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface bg-transparent cursor-pointer"
                />
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                  Available Now
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Results Count ── */}
      <section className="px-gutter md:px-margin-edge py-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
            {filtered.length} Pilot{filtered.length !== 1 ? 's' : ''} Available
          </p>
          {drivers.length > 0 && filtered.length !== drivers.length && (
            <p className="font-ui-label text-ui-label uppercase tracking-widest text-primary">
              {drivers.length - filtered.length} filtered out
            </p>
          )}
        </div>
      </section>

      {/* ── Pilots Grid ── */}
      <section className="px-gutter md:px-margin-edge pb-section-gap">
        <div className="max-w-[1440px] mx-auto">
          {error && (
            <div className="border border-error/30 bg-error-container/20 p-6 mb-8">
              <p className="font-ui-label text-ui-label uppercase tracking-widest text-error">{error}</p>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filtered.map((pilot, i) => (
                <PilotCard key={pilot._id || i} pilot={pilot} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="font-display-lg text-display-lg text-primary mb-4">No matches</p>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                Adjust your filters to discover more pilots.
              </p>
              <button
                onClick={clearFilters}
                className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ─── Pilot Card (Editorial) ─── */
const PilotCard = ({ pilot, index }) => {
  const imageUrl = pilot.profilePhoto || getPilotImage(((index % 5) + 1));

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
          {pilot.vehicleTypes?.join(' / ') || 'Sedan'}
        </p>
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
          {pilot.languages?.join(' / ') || 'English'}
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

export default Drivers;
