import { Link } from 'react-router-dom';
const ErrorPage = () => {
  return (
    <section>
      <h1>404: Page Not Found</h1>
      <p>This page could not be opened. Check the address or return to the homepage.</p>
      <Link to="/">Back to The Daily Bytes</Link>
    </section>
  );
};

export default ErrorPage;
