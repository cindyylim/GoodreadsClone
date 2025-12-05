'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function CreateGroupPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

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
            Please log in to create a group.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/groups', {
        name,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      router.push(`/community/${res.data._id}`);
    } catch (err: unknown) {
      setError((err as any).response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none' }}>📚 Goodreads Clone</Link>
        <Link href="/community" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Browse Groups</Link>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          minWidth: '400px',
          maxWidth: '500px'
        }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Create a New Group</h1>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Group Name *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
              placeholder="Enter group name"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Describe your group..."
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
              placeholder="e.g., fantasy, romance, classics"
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Add tags to help others find your group
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/community" style={{ color: '#667eea', textDecoration: 'none' }}>
              ← Back to Groups
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 