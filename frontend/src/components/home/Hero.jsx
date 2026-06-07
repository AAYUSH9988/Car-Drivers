import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-surface/80" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPhm3ZvX7oJW9ycwsOUjffHzXso6GtxhvhilIORrOIBVEbh2Z4-buxxbH5d8hzmB7IUjvIrchg-3LgHAFkOBmY9JhWXlGkNEJJd5GzKTA_-5Fb7F6ERY9lMgPa9qyksj9kHVJJ7bK3wsJZ2tLUbC0DTQQz--16CtH5iXZeQAAcwViHRTyMC5KXs2Hs9846HHfuGIvnGOGdPYf6lqjjq5Wg7kbbPlenIIJ9w7rz_1Xtbv7JOim9r-vhlwKts5kERxN8UKGmhsH1yVM"
          alt keyed-upper="Luxury car"
          className="w-full h-full object-cover opacity-30 grayscale"
        />
      </div>

      <div className="max-w-7xl w-full px-gutter md:px-margin-edge relative z-10 pt-20">
        <div className="grid lg:grid-cols-12 gap-gutter items-end">
          {/* Left — Editorial Copy */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 border border-primary/20 px-4 py-1.5">
              <span className="font-ui-label text-ui-label uppercase tracking-widest text-primary">Trusted by 10,000+ riders</span>
            </div>

            <div>
              <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-xl text-primary tracking-tighter -ml-1">
                <span className="block">THE ART</span>
                <span className="block text-outline-variant italic font-normal ml-12 md:ml-24">OF</span>
                <span className="block text-left">ARRIVAL</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-8 md:ml-24 border-l border-primary pl-6">
                Curated logistical choreography for the discerning individual. Beyond transport, an aesthetic experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <button
                onClick={handleBookNow}
                className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors duration-300"
              >
                Initiate Booking
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border border-primary text-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-primary hover:text-on-primary transition-colors duration-300"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right — Search Form */}
          <div className="lg:col-span-5 mt-12 lg:mt-0">
            <div className="border border-primary bg-surface/80 backdrop-blur-sm p-6 md:p-8">
              <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-6">
               霁initiate Sequence
              </span>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    label="Pickup Location"
                    name="location"
                    type="text"
                    placeholder="Enter pickup address"
                    value={searchParams.location}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Date"
                      name="date"
                      type="date"
                      min={today}
                      value={searchParams.date}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Time"
                      name="time"
                      type="time"
                      value={searchParams.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-ui-button text-ui-button uppercase py-4 tracking-widest hover:bg-tertiary-container transition-colors duration-300"
                >
                  Find Available Drivers
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, name, type, placeholder, min, value, onChange }) => (
  <div>
    <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      min={min}
      placeholder={placeholder}
      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body-md text-body-md text-primary placeholder:outfloor-variant py-3 px-0 transition-colors outline-none"
      value={value}
      onChange={onChange}
    />
  </div>
);

export default Hero;