import React from 'react';
import { motion } from 'framer-motion';

// Service data - using placeholder images that can be replaced
const services = [
  {
    id: 1,
    number: '01',
    label: 'Primary',
    title: 'EXECUTIVE CHOREOGRAPHY',
    description:
      'Seamless point-to-point transit executed with absolute precision. We don\'t just drive; we orchestrate your movement through the city landscape.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVUw5AI5AlVxjERK8nOnx3ZmM9e0xPhlt2KZ-NJRqPk3mNSxG7pP64iVsGwTNdtIUVEIl72CSm9R3OkQLOE4PyTbveW5lmJqnmyPk4aP4hqiC7spktStOgY7Ez4FjE2WHpabJTPjWKRPthzrM48xkrGPRzZajyQ8EAo0cJwXpBhQtANZat9ShQ2SEnaH0nILVpxVsMwTFfGz7sSCIV8ersIxzkNL2UyI8OjC4fAbAB_s1xUAfrW3kcwXr1SGKPJ3wv1--I1zjiAV0',
    colSpan: 'md:col-span-8',
    hasImage: true,
  },
  {
    id: 2,
    number: '02',
    label: '',
    title: 'CURATED FLEET',
    description:
      'A selection of vehicles maintained to neurotic standards. Each machine is an extension of the aesthetic intent.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAclneDcf_BbpxRkizV28bim34Ad3w03HiFtdCQMFJ3sCx975S1xAnhNEg6gqzTmWnouVJIMyALsIOoQe71laggv1iY6mbNo_paLfiZV6QKnA787x41vGbldJyS52PaFTPAW8Z1ll25946LjZFJBIV2RpTWqw8yQj5tdIHhG7kKM1YKsSS35NqPNcbjLWzaJxpmX2awYZRTKTlY3wGQGuBJdwz-sEsSb-GJiEF9gnvuL2OQeSOuiXuvj2kLDcDdzYEBAEh7jVdU_7w',
    colSpan: 'md:col-span-4',
    hasImage: false,
    offset: true,
  },
];

const ServicesGrid = () => {
  return (
    <section className="w-full pb-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter relative">
        {/* Background Graphic Text */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
          <span className="font-display-xl text-[200px] md:text-[400px] text-primary whitespace-nowrap leading-none tracking-tighter select-none">
            SERVICE
          </span>
        </div>

        {/* Large Card (Col 1-8) */}
        {services.map((service) => (
          <motion.div
            key={service.id}
            className={`col-span-1 ${service.colSpan} ${
              service.offset ? 'md:mt-48' : ''
            } border-t border-primary pt-6 z-10`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="font-display-lg text-display-lg text-primary font-light leading-none">
                {service.number}
              </span>
              {service.label && (
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                  {service.label}
                </span>
              )}
            </div>

            {service.hasImage && (
              <div className="w-full h-[300px] md:h-[512px] bg-surface-container-high mb-8 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[0.8] contrast-125"
                />
              </div>
            )}

            <h3
              className="font-headline-lg-mobile md:font-headline-lg text-primary mb-4"
              dangerouslySetInnerHTML={{ __html: service.title.replace(/\n/g, '<br/>') }}
            />
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
              {service.description}
            </p>

            {!service.hasImage && (
              <div className="w-full aspect-[3/4] bg-surface-container-highest overflow-hidden mt-12">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ServicesGrid;
