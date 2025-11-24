import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="cosmic-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ color: 'var(--cosmic-gold)', fontFamily: "'Cinzel', serif", marginBottom: '1rem' }}>
        404 - Page Not Found
      </h2>
      <p style={{ color: 'var(--cosmic-text)', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist in this realm.
      </p>
      <Link href="/" className="cosmic-button cosmic-button-primary">
        Return to Cosmic Tarot
      </Link>
    </div>
  );
}

