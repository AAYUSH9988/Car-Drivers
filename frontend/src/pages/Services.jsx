import { useNavigate } from 'react-router-dom';
import { FaCar, FaClock, FaMapMarkerAlt, FaShieldAlt, FaStar, FaUsers } from 'react-icons/fa';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Personal Driver",
      description: "Professional drivers for your daily commute, shopping trips, or personal errands.",
      icon: <FaCar className="text-4xl text-gold" />,
      features: [
        "Experienced drivers",
        "Flexible scheduling",
        "Safe and reliable",
        "Competitive rates"
      ],
      price: "Starting from ₹1,875/hour"
    },
    {
      id: 2,
      title: "Airport Transfer",
      description: "Comfortable and punctual airport pickup and drop-off services.",
      icon: <FaMapMarkerAlt className="text-4xl text-emerald" />,
      features: [
        "Flight tracking",
        "Meet & greet service",
        "Luggage assistance",
        "24/7 availability"
      ],
      price: "Starting from ₹3,375"
    },
    {
      id: 3,
      title: "Event Transportation",
      description: "Special occasion transportation for weddings, parties, and corporate events.",
      icon: <FaStar className="text-4xl text-electric" />,
      features: [
        "Luxury vehicles",
        "Professional attire",
        "Event coordination",
        "Group bookings"
      ],
      price: "Starting from ₹4,500/hour"
    },
    {
      id: 4,
      title: "Hourly Service",
      description: "Book a driver for multiple stops and extended periods throughout the day.",
      icon: <FaClock className="text-4xl text-gold" />,
      features: [
        "Multiple destinations",
        "Wait time included",
        "Flexible itinerary",
        "Cost-effective"
      ],
      price: "Starting from ₹2,625/hour"
    },
    {
      id: 5,
      title: "Corporate Services",
      description: "Business transportation solutions for executives and corporate teams.",
      icon: <FaUsers className="text-4xl text-electric" />,
      features: [
        "Executive vehicles",
        "Corporate accounts",
        "Bulk bookings",
        "Priority support"
      ],
      price: "Contact for pricing"
    },
    {
      id: 6,
      title: "Safety First",
      description: "All our drivers are thoroughly vetted and trained for maximum safety.",
      icon: <FaShieldAlt className="text-4xl text-emerald" />,
      features: [
        "Background checks",
        "Insurance coverage",
        "Safety training",
        "24/7 support"
      ],
      price: "Included in all services"
    }
  ];

  const stats = [
    { value: "500+", label: "Verified Drivers", color: "text-electric" },
    { value: "4.9★", label: "Average Rating", color: "text-gold" },
    { value: "24/7", label: "Available Support", color: "text-emerald" },
    { value: "100%", label: "Satisfaction", color: "text-electric" }
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Hero Section */}
      <section className="relative py-20 bg-bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-sm font-medium rounded-full mb-6">
            Our Services
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Premium Transportation <span className="text-gold">Solutions</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-3xl mx-auto">
            Professional driving services tailored to meet your every transportation need.
            Safe, reliable, and convenient solutions for all occasions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-bg-surface border border-border rounded-2xl p-8 hover:border-gold/30 hover:shadow-card transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated mb-4">
                    {service.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                    {service.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">
                    {service.description}
                  </p>
                  <div className="text-lg font-semibold text-gold">
                    {service.price}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                      <span className="text-text-secondary text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/pilots')}
                  className="w-full py-3 bg-gradient-gold text-bg-base font-semibold rounded-xl hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
              Why Choose Our Service?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-text-secondary text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg-surface border border-border rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
                  Ready to Book Your Driver?
                </h2>
                <p className="text-text-secondary mb-8">
                  Choose from our verified professional drivers and enjoy a safe, comfortable ride.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/pilots')}
                    className="px-8 py-3 bg-gradient-gold text-bg-base font-semibold rounded-xl hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Find a Pilot
                  </button>
                </div>
              </div>
              <div className="relative h-64 md:h-auto bg-bg-elevated">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCar className="text-gold text-3xl" />
                    </div>
                    <p className="text-text-secondary text-sm">Trusted by 10,000+ riders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;