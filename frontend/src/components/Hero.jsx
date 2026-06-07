import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative w-full pt-20 md:pt-36 pb-section-gap flex flex-col md:flex-row justify-between min-h-[85vh] md:min-h-[921px]">

      {/* Asymmetric Headline Area */}
      <div className="w-full md:w-[55%] pb-12 md:pb-0 z-10 relative px-gutter md:px-0">
        <motion.h1
          className="font-display-xl text-[42px] leading-[40px] sm:text-[64px] sm:leading-[60px] md:text-[80px] md:leading-[74px] lg:text-display-xl text-primary -ml-1 md:-ml-2 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="block">THE ART</span>
          <span className="block text-outline-variant italic font-normal ml-8 sm:ml-12 md:ml-24">OF</span>
          <span className="block text-right pr-4 md:pr-12">ARRIVAL</span>
        </motion.h1>
        <motion.p
          className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-12 md:ml-24 border-l border-primary pl-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Curated logistical choreography for the discerning individual. Beyond transport, an aesthetic experience.
        </motion.p>
      </div>

      {/* Offset Vertical Image */}
      <div className="w-full md:w-[40%] h-[400px] sm:h-[500px] md:h-[614px] lg:h-[819px] bg-surface-container-high relative overflow-hidden group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPhm3ZvX7oJW9ycwsOUjffHzXso6GtxhvhilIORrOIBVEbh2Z4-buxxbH5d8hzmB7IUjvIrchg-3LgHAFkOBmY9JhWXlGkNEJJd5GzKTA_-5Fb7F6ERY9lMgPa9qyksj9kHVJJ7bK3wsJZ2tLUbC0DTQQz--16CtH5iXZeQAAcwViHRTyMC5KXs2Hs9846HHfuGIvnGOGdPYf6lqjjq5Wg7kbbPlenIIJ9w7rz_1Xtbv7JOim9r-vhlwKts5kERxN8UKGmhsH1yVM"
          alt="Luxury car interior detail"
          loading="eager"
          className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 transition-transform duration-[2s] ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Hard Overlap Element */}
        <div className="absolute bottom-0 left-0 bg-background border-t border-r border-primary p-4 md:p-6 z-20">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-primary">FLEET / 01</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
