import usePageTitle from '../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PilotCard from '../components/shared/PilotCard';
import driverService from '../services/driverService';

const SearchResults = () => {
  usePageTitle('Search Results');
  const location = useLocation();
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        setLoading(true);

        let searchParams = {};

        if (location.state?.searchParams) {
          searchParams = location.state.searchParams;
        } else if (location.search) {
          const params = new URLSearchParams(location.search);
          for (let [key, value] of params) {
            searchParams[key] = value;
          }
        }

        console.log('Searching with params:', searchParams);

        const results = await driverService.searchDrivers(searchParams);
        setPilots(results);
      } catch (error) {
        console.error('Error fetching pilots:', error.message);
        setError(`Failed to load available pilots: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPilots();
  }, [location]);

  if (loading) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Results
            </span>
            <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-lg text-primary tracking-tighter max-w-[12ch]">
              Available Pilots
            </h1>
          </div>
        </section>
        <section className="min-h-[40vh] flex items-center justify-center">
          <div className="w-px h-12 bg-primary animate-pulse" />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Error
            </span>
            <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-lg text-primary tracking-tighter max-w-[12ch]">
              Failed to Load
            </h1>
          </div>
        </section>
        <section className="px-gutter md:px-margin-edge py-12">
          <div className="max-w-[1440px] mx-auto border border-error/30 bg-error-container/20 p-6">
            <p className="font-ui-label text-ui-label uppercase tracking-widest text-error">{error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen">
      {/* ── Hero / Header ── */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
            Results
          </span>
          <h1 className="font-display-xl text-[48px] leading-[44px] md:text-display-lg text-primary tracking-tighter max-w-[12ch]">
            Available Pilots
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-lg">
            Found {pilots.length} pilot{pilots.length !== 1 ? 's' : ''} matching your criteria.
          </p>
        </div>
      </section>

      {/* ── Search Params (if any) ── */}
      {location.state?.searchParams && Object.keys(location.state.searchParams).length > 0 && (
        <section className="px-gutter md:px-margin-edge py-4 border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-2">
              Search Parameters
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(location.state.searchParams).map(([key, value]) => (
                <span
                  key={key}
                  className="border border-outline-variant px-3 py-1 font-ui-label text-ui-label uppercase tracking-widest text-primary"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Results Count ── */}
      <section className="px-gutter md:px-margin-edge py-6 border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
            {pilots.length} Pilot{pilots.length !== 1 ? 's' : ''} Available
          </p>
          {location.state?.searchParams && (
            <p className="font-ui-label text-ui-label uppercase tracking-widest text-primary">
              Filtered Search
            </p>
          )}
        </div>
      </section>

      {/* ── Pilots Grid or Empty State ── */}
      <section className="px-gutter md:px-margin-edge pb-section-gap">
        <div className="max-w-[1440px] mx-auto">
          {pilots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {pilots.map((pilot, i) => (
                <PilotCard key={pilot._id} pilot={pilot} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="font-display-lg text-display-lg text-primary mb-4">No matches</p>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto">
                Adjust your search criteria to discover more pilots.
              </p>
              <Link
                to="/"
                className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
              >
                New Search
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResults;
