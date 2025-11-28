'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getUser, logout } from '@/utils/auth';
import { Book, User } from '@/types';



interface BookshelfItem {
  _id: string;
  book: Book;
  status: string;
  rating?: number;
  review?: string;
  dateAdded: string;
}

export default function Bookshelf() {
  const [bookshelf, setBookshelf] = useState<BookshelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    if (currentUser) {
      fetchBookshelf();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookshelf = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/users/${getUser()._id}/bookshelf`);
      setBookshelf(response.data);
    } catch (error: unknown) {
      if ((error as any).response?.status === 401) {
        setError('Please log in to view your bookshelf.');
      } else {
        setError('Failed to load your bookshelf. Please try again.');
      }
      console.error('Error fetching bookshelf:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRemoveFromShelf = async (bookshelfId: string) => {
    try {
      await api.delete(`/users/bookshelf/${bookshelfId}`);
      setBookshelf(prev => prev.filter(item => item._id !== bookshelfId));
    } catch (error: unknown) {
      setError('Failed to remove book from shelf.');
    }
  };

  const handleUpdateStatus = async (bookshelfId: string, newStatus: string) => {
    try {
      await api.put(`/users/bookshelf/${bookshelfId}`, { status: newStatus });
      setBookshelf(prev =>
        prev.map(item =>
          item._id === bookshelfId
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (error: unknown) {
      setError('Failed to update book status.');
    }
  };

  const getBooksByStatus = (status: string) => {
    return bookshelf.filter(item => item.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'want-to-read': return '📖';
      case 'currently-reading': return '📚';
      case 'read': return '✅';
      default: return '📖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'want-to-read': return '#667eea';
      case 'currently-reading': return '#f39c12';
      case 'read': return '#28a745';
      default: return '#667eea';
    }
  };

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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ marginBottom: '1rem' }}>Login Required</h1>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
            Please log in to view your bookshelf.
          </p>
          <Link href="/login" style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Login
          </Link>
        </div>
      </div>
    );
  }

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
          <p>Loading your bookshelf...</p>
        </div>
      </div>
    );
  }

  const wantToRead = getBooksByStatus('want-to-read');
  const currentlyReading = getBooksByStatus('currently-reading');
  const read = getBooksByStatus('read');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <Link href="/" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          📚 Goodreads Clone
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: '0.9rem' }}>
            Welcome, {user.name}!
          </span>
          <Link href="/books" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.2)'
          }}>
            Browse Books
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
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              My Bookshelf
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Track your reading journey
            </p>
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

          {bookshelf.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'white',
              padding: '4rem 2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ marginBottom: '1rem' }}>Your bookshelf is empty</h2>
              <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
                Start building your reading list by adding books from the catalog!
              </p>
              <Link href="/books" style={{
                background: 'white',
                color: '#667eea',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Browse Books
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Currently Reading */}
              {currentlyReading.length > 0 && (
                <div>
                  <h2 style={{
                    color: 'white',
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    📚 Currently Reading ({currentlyReading.length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}>
                    {currentlyReading.map((item) => (
                      <BookCard
                        key={item._id}
                        item={item}
                        onRemove={handleRemoveFromShelf}
                        onUpdateStatus={handleUpdateStatus}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Want to Read */}
              {wantToRead.length > 0 && (
                <div>
                  <h2 style={{
                    color: 'white',
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    📖 Want to Read ({wantToRead.length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}>
                    {wantToRead.map((item) => (
                      <BookCard
                        key={item._id}
                        item={item}
                        onRemove={handleRemoveFromShelf}
                        onUpdateStatus={handleUpdateStatus}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Read */}
              {read.length > 0 && (
                <div>
                  <h2 style={{
                    color: 'white',
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    ✅ Read ({read.length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}>
                    {read.map((item) => (
                      <BookCard
                        key={item._id}
                        item={item}
                        onRemove={handleRemoveFromShelf}
                        onUpdateStatus={handleUpdateStatus}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Book Card Component
function BookCard({
  item,
  onRemove,
  onUpdateStatus,
  getStatusIcon,
  getStatusColor
}: {
  item: BookshelfItem;
  onRemove: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  getStatusIcon: (status: string) => string;
  getStatusColor: (status: string) => string;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        height: '200px',
        background: item.book.coverUrl || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '3rem'
      }}>
        {item.book.coverUrl ? '' : '📖'}
      </div>

      <h3 style={{
        fontSize: '1.25rem',
        marginBottom: '0.5rem',
        color: '#333',
        fontWeight: 'bold'
      }}>
        {item.book.title}
      </h3>

      <p style={{
        color: '#666',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        by {item.book.author}
      </p>

      {item.book.description && (
        <p style={{
          color: '#555',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          marginBottom: '1rem'
        }}>
          {item.book.description.length > 100
            ? `${item.book.description.substring(0, 100)}...`
            : item.book.description
          }
        </p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: getStatusColor(item.status),
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {getStatusIcon(item.status)} {item.status}
        </div>

        {item.book.averageRating && item.book.averageRating > 0 && (
          <div style={{ color: '#f39c12', fontWeight: 'bold' }}>
            ⭐ {item.book.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setShowActions(!showActions)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            flex: 1
          }}
        >
          Actions
        </button>
        <button
          onClick={() => onRemove(item._id)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Remove
        </button>
      </div>

      {showActions && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '0.5rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Change Status:</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['want-to-read', 'currently-reading', 'read'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  onUpdateStatus(item._id, status);
                  setShowActions(false);
                }}
                disabled={status === item.status}
                style={{
                  background: status === item.status ? '#ccc' : getStatusColor(status),
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  cursor: status === item.status ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {getStatusIcon(status)} {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 