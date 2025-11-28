'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getUser } from '@/utils/auth';
import { User } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: ''
  });

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      avatar: currentUser.avatar || '',
      bio: currentUser.bio || ''
    });
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data);
      setSuccess('Profile updated successfully!');

      // Update localStorage
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error: unknown) {
      setError((error as any).response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: formData.avatar ? `url(${formData.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: formData.avatar ? 'transparent' : 'white',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {!formData.avatar && (formData.name ? formData.name.charAt(0).toUpperCase() : '👤')}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                {formData.name}
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #fcc'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#efe',
                color: '#3c3',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #cfc'
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your display name"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your email"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                  placeholder="https://example.com/avatar.jpg"
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  Enter a URL to an image for your avatar. Leave empty to use your initials.
                </small>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Tell us about yourself..."
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  Share a bit about yourself, your reading preferences, or favorite genres.
                </small>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: saving ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #eee'
            }}>
              <Link href="/" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 