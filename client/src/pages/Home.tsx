import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return <div className="home-container">
    <div className="home-main">
      <header className="home-header">
        <h1>Welcome to <span className="highlight">The Daily Bytes</span></h1>
        <p>Follow a topic, explore a category, or find your next story. Start reading without an account.</p>
        <Link to="/dailybyte" className="get-started-btn">Find your Daily Byte</Link>
      </header>
      <section className="featured-content">
        <h2>Choose your next read</h2>
        <ul>
          <li><Link to="/technology">Technology and innovation</Link></li>
          <li><Link to="/sports">Sports and competition</Link></li>
          <li><Link to="/health">Health and wellbeing</Link></li>
          <li><Link to="/entertainment">Arts and entertainment</Link></li>
        </ul>
      </section>
      <footer className="home-footer">
        <p>A portfolio news-reader project. <Link to="/contact">About the project and your data</Link></p>
      </footer>
    </div>
  </div>;
}
