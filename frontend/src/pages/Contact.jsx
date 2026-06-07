import { useState } from 'react';

const faqItems = [
  {
    question: 'How far in advance should I book?',
    answer: 'For standard itineraries, we recommend a minimum of 24 hours notice. For bespoke multi-day arrangements or specific high-demand vehicles, a 72-hour window ensures absolute precision in fulfilling your request.',
  },
  {
    question: 'What is your pilot vetting process?',
    answer: 'Our selection is rigorous. Pilots undergo extensive background checks, advanced defensive driving certification, and behavioral assessments to ensure they align with our standards of discretion and excellence.',
  },
  {
    question: 'Do you offer international transfers?',
    answer: 'Yes. Through our global network of approved affiliates, we orchestrate seamless ground transportation across major financial and cultural capitals worldwide.',
  },
];

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: just toast or console.log for now
    console.log('Form submitted:', formData);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-background">
      {/* ── Hero ── */}
      <section className="pt-24 md:pt-32 pb-section-gap px-gutter md:px-margin-edge relative">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-8 z-10">
            <p className="font-ui-label text-ui-label text-secondary uppercase tracking-widest mb-6">
              The Dialogue of Service
            </p>
            <h1 className="font-display-xl text-[64px] leading-[72px] md:text-display-xl text-primary tracking-tighter max-w-[12ch]">
              Connect with Precision
            </h1>
          </div>
          <div className="md:col-span-6 md:col-start-6 mt-12 md:-mt-24 z-0 relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzmT87gl_V4NmYCqwF3Ll35er4rYnjMSdBfFkKirR8PgPzb9MqKBOTvwCGRVLgHZnaorP7362EbL74uhXsZexJ5cbR4G6ZA39t_A2PRfNiOxX9jtCOTnslq8lDCiEsXtdQ24S281-E0b5g1q-XU-ohY2jz__1-adYmJ6ZZa88qi0hBN4VqFHmQZd6wmiyF2lxDZfiNtZR8AlFL8miQiw8Ww0RWEt5S0sX0xDy9rPqnAaEqytVGbdUv4hENlNN08qKtV9tJNziaos8"
              alt="Luxury vintage car interior"
              className="w-full h-[400px] md:h-[600px] object-cover grayscale brightness-90 contrast-125 border border-primary"
            />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full px-gutter md:px-margin-edge flex justify-end">
        <div className="w-full md:w-[87.5%] h-px bg-primary opacity-20" />
      </div>

      {/* ── Contact Info + Form ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Contact Info */}
          <div className="md:col-span-4 flex flex-col gap-16 pr-0 md:pr-8">
            <div>
              <h3 className="font-ui-label text-ui-label text-secondary uppercase tracking-widest mb-4 border-b border-primary opacity-50 pb-2">
                Headquarters
              </h3>
              <p className="font-body-lg text-body-lg text-primary">
                London, UK
                <br />
                (Mayfair District)
              </p>
            </div>
            <div>
              <h3 className="font-ui-label text-ui-label text-secondary uppercase tracking-widest mb-4 border-b border-primary opacity-50 pb-2">
                Communications
              </h3>
              <p className="font-body-lg text-body-lg text-primary">
                +44 20 7946 0000
                <br />
                concierge@gopilot.com
              </p>
            </div>
            <div>
              <h3 className="font-ui-label text-ui-label text-secondary uppercase tracking-widest mb-4 border-b border-primary opacity-50 pb-2">
                Operational Hours
              </h3>
              <p className="font-body-lg text-body-lg text-primary">24/7 Global Deployment</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 md:col-start-6 mt-12 md:mt-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="font-ui-label text-ui-label text-secondary uppercase tracking-widest"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="bg-transparent border-0 border-b border-primary p-0 py-2 focus:ring-0 focus:border-tertiary-container font-body-md text-body-md text-primary placeholder-outline-variant transition-colors outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="font-ui-label text-ui-label text-secondary uppercase tracking-widest"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    className="bg-transparent border-0 border-b border-primary p-0 py-2 focus:ring-0 focus:border-tertiary-container font-body-md text-body-md text-primary placeholder-outline-variant transition-colors outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="service"
                  className="font-ui-label text-ui-label text-secondary uppercase tracking-widest"
                >
                  Service Type
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="bg-transparent border-0 border-b border-primary p-0 py-2 focus:ring-0 focus:border-tertiary-container font-body-md text-body-md text-primary transition-colors appearance-none cursor-pointer outline-none"
                >
                  <option value="" disabled>
                    Select an inquiry type
                  </option>
                  <option value="chauffeur">Chauffeur Service</option>
                  <option value="airport">Airport Transfer</option>
                  <option value="event">Special Event</option>
                  <option value="fleet">Fleet Partnership</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="font-ui-label text-ui-label text-secondary uppercase tracking-widest"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Detail your requirements"
                  rows="4"
                  className="bg-transparent border-0 border-b border-primary p-0 py-2 focus:ring-0 focus:border-tertiary-container font-body-md text-body-md text-primary placeholder-outline-variant transition-colors resize-none outline-none"
                />
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8 gap-6">
                <p className="font-ui-label text-ui-label text-secondary opacity-70">
                  Absolute Discretion Guaranteed.
                </p>
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-ui-button text-ui-button px-8 py-4 uppercase tracking-widest hover:bg-tertiary-container transition-colors w-full md:w-auto"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-section-gap px-gutter md:px-margin-edge bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-4">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tighter mb-8 md:mb-0">
              Frequent
              <br />
              Inquiries
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 flex flex-col">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border-b border-primary py-6 cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-body-lg text-body-lg text-primary pr-8">{item.question}</h4>
                  <span
                    className={`material-symbols-outlined text-primary transition-transform duration-300 ${
                      openFaq === index ? 'rotate-45' : ''
                    }`}
                  >
                    add
                  </span>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-40 mt-4' : 'max-h-0'
                  }`}
                >
                  <p className="font-body-md text-body-md text-secondary">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
