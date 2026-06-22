import Link from 'next/link';
import type { Metadata } from 'next';
import FeaturedProperties from '@/components/features/FeaturedProperties';

export const metadata: Metadata = {
  title: 'Hazina — Kenya Real Estate Intelligence',
  description:
    'Ground-truth property intelligence for the Kenyan market. Browse verified listings enriched with real scout field data collected on the ground.',
};

const FEATURED_AREAS = [
  { name: 'Nairobi', listings: 1240 },
  { name: 'Kiambu', listings: 834 },
  { name: 'Nakuru', listings: 512 },
  { name: 'Machakos', listings: 388 },
  { name: 'Kajiado', listings: 297 },
  { name: 'Murang\'a', listings: 214 },
];

const TRUST_STATS = [
  { value: '6,200+', label: 'Parcels documented' },
  { value: '47', label: 'Counties covered' },
  { value: '100%', label: 'Ground-verified data' },
];

export default function HomePage() {
  return (
    <div className="hz-home">

      {/* ── Navbar ── */}
      <header className="hz-nav">
        <div className="hz-nav__inner container">
          <Link href="/" className="hz-nav__wordmark">
            Hazina
          </Link>
          <nav className="hz-nav__links">
            <Link href="/" className="hz-nav__link">Home</Link>
            <Link href="/properties" className="hz-nav__link">Browse Properties</Link>
            <Link href="/map" className="hz-nav__link">View Map</Link>
            <Link href="/scout/login" className="hz-nav__cta btn-primary">
              Scout Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hz-hero">
        <div className="hz-hero__inner container">
          <p className="hz-hero__eyebrow">Kenya Real Estate Intelligence</p>
          <h1 className="hz-hero__heading">
            Find property with<br />
            <span className="hz-hero__heading--accent">ground truth</span><br />
            behind every listing.
          </h1>
          <p className="hz-hero__sub">
            Every parcel on Hazina has been physically visited and documented by a trained scout.
            No guesswork. No inflated asking prices.
          </p>

          {/* Search bar */}
          <form className="hz-search" action="/map" method="GET">
            <div className="hz-search__field">
              <svg className="hz-search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="hero-search-input"
                type="text"
                name="q"
                className="hz-search__input"
                placeholder="Search by county, town, or ward..."
                autoComplete="off"
              />
            </div>
            <button type="submit" id="hero-search-submit" className="hz-search__btn btn-primary">
              Search
            </button>
          </form>

          {/* Quick-access area pills */}
          <div className="hz-quick-areas">
            {FEATURED_AREAS.map((area) => (
              <Link
                key={area.name}
                href={`/properties?q=${encodeURIComponent(area.name)}`}
                className="hz-quick-areas__pill"
                id={`area-pill-${area.name.toLowerCase()}`}
              >
                {area.name}
                <span className="hz-quick-areas__count">{area.listings.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties (Phase 3) ── */}
      <FeaturedProperties />

      {/* ── Trust bar ── */}
      <section className="hz-trust">
        <div className="container hz-trust__inner">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="hz-trust__item">
              <span className="hz-trust__value">{stat.value}</span>
              <span className="hz-trust__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value propositions ── */}
      <section className="hz-props">
        <div className="container hz-props__grid">

          <article className="hz-prop-card">
            <div className="hz-prop-card__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <h2 className="hz-prop-card__title">Scout-Verified Locations</h2>
            <p className="hz-prop-card__body">
              Each listing is pinned by a scout who physically visited the parcel, documented road access, terrain, neighbouring land use, and infrastructure distance — logged on a GPS-accurate map.
            </p>
          </article>

          <article className="hz-prop-card">
            <div className="hz-prop-card__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h2 className="hz-prop-card__title">Market Comparables</h2>
            <p className="hz-prop-card__body">
              Hazina continuously scrapes Kenyan property portals and cross-references asking prices against scout data, giving you an honest price-per-acre range for every area.
            </p>
          </article>

          <article className="hz-prop-card">
            <div className="hz-prop-card__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h2 className="hz-prop-card__title">Parcel Intelligence Brief</h2>
            <p className="hz-prop-card__body">
              For every published parcel, we generate a structured brief covering ground observations, comparable pricing, zoning context, and nearby infrastructure — all in one document.
            </p>
          </article>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hz-footer">
        <div className="container hz-footer__inner">
          <span className="hz-footer__wordmark">Hazina</span>
          <p className="hz-footer__note">
            This platform is for informational purposes only and does not constitute a formal valuation under the Valuers Act Cap 532 (Kenya).
          </p>
          <p className="hz-footer__copy">&copy; {new Date().getFullYear()} Hazina. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
