'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '@/types';
import { useParams } from 'next/navigation';

export default function UserBookshelfPage() {
  const params = useParams() as { id: string; status: string };
  const { id, status } = params;
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuthStore();

  const statusLabels = {
    'want-to-read': 'Want to Read',
    'currently-reading': 'Currently Reading',
    'read': 'Read'
  };

  const statusColors = {
    'want-to-read': { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' },
    'currently-reading': { bg: '#fff3e0', color: '#f57c00', border: '#ffe0b2' },
    'read': { bg: '#e8f5e8', color: '#388e3c', border: '#c8e6c9' }
  };


  useEffect(() => {
    fetchUserBookshelf();
  }, [id, status]);

  const fetchUserBookshelf = async () => {
    setLoading(true);
    setError('');
    try {
      const [userResponse, booksResponse] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/bookshelf?status=${status}`)
      ]);

      setUser(userResponse.data);
      setBooks(booksResponse.data);
    } catch (error: unknown) {
      setError('Failed to load bookshelf');
      console.error('Error fetching bookshelf:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
          <p>Loading bookshelf...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ marginBottom: '1rem' }}>User Not Found</h1>
          <Link href="/community" style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none' }}>📚 Goodreads Clone</Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/books" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Browse Books</Link>
          <Link href="/bookshelf" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>My Bookshelf</Link>
          <Link href="/community" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Community</Link>
          {currentUser && (
            <Link href="/profile" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>My Profile</Link>
          )}
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/community" style={{ color: 'white', textDecoration: 'none' }}>Community</Link>
            <span style={{ margin: '0 0.5rem', color: 'white' }}>→</span>
            <Link href={`/profile/${user._id}`} style={{ color: 'white', textDecoration: 'none' }}>{user.name}</Link>
            <span style={{ margin: '0 0.5rem', color: 'white' }}>→</span>
            <span style={{ color: 'white', opacity: 0.8 }}>{statusLabels[status as keyof typeof statusLabels]}</span>
          </div>

          {/* Header */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: user.avatar ? `url(${user.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: user.avatar ? 'transparent' : 'white',
                border: '3px solid white'
              }}>
                {!user.avatar && (user.name ? user.name.charAt(0).toUpperCase() : '👤')}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#333' }}>
                  {user.name}'s {statusLabels[status as keyof typeof statusLabels]}
                </h1>
                <p style={{ color: '#666', margin: 0 }}>
                  {books.length} book{books.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.entries(statusLabels).map(([status, label]) => (
                <Link
                  key={status}
                  href={`/profile/${user._id}/bookshelf/${status}`}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    background: params.status === status ? statusColors[status as keyof typeof statusColors].bg : 'transparent',
                    color: status === status ? statusColors[status as keyof typeof statusColors].color : '#666',
                    border: status === status ? `2px solid ${statusColors[status as keyof typeof statusColors].border}` : '2px solid transparent'
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#c33',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {books.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                No books in {statusLabels[status as keyof typeof statusLabels].toLowerCase()}
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                {user.name} hasn't added any books to this shelf yet.
              </p>
              <Link href={`/profile/${user._id}`} style={{
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Back to {user.name}'s Profile
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {books.map((bookshelfItem) => (
                <div key={bookshelfItem._id} style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: bookshelfItem.book.coverUrl || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem'
                  }}>
                    {bookshelfItem.book.coverUrl ? '' : '📖'}
                  </div>

                  <h3 style={{
                    fontSize: '1.25rem',
                    marginBottom: '0.5rem',
                    color: '#333',
                    fontWeight: 'bold'
                  }}>
                    {bookshelfItem.book.title}
                  </h3>

                  <p style={{
                    color: '#666',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    by {bookshelfItem.book.author}
                  </p>

                  {bookshelfItem.book.description && (
                    <p style={{
                      color: '#555',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {bookshelfItem.book.description.length > 100
                        ? `${bookshelfItem.book.description.substring(0, 100)}...`
                        : bookshelfItem.book.description
                      }
                    </p>
                  )}

                  {bookshelfItem.rating && (
                    <div style={{ color: '#f39c12', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      ⭐ {bookshelfItem.rating}/5
                    </div>
                  )}

                  {bookshelfItem.review && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      "{bookshelfItem.review}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 