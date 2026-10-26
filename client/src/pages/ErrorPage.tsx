import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCpu, FiSearch, FiZap } from 'react-icons/fi';
import './ErrorPage.css';

const ErrorPage = () => {
  return (
    <main className="error-page">
      <section className="error-card" aria-labelledby="error-title">
        <div className="error-code" aria-hidden="true">404</div>

        <div className="error-copy">
          <span className="error-kicker"><FiZap /> LOST BYTE</span>
          <h1 id="error-title">That page dropped out of the feed.</h1>
          <p>
            The route may have moved or never existed. Jump back into the gaming feed or go straight
            to one of the beats Daily Bytes is built around.
          </p>
        </div>

        <div className="error-actions">
          <Link className="error-primary" to="/">
            <FiArrowLeft /> Back to gaming
          </Link>
          <Link to="/dailybyte?q=The%20Witcher%203">
            <FiSearch /> Witcher 3
          </Link>
          <Link to="/dailybyte?q=NVIDIA%20GPU">
            <FiCpu /> NVIDIA + RTX
          </Link>
        </div>

        <div className="error-signal" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
