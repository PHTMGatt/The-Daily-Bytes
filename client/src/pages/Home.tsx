import { Link } from 'react-router-dom';
import './Home.css';

const categories = [
  { label: 'Technology', to: '/Technology', copy: 'AI, software, hardware, and the stories shaping what comes next.' },
  { label: 'Health', to: '/Health', copy: 'Clear headlines and useful health updates without the clutter.' },
  { label: 'Sports', to: '/Sports', copy: 'Catch the biggest sports stories in a fast, readable feed.' },
  { label: 'Entertainment', to: '/Entertainment', copy: 'Movies, culture, creators, and entertainment news worth opening.' },
];

const Home = () => {
  return (
    <main className="home-container">
      <section className="home-hero">
        <span className="home-kicker">YOUR DAILY NEWS DASHBOARD</span>
        <h1>
          The stories that matter, <span className="highlight">without the noise.</span>
        </h1>
        <p className="home-intro">
          The Daily Bytes brings current headlines, focused category feeds, trending stories,
          and daily extras into one clean reading experience.
        </p>
        <div className="home-actions">
          <Link to="/dailybyte" className="get-started-btn">Browse latest stories</Link>
          <Link to="/trending" className="secondary-btn">See what&apos;s trending</Link>
        </div>
      </section>

      <section className="home-category-section" aria-labelledby="browse-heading">
        <div className="section-heading">
          <span>EXPLORE</span>
          <h2 id="browse-heading">Pick your feed</h2>
          <p>Jump straight into the topics you care about.</p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" to={category.to} key={category.label}>
              <span className="category-label">{category.label}</span>
              <p>{category.copy}</p>
              <span className="category-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-reader-callout">
        <div>
          <span className="home-kicker">READER ACCESS</span>
          <h2>One account. Your full Daily Bytes experience.</h2>
          <p>Sign in for complete category navigation, or use the demo account to explore instantly.</p>
        </div>
        <Link to="/login" className="reader-link">Open reader access</Link>
      </section>
    </main>
  );
};

export default Home;
