import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EditorialCTA = () => {
  return (
    <section className="w-full pb-section-gap pt-32 relative flex flex-col items-center text-center">
      {/* Vertical Line */}
      <div className="w-px h-32 bg-primary absolute top-0 left-1/2 -translate-x-1/2" />

      <motion.h2
        className="font-display-xl text-[48px] sm:text-[60px] md:text-[80px] lg:text-display-xl text-primary leading-[0.8] mb-12 relative z-10 group cursor-pointer"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <span className="block hover:italic transition-all duration-500">SECURE</span>
        <span className="block hover:italic transition-all duration-500">YOUR PILOT</span>
        {/* Hover Reveal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300 blur-xl" />
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Link
          to="/pilots"
          className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-10 py-5 tracking-widest hover:bg-tertiary-container hover:text-on-tertiary transition-colors duration-300 z-20"
        >
          Initiate Booking
        </Link>
      </motion.div>
    </section>
  );
};

export default EditorialCTA;
