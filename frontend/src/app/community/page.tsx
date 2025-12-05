'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/auth';
import { useAuthStore, useGroupStore } from '@/store';



export default function CommunityPage() {
  const { user, checkAuth } = useAuthStore();
  const {
    groups,
    loading,
    error,
    searchTerm,
    page,
    totalPages,
    totalGroups,
    setGroups,
    setLoading,
    setError,
    setSearchTerm,
    setPage,
    setTotalPages,
    setTotalGroups
  } = useGroupStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [page, searchTerm]);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/groups?${params}`);
      setGroups(response.data.groups);
      setTotalPages(response.data.pages);
      setTotalGroups(response.data.total);
    } catch (error: unknown) {
      setError('Failed to load groups. Please try again.');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGroups();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading && groups.length === 0) {
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
          <p>Loading groups...</p>
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
          {user && (
            <>
              <Link href="/bookshelf" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>My Bookshelf</Link>
              <Link href="/profile" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Profile</Link>
              <Link href="/community/create" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>Create Group</Link>
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
              Book Clubs & Groups
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Join communities of readers and discover new books together
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <input
              type="text"
              placeholder="Search groups by name, description, or tags..."
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
            <button
              type="submit"
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Search
            </button>
          </form>

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

          {groups.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'white',
              padding: '4rem 2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ marginBottom: '1rem' }}>
                {searchTerm ? 'No groups found' : 'No groups available'}
              </h2>
              <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Be the first to create a group!'
                }
              </p>
              {user && (
                <Link href="/community/create" style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}>
                  Create First Group
                </Link>
              )}
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {groups.map((group) => (
                  <Link
                    key={group._id}
                    href={`/community/${group._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      background: 'white',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        marginBottom: '0.5rem',
                        color: '#333',
                        fontWeight: 'bold'
                      }}>
                        {group.name}
                      </h3>

                      <p style={{
                        color: '#666',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        flex: 1
                      }}>
                        {group.description || 'No description available'}
                      </p>

                      {group.tags && group.tags.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          {group.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} style={{
                              background: '#667eea',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.8rem',
                              marginRight: '0.5rem'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        color: '#888'
                      }}>
                        <span>👥 {group.members.length} members</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: group.createdBy?.avatar ? `url(${group.createdBy.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            color: group.createdBy?.avatar ? 'transparent' : 'white',
                            border: '1px solid white'
                          }}>
                            {!group.createdBy?.avatar && (group.createdBy?.name ? group.createdBy.name.charAt(0).toUpperCase() : '👤')}
                          </div>
                          <span>Created by {group.createdBy?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
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
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

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
                    Page {page} of {totalPages} ({totalGroups.toLocaleString()} groups)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 