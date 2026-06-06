import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaStar, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const Hero = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    date: '',
    time: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/pilots', { state: { ...searchParams } });
  };

  const handleBookNow = () => {
    navigate('/pilots');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-base/95 via-bg-base/85 to-bg-surface/80" />
        <img
          src="/src/assets/images/vehicles/luxury.jpg"
          alt="Luxury car"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5">
              <FaStar className="text-gold text-xs" />
              <span className="text-gold text-sm font-medium">Trusted by 10,000+ riders</span>
            </div>

            <div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                Your Professional<br />
                <span className="text-gold">Driver</span>, Anywhere.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed">
                Safe, verified, always on time. Book professional drivers for city transfers,
                airport pickups, corporate travel and special events.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={handleBookNow}
                className="px-8 py-3.5 bg-gradient-gold text-bg-base font-semibold rounded-xl
                  hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 font-heading text-base"
              >
                Book a Driver
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-3.5 border border-electric text-electric font-semibold rounded-xl
                  hover:bg-electric/10 active:scale-[0.98] transition-all duration-200"
              >
                Learn More
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <TrustIcon icon={<FaCheckCircle className="text-emerald" />} text="Verified" />
              <TrustIcon icon={<FaStar className="text-gold" />} text="4.9 Rating" />
              <TrustIcon icon={<FaShieldAlt className="text-electric" />} text="Insured" />
            </div>
          </div>

          {/* Right — Search Form */}
          <div className="bg-bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-card">
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">
              Find Your Driver
            </h2>

            <form onSubmit={handleSearch} className="space-y-5">
              <FormField
                label="Pickup Location"
                icon={<FaMapMarkerAlt className="text-text-muted" />}
                name="location"
                type="text"
                placeholder="Enter pickup address"
                value={searchParams.location}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date"
                  icon={<FaCalendarAlt className="text-text-muted" />}
                  name="date"
                  type="date"
                  min={today}
                  value={searchParams.date}
                  onChange={handleChange}
                />
                <FormField
                  label="Time"
                  icon={<FaClock className="text-text-muted" />}
                  name="time"
                  type="time"
                  value={searchParams.time}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-gold text-bg-base font-semibold rounded-xl
                  hover:shadow-glow-gold hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaSearch /> Find Available Drivers
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustIcon = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-text-secondary text-sm">
    {icon}
    <span>{text}</span>
  </div>
);

const FormField = ({ label, icon, name, type, placeholder, min, value, onChange }) => (
  <div>
    <label className="block text-sm text-text-secondary mb-1.5">{label}</label>
    <div className="flex items-center border border-border rounded-xl px-4 py-3 bg-bg-elevated
      focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/20 transition-colors">
      <span className="mr-3">{icon}</span>
      <input
        type={type}
        name={name}
        min={min}
        placeholder={placeholder}
        className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default Hero;
