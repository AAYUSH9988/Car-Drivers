// frontend/src/pages/Home.jsx

import Hero from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import BookingSearch from '../components/home/BookingSearch';
import ServicesGrid from '../components/home/ServicesGrid';
import EditorialCTA from '../components/home/EditorialCTA';
import FeaturedPilots from '../components/home/FeaturedPilots';
import TestimonialCarousel from '../components/home/TestimonialCarousel';
import StatsShowcase from '../components/home/StatsShowcase';

const Home = () => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-gutter md:px-margin-edge">
      <Hero />
      <StatsShowcase />
      <ServicesGrid />
      <BookingSearch />
      <HowItWorks />
      <FeaturedPilots />
      <TestimonialCarousel />
      <EditorialCTA />
    </div>
  );
};

export default Home;
