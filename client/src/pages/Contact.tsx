import './Contact.css';

export default function Contact() {
  return <section className="contact-container">
    <h1>About this project</h1>
    <p className="contact-subtext">The Daily Bytes is a portfolio news-reader project. Browse by category or search for a topic that interests you.</p>
    <div className="contact-info">
      <h2>Feedback and project details</h2>
      <p>This demo does not currently deliver contact-form messages. Visit the repository for the code and project information.</p>
      <a href="https://github.com/PHTMGatt/The-Daily-Bytes" target="_blank" rel="noopener noreferrer">View The Daily Bytes on GitHub</a>
      <h2>Your data</h2>
      <p>Reader profiles are local to this browser, not cloud accounts. Do not enter sensitive information or reuse a real password. News searches are sent to the news provider through the application server.</p>
    </div>
  </section>;
}
