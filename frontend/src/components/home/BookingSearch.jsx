import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAxios } from '../../hooks/useAxios';

const BookingSearch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '',
  });

  const { fetchData: searchPilots, loading, error: apiError } = useAxios({
    url: '/drivers/search',
    method: 'get',
    immediate: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const params = new URLSearchParams({
        ...formData,
        date: new Date(formData.date).toISOString(),
        time: formData.time
      });

      const data = await searchPilots({ params });

      if (data.success) {
        navigate('/pilots/search', {
          state: {
            searchParams: formData,
            results: data.drivers
          }
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="w-full pb-section-gap relative">
      <motion.div
        className="w-full md:w-[87.5%] ml-auto border-t border-primary pt-8 pb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="font-ui-label text-ui-label uppercase tracking-widest text-primary mb-8">
          Initiate Sequence
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full items-end gap-0">
          {/* Input 1: Origin */}
          <div className="w-full md:w-1/3 flex flex-col group relative">
            <label className="font-ui-label text-ui-label uppercase text-on-surface-variant mb-2">Origin</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body-lg text-body-lg text-primary placeholder:text-outline-variant placeholder:text-sm py-4 px-0 transition-colors rounded-none outline-none"
              placeholder="Enter Pickup"
              required
            />
          </div>

          {/* Divider (Desktop) */}
          <div className="hidden md:block w-px h-12 bg-outline-variant mx-8 mb-4"></div>

          {/* Input 2: Destination */}
          <div className="w-full md:w-1/3 flex flex-col group relative mt-6 md:mt-0">
            <label className="font-ui-label text-ui-label uppercase text-on-surface-variant mb-2">Destination</label>
            <input
              type="text"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body-lg text-body-lg text-primary placeholder:text-outline-variant placeholder:text-sm py-4 px-0 transition-colors rounded-none outline-none"
              placeholder="Enter Dropoff"
              required
            />
          </div>

          {/* Divider (Desktop) */}
          <div className="hidden md:block w-px h-12 bg-outline-variant mx-8 mb-4"></div>

          {/* Input 3: Date */}
          <div className="w-full md:w-[15%] flex flex-col group relative mt-6 md:mt-0">
            <label className="font-ui-label text-ui-label uppercase text-on-surface-variant mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body-lg text-body-lg text-primary py-4 px-0 transition-colors rounded-none outline-none"
              required
            />
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto mt-8 md:mt-0 md:ml-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-transparent border border-primary text-primary font-ui-button text-ui-button uppercase px-12 py-4 hover:bg-primary hover:text-on-primary transition-colors duration-300 rounded-none"
            >
              {loading ? 'Searching...' : 'Configure'}
            </button>
          </div>
        </form>

        {apiError && (
          <div className="mt-6 border-t border-error pt-4">
            <p className="font-ui-label text-ui-label text-error uppercase">{apiError}</p>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default BookingSearch;
