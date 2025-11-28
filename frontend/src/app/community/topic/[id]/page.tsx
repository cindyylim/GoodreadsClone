'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getUser } from '@/utils/auth';
import { Topic, User, Post } from '@/types';

export default function TopicPage({ params }: { params: { id: string } }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { id } = React.use(params) as { id: string };

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/topics/${params.id}`);
      setTopic(response.data);
    } catch (error: unknown) {
      setError('Failed to load topic. Please try again.');
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setPostingReply(true);
    try {
      const response = await api.post(`/topics/${params.id}/reply`, {
        content: replyContent
      });
      setTopic(response.data);
      setReplyContent('');
    } catch (error: unknown) {
      console.error('Error posting reply:', error);
    } finally {
      setPostingReply(false);
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
          <p>Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
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
          <h1 style={{ marginBottom: '1rem' }}>Discussion Not Found</h1>
          <Link href="/community" style={{
            background: 'white',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Back to Groups
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
          <Link href="/profile" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Profile</Link>
          <Link href="/community" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Browse Groups</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/community" style={{ color: '#667eea', textDecoration: 'none' }}>Groups</Link>
          <span style={{ margin: '0 0.5rem' }}>→</span>
          <Link href={`/community/${topic.group._id}`} style={{ color: '#667eea', textDecoration: 'none' }}>{topic.group.name}</Link>
          <span style={{ margin: '0 0.5rem' }}>→</span>
          <span style={{ color: '#666' }}>Discussion</span>
        </div>

        {/* Topic Header */}
        <div style={{ borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{topic.title}</h1>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>
            Started by {topic.author?.name || 'Unknown'} • {new Date(topic.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Posts */}
        <div style={{ marginBottom: '2rem' }}>
          {topic.posts.map((post: Post, index: number) => (
            <div key={index} style={{
              border: index === 0 ? '2px solid #667eea' : '1px solid #eee',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1rem',
              background: index === 0 ? '#f8f9ff' : 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: post.author?.avatar ? `url(${post.author.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: post.author?.avatar ? 'transparent' : 'white',
                  border: '2px solid white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}>
                  {!post.author?.avatar && (post.author?.name ? post.author.name.charAt(0).toUpperCase() : '👤')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Link
                      href={`/profile/${post.author?._id}`}
                      style={{
                        fontWeight: 'bold',
                        color: '#667eea',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {post.author?.name || 'Unknown'}
                    </Link>
                    {index === 0 && <span style={{
                      background: '#667eea',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      OP
                    </span>}
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>
                      {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{
                    lineHeight: '1.6',
                    color: '#333',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.95rem'
                  }}>
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {user && (
          <div style={{ borderTop: '2px solid #eee', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Add a Reply</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  resize: 'vertical',
                  marginBottom: '1rem'
                }}
                placeholder="Share your thoughts..."
              />
              <button
                type="submit"
                disabled={postingReply || !replyContent.trim()}
                style={{
                  background: postingReply || !replyContent.trim() ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  cursor: postingReply || !replyContent.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {postingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '0.5rem',
            borderTop: '2px solid #eee'
          }}>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Please log in to reply to this discussion.
            </p>
            <Link href="/login" style={{
              background: '#667eea',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 