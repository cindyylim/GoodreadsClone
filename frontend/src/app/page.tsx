'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          📚 Goodreads Clone
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/books" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            transition: 'background 0.3s'
          }}>
            Browse Books
          </Link>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem' }}>
                Welcome, {user.name}!
              </span>
              <Link href="/bookshelf" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.3s',
                fontSize: '0.9rem'
              }}>
                My Bookshelf
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'background 0.3s'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.3s'
              }}>
                Login
              </Link>
              <Link href="/signup" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 'bold',
                transition: 'background 0.3s'
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Discover Your Next Great Read
        </h1>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9,
          lineHeight: 1.6
        }}>
          Track your reading journey, discover new books, and connect with fellow readers.
          Join our community of book lovers today!
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/books" style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }}>
            Browse Books
          </Link>
          <Link href="/signup" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '2px solid white',
            transition: 'background 0.3s',
            display: 'inline-block'
          }}>
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div style={{
          marginTop: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Track Your Reading</h3>
            <p style={{ opacity: 0.8 }}>Keep track of books you've read, are reading, and want to read.</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Rate & Review</h3>
            <p style={{ opacity: 0.8 }}>Share your thoughts and discover what others think about books.</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Connect</h3>
            <p style={{ opacity: 0.8 }}>Join book clubs and connect with friends who share your reading interests.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
