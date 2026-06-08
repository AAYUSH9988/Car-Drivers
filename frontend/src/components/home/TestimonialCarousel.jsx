import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

// Import local images
import pilot1Image from '@assets/images/pilots/pilot1.jpg';
import pilot2Image from '@assets/images/pilots/pilot2.jpg';
import pilot3Image from '@assets/images/pilots/pilot3.jpg';

const testimonials = [
  {
    id: 1,
    name: "James Harrington",
    role: "Business Executive",
    image: pilot1Image,
    comment: "Exceptional service. The attention to detail is unlike any transportation service I have experienced.",
    rating: 5
  },
  {
    id: 2,
    name: "Elena Vasquez",
    role: "Frequent Traveler",
    image: pilot2Image,
    comment: "Precision, punctuality, and impeccable standards. GoPilot understands luxury.",
    rating: 5
  },
  {
    id: 3,
    name: "Thomas Whitfield",
    role: "Corporate Client",
    image: pilot3Image,
    comment: "A seamless experience from booking to arrival. The definition of professional.",
    rating: 5
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-primary' : 'text-outline-variant'}`}
      />
    ));
  };

  return (
    <section className="w-full pb-section-gap">
      <div className="border-t border-primary pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
            Testimonials
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
            Client Perspectives
          </h2>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                {/* Author Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 border border-primary overflow-hidden">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonials[currentIndex].rating)}
                  </div>
                  <p className="font-body-lg text-body-lg text-on-surface italic mb-6 max-w-2xl">
                    "{testimonials[currentIndex].comment}"
                  </p>
                  <div className="border-t border-outline-variant pt-4">
                    <h4 className="font-headline-lg text-[20px] text-primary">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mt-1">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex items-center gap-4 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-px transition-all duration-300 ${
                  index === currentIndex ? 'w-12 bg-primary' : 'w-6 bg-outline-variant'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
