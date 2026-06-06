// frontend/src/components/home/StatsShowcase.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaUsers, FaRoute, FaSmile, FaMedal } from 'react-icons/fa';

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

const StatsShowcase = () => {
  const stats = [
    {
      icon: <FaUsers className="h-10 w-10 text-primary" />,
      value: 14000,
      label: "Happy Customers",
      suffix: "+"
    },
    {
      icon: <FaRoute className="h-10 w-10 text-primary" />,
      value: 1000000,
      label: "Miles Driven",
      suffix: "+"
    },
    {
      icon: <FaSmile className="h-10 w-10 text-primary" />,
      value: 99,
      label: "Satisfaction Rate",
      suffix: "%"
    },
    {
      icon: <FaMedal className="h-10 w-10 text-primary" />,
      value: 250,
      label: "Professional Pilots",
      suffix: "+"
    }
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="absolute inset-0 bg-primary opacity-5 pattern-diagonal-lines pattern-black pattern-bg-white pattern-size-2 pattern-opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <CountUp end={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsShowcase;