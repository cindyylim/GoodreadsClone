'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/auth';
import { useAuthStore, useBookStore } from '@/store';

import { Book } from '@/types';

interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

const PAGE_SIZE = 20;

export default function Books() {
  const { user, logout } = useAuthStore();
  const {
    books,
    loading,
    error,
    searchTerm,
    page,
    totalPages,
    totalBooks,
    setBooks,
    setLoading,
    setError,
    setSearchTerm,
    setPage,
    setTotalPages,
    setTotalBooks,
    externalBooks,
    loadingExternal,
    searchExternalBooks,
  } = useBookStore();
  const [addingToShelf, setAddingToShelf] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);


  useEffect(() => {
    console.log('Dropdown state changed:', showStatusDropdown);
  }, [showStatusDropdown]);

  useEffect(() => {
    fetchBooks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatusDropdown) {
        // Check if the click target is part of the dropdown or the button
        const target = event.target as Element;
        const dropdownContainer = document.querySelector(`[data-dropdown="${showStatusDropdown}"]`);
        const buttonContainer = document.querySelector(`[data-button="${showStatusDropdown}"]`);

        if (dropdownContainer && !dropdownContainer.contains(target) &&
          buttonContainer && !buttonContainer.contains(target)) {
          setShowStatusDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const fetchBooks = async (pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<BooksResponse>(`/books?page=${pageNum}&limit=${PAGE_SIZE}`);
      setBooks(response.data.books);
      setTotalPages(response.data.pages);
      setTotalBooks(response.data.total);
    } catch (error) {
      setError('Failed to load books. Please try again.');
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleAddToShelf = async (book: Book, status: string) => {
    if (!user) {
      setError('Please log in to add books to your shelf.');
      return;
    }

    setAddingToShelf(book._id);
    setShowStatusDropdown(null);

    try {
      let targetBookId = book._id;

      // If it's an external book, import it first
      if (book.isExternal) {
        try {
          const importResponse = await api.post('/books/import', {
            googleId: book._id, // For external books, _id is currently the Google ID
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            description: book.description,
            publishedYear: book.publishedYear,
            averageRating: book.averageRating
          });
          targetBookId = importResponse.data._id;
        } catch (importError) {
          console.error('Error importing book:', importError);
          throw new Error('Failed to import book details');
        }
      }

      await api.post('/users/bookshelf', {
        bookId: targetBookId,
        status
      });

      // Refetch books to update shelf status - might need to refresh external books status too if we were to track it
      await fetchBooks(page);

      // If we added an external book, we might want to show some feedback. 
      // For now, simpler is better.

      setError('');
    } catch (error: unknown) {
      console.error('Add to shelf error:', error);
      const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
      setError(axiosError.response?.data?.message || axiosError.message || 'Failed to add book to shelf.');
    } finally {
      setAddingToShelf(null);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    let start = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let end = start + maxPagesToShow - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <p>Loading books...</p>
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
          {user ? (
            <>
              <span style={{ color: 'white', fontSize: '0.9rem' }}>
                Welcome, {user.name}!
              </span>
              <Link href="/bookshelf" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                fontSize: '0.9rem'
              }}>
                My Bookshelf
              </Link>
              <Link href="/community" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                fontSize: '0.9rem'
              }}>
                Community
              </Link>
              <Link href="/profile" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                fontSize: '0.9rem'
              }}>
                Profile
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
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                Login
              </Link>
              <Link href="/signup" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 'bold'
              }}>
                Sign Up
              </Link>
            </>
          )}
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
              Book Catalog
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Discover amazing books and start your reading journey
            </p>
          </div>

          {/* Search Bar */}
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
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

          {/* External Search Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {searchTerm && (
              <button
                onClick={() => searchExternalBooks(searchTerm)}
                disabled={loadingExternal}
                style={{
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '2rem',
                  fontWeight: 'bold',
                  cursor: loadingExternal ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loadingExternal ? 'Searching Google Books...' : 'Search Google Books'}
                {!loadingExternal && <span>🔍</span>}
              </button>
            )}
          </div>

          {externalBooks.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Results from Google Books</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {externalBooks.map((book) => (
                  <div key={book._id} style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: '#4285F4',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      GOOGLE BOOKS
                    </div>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span style={{ color: 'white', fontSize: '3rem' }}>📖</span>
                      )}
                    </div>

                    <h3 style={{
                      fontSize: '1.25rem',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: 'bold'
                    }}>
                      {book.title}
                    </h3>

                    <p style={{
                      color: '#666',
                      marginBottom: '1rem',
                      fontSize: '0.9rem'
                    }}>
                      by {book.author}
                    </p>

                    {book.description && (
                      <p style={{
                        color: '#555',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '1rem'
                      }}>
                        {book.description.length > 100
                          ? `${book.description.substring(0, 100)}...`
                          : book.description
                        }
                      </p>
                    )}

                    {book.averageRating !== undefined && book.averageRating > 0 && (
                      <div style={{ color: '#f39c12', fontWeight: 'bold', marginBottom: '1rem' }}>
                        ⭐ {book.averageRating.toFixed(1)}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <div data-button={book._id}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowStatusDropdown(showStatusDropdown === book._id ? null : book._id);
                            }}
                            disabled={addingToShelf === book._id}
                            style={{
                              background: addingToShelf === book._id ? '#ccc' : '#667eea',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              cursor: addingToShelf === book._id ? 'not-allowed' : 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            {addingToShelf === book._id ? 'Adding...' : 'Add to Shelf'}
                          </button>
                          {showStatusDropdown === book._id && (
                            <div
                              data-dropdown={book._id}
                              style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                minWidth: '150px'
                              }}
                            >
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                                Select status:
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToShelf(book, 'want-to-read');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 1rem',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '0.9rem',
                                  display: 'block'
                                }}
                              >
                                📖 Want to Read
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToShelf(book, 'currently-reading');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 1rem',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '0.9rem',
                                  display: 'block'
                                }}
                              >
                                📚 Currently Reading
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToShelf(book, 'read');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 1rem',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '0.9rem',
                                  display: 'block'
                                }}
                              >
                                ✅ Read
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredBooks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'white',
              padding: '4rem 2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ marginBottom: '1rem' }}>
                {searchTerm ? 'No books found' : 'No books available'}
              </h2>
              <p style={{ opacity: 0.8 }}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new books!'
                }
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {filteredBooks.map((book) => (
                  <div key={book._id} style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span style={{ color: 'white', fontSize: '3rem' }}>📖</span>
                      )}
                    </div>

                    <h3 style={{
                      fontSize: '1.25rem',
                      marginBottom: '0.5rem',
                      color: '#333',
                      fontWeight: 'bold'
                    }}>
                      {book.title}
                    </h3>

                    <p style={{
                      color: '#666',
                      marginBottom: '1rem',
                      fontSize: '0.9rem'
                    }}>
                      by {book.author}
                    </p>

                    {book.description && (
                      <p style={{
                        color: '#555',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '1rem'
                      }}>
                        {book.description.length > 100
                          ? `${book.description.substring(0, 100)}...`
                          : book.description
                        }
                      </p>
                    )}

                    {book.genres && book.genres.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        {book.genres.slice(0, 3).map((genre, index) => (
                          <span key={index} style={{
                            background: '#667eea',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.8rem',
                            marginRight: '0.5rem'
                          }}>
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {book.averageRating && book.averageRating > 0 && (
                        <div style={{ color: '#f39c12', fontWeight: 'bold' }}>
                          ⭐ {book.averageRating.toFixed(1)}
                        </div>
                      )}
                      <div style={{ position: 'relative' }}>
                        {book.addedToShelf ? (
                          <div style={{
                            background: '#28a745',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            ✓ {book.shelfStatus}
                          </div>
                        ) : (
                          <div data-button={book._id}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Add to Shelf button clicked for book:', book._id);
                                setShowStatusDropdown(showStatusDropdown === book._id ? null : book._id);
                              }}
                              disabled={addingToShelf === book._id}
                              style={{
                                background: addingToShelf === book._id ? '#ccc' : '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: addingToShelf === book._id ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              {addingToShelf === book._id ? 'Adding...' : 'Add to Shelf'}
                            </button>
                            {showStatusDropdown === book._id && (
                              <div
                                data-dropdown={book._id}
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  background: 'white',
                                  border: '1px solid #ddd',
                                  borderRadius: '0.5rem',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                  zIndex: 1000,
                                  minWidth: '150px'
                                }}
                              >
                                <div style={{ padding: '0.5rem', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                                  Select status:
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToShelf(book, 'want-to-read');
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    display: 'block'
                                  }}
                                >
                                  📖 Want to Read
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToShelf(book, 'currently-reading');
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    display: 'block'
                                  }}
                                >
                                  📚 Currently Reading
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToShelf(book, 'read');
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    display: 'block'
                                  }}
                                >
                                  ✅ Read
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: page === 1 ? '#ccc' : '#667eea',
                    color: 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Previous
                </button>
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: pageNum === page ? '2px solid #667eea' : 'none',
                      background: pageNum === page ? 'white' : '#667eea',
                      color: pageNum === page ? '#667eea' : 'white',
                      fontWeight: pageNum === page ? 'bold' : 'normal',
                      cursor: 'pointer',
                      margin: '0 2px'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: page === totalPages ? '#ccc' : '#667eea',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Next
                </button>
                <span style={{ color: 'white', marginLeft: '1rem', fontSize: '0.95rem' }}>
                  Page {page} of {totalPages} ({totalBooks.toLocaleString()} books)
                </span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 