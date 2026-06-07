import usePageTitle from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  usePageTitle('About');
  const stats = [
    { value: '500+', label: 'Elite Pilots' },
    { value: '15+', label: 'Global Cities' },
    { value: '0.01%', label: 'Acceptance Rate' },
  ];

  const values = [
    {
      number: '01',
      title: 'Precision Logistics',
      description:
        'Time is the ultimate luxury. Our algorithmic routing combined with human expertise ensures absolute punctuality. We do not deal in estimates; we deal in exactitudes.',
    },
    {
      number: '02',
      title: 'Absolute Discretion',
      description:
        'Privacy is paramount. Our personnel are bound by strict non-disclosure agreements, and our vehicles provide a secure, unseen sanctuary amidst the public sphere.',
    },
    {
      number: '03',
      title: 'Unwavering Safety',
      description:
        'Safety protocols derived from executive protection standards. Our pilots are trained in advanced defensive driving and situational awareness, ensuring peace of mind is never compromised.',
    },
  ];

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="pt-24 md:pt-section-gap pb-16 md:pb-32 px-gutter md:px-margin-edge bg-background">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-ui-label text-ui-label uppercase tracking-widest text-secondary mb-8">
            The Philosophy of Precision
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-10">
              <h1 className="font-display-xl text-[48px]  leading-[44px] md:text-display-lg lg:text-display-xl text-primary max-w-[15ch] mb-12 md:mb-16">
                Defining the Standard of Movement
              </h1>
            </div>
            <div className="lg:col-span-8 lg:col-start-4">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzYnpYN9XvQmruM-RvWSVqTqB-cM4BI4_feyb4Sn694quBF1OAIP7lBSyv04zubklRRwkjDnZyBQ9LxCAPr6BiYLrmm_223VvItuTDYNCQ3di1itlD60uLsZ-wev6egLtQLExIg0NKU4zs_XRtEjaHJAH8B2N0W4esIHAjd41Rs8AxoISg53W3TtQUNg1ezp_WjT0eLfFV21wuaGv2R7gmCq6mANnD6ZMSvByEY1ZvSZwlOCvISQWINOty123e_n3jtbmdpEb2VnU"
                alt="Abstract modern architecture"
                className="w-full h-[400px] md:h-[614px] object-cover grayscale border border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Origin Story ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge bg-surface-container-low border-t border-b border-primary">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-5 lg:col-start-2 order-2 lg:order-1">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-8">
              The Genesis of Control
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
              GOPILOT was conceived not as a transportation service, but as a response to the chaotic unpredictability of modern movement. We recognized a void where absolute logistical choreography should exist.
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Our founders, drawing from elite aviation and high-end security backgrounds, engineered a protocol-driven approach to terrestrial transit. Every route is calculated. Every variable is accounted for.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 mb-12 lg:mb-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjYwBK9glUE-m06AZ3mI93zbQQ7cw-4OZgx4FKRMIrwJMFoxZYvz1aD2j5fdRvxYv12Jgj0osp8EYClpOtn8IxFogUKjok2rSprZxxarsskBlgjE4SUYhCkcQZ-uugpXpIlVpVwu41uW-G-xJ9oB2nz4GG055TJAXMSN6jPPZz765XjGk46cuG5vPZgbc-lQ86nCeMLbiPK_SRU4WK-o1JNmlR-Uwx1nZhQqLMYC9L3KBTJSP2pJk2N0VfLrmk0l-3-faWSYo4QN4"
              alt="Founding portrait"
              className="w-full aspect-[3/4] object-cover grayscale border border-primary"
            />
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge bg-background">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-3">
            <h2 className="font-ui-label text-ui-label uppercase tracking-widest text-secondary lg:sticky lg:top-32">
              Operational Tenets
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5 space-y-16">
            {values.map((v) => (
              <div key={v.number} className="border-t border-primary pt-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <span className="font-display-lg text-display-lg text-surface-tint opacity-30">
                    {v.number}
                  </span>
                  <div>
                    <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
                      {v.title}
                    </h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                      {v.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="py-24 md:py-32 px-gutter md:px-margin-edge bg-primary text-on-primary">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
          {stats.map((s, i) => (
            <div key={i} className="py-8 md:py-0 px-0 md:px-8 text-center">
              <p className="font-display-lg text-display-lg mb-2">{s.value}</p>
              <p className="font-ui-label text-ui-label uppercase tracking-widest text-surface-variant">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge flex justify-center bg-background">
        <div className="max-w-4xl text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-8 block opacity-50">
            format_quote
          </span>
          <blockquote className="font-display-lg text-headline-lg-mobile md:text-display-lg text-primary leading-tight mb-8 italic">
            "A masterful exercise in removing friction from the physical world. It is, quite simply, movement perfected."
          </blockquote>
          <cite className="font-ui-label text-ui-label uppercase tracking-widest text-secondary not-italic">
            — The Global Executive Journal
          </cite>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge bg-surface-container-low border-t border-primary text-center">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-8 max-w-2xl mx-auto">
          Ready to experience uncompromising standards?
        </h2>
        <motion.div whileHover={{ gap: '16px' }} className="inline-flex items-center">
          <Link
            to="/pilots"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-on-surface transition-colors"
          >
            ENLIST YOUR PILOT
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
