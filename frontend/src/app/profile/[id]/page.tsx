'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '@/types';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const params = useParams() as { id: string };
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuthStore();
  const [bookshelfStats, setBookshelfStats] = useState({
    'want-to-read': 0,
    'currently-reading': 0,
    'read': 0
  });
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);


  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [userResponse, bookshelfResponse, followersResponse, followingResponse] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/bookshelf/stats`),
        api.get(`/users/${id}/followers`),
        api.get(`/users/${id}/following`)
      ]);

      setUser(userResponse.data);
      setBookshelfStats(bookshelfResponse.data);
      setFollowers(followersResponse.data);
      setFollowing(followingResponse.data);

      // Check if current user is following this user
      if (currentUser) {
        const isFollowingResponse = await api.get(`/users/${id}/follow-status`);
        setIsFollowing(isFollowingResponse.data.isFollowing);
      }
    } catch (error: unknown) {
      setError('User not found or profile is private');
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/users/${id}/follow`);
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f._id !== currentUser._id));
      } else {
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        setFollowers(prev => [...prev, currentUser]);
      }
    } catch (error: unknown) {
      console.error('Error following/unfollowing:', error);
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
          <p>Loading profile...</p>
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
          <h1 style={{ marginBottom: '1rem' }}>Profile Not Found</h1>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
            {error || 'This user profile could not be found.'}
          </p>
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            {/* Profile Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: user.avatar ? `url(${user.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: user.avatar ? 'transparent' : 'white',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {!user.avatar && (user.name ? user.name.charAt(0).toUpperCase() : '👤')}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                {user.name}
              </h1>
              <p style={{ color: '#666', margin: 0, marginBottom: '1rem' }}>
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>

              {/* Follow Button */}
              {currentUser && currentUser._id !== user._id && (
                <button
                  onClick={handleFollow}
                  style={{
                    background: isFollowing ? '#dc3545' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>{followers.length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Followers</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>{following.length}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Following</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {bookshelfStats['want-to-read'] + bookshelfStats['currently-reading'] + bookshelfStats['read']}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Books</div>
              </div>
            </div>

            {/* Bookshelf Links */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
                {user.name}'s Bookshelf
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <Link href={`/profile/${user._id}/bookshelf/want-to-read`} style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '1px solid #bbdefb',
                  transition: 'transform 0.2s'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to Read</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{bookshelfStats['want-to-read']} books</div>
                </Link>

                <Link href={`/profile/${user._id}/bookshelf/currently-reading`} style={{
                  background: '#fff3e0',
                  color: '#f57c00',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '1px solid #ffe0b2',
                  transition: 'transform 0.2s'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Currently Reading</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{bookshelfStats['currently-reading']} books</div>
                </Link>

                <Link href={`/profile/${user._id}/bookshelf/read`} style={{
                  background: '#e8f5e8',
                  color: '#388e3c',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '1px solid #c8e6c9',
                  transition: 'transform 0.2s'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Read</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{bookshelfStats['read']} books</div>
                </Link>
              </div>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                  About {user.name}
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                  {user.bio}
                </p>
              </div>
            )}

            {/* Followers Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
                Followers ({followers.length})
              </h3>
              {followers.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem'
                }}>
                  {followers.slice(0, 12).map((follower: User) => (
                    <Link key={follower._id} href={`/profile/${follower._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        background: '#f8f9fa',
                        borderRadius: '0.5rem',
                        border: '1px solid #e9ecef',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: follower.avatar ? `url(${follower.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          margin: '0 auto 0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          color: follower.avatar ? 'transparent' : 'white',
                          border: '2px solid white'
                        }}>
                          {!follower.avatar && (follower.name ? follower.name.charAt(0).toUpperCase() : '👤')}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
                          {follower.name}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                  No followers yet
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <Link href="/community" style={{
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                Browse Community
              </Link>
              {currentUser && currentUser._id !== user._id && (
                <Link href="/books" style={{
                  background: '#28a745',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Browse Books
                </Link>
              )}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #eee'
            }}>
              <Link href="/community" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                ← Back to Community
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 