import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
      label: "HAPPY CUSTOMERS",
      value: 14000,
      suffix: "+"
    },
    {
      label: "MILES DRIVEN",
      value: 1000000,
      suffix: "+"
    },
    {
      label: "SATISFACTION",
      value: 99,
      suffix: "%"
    },
    {
      label: "PROFESSIONAL PILOTS",
      value: 250,
      suffix: "+"
    }
  ];

  return (
    <section className="w-full pb-section-gap">
      {/* Top border divider */}
      <div className="border-t border-primary mb-12" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              {stat.label}
            </span>
            <div className="font-display-xl text-[36px] sm:text-[48px] md:text-[64px] text-primary leading-none tracking-tighter">
              <CountUp end={stat.value} />
              <span className="text-outline-variant">{stat.suffix}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsShowcase;
