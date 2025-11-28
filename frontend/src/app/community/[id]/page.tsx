"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getUser } from '@/utils/auth';
import { Group, Topic, User } from '@/types';

export default function CommunityPage({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'discussions' | 'members'>('home');
  const [isMember, setIsMember] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const { id } = React.use(params) as { id: string };
  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    async function fetchData() {
      const groupRes = await api.get(`/groups/${id}`);
      setGroup(groupRes.data);
      setMembers(groupRes.data.members);
      setIsMember(groupRes.data.members.some((m: User) => m._id === user?._id));
      const topicsRes = await api.get(`/groups/${id}/topics`);
      setTopics(topicsRes.data);
    }
    if (user) fetchData();
  }, [id, user]);

  const handleJoin = async () => {
    await api.post(`/groups/${id}/join`);
    setIsMember(true);
    setMembers((prev) => user ? [...prev, user] : prev);
  };

  const handleLeave = async () => {
    await api.post(`/groups/${id}/leave`);
    setIsMember(false);
    setMembers((prev) => prev.filter((m: User) => user && m._id !== user._id));
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicContent.trim()) return;

    setCreatingTopic(true);
    try {
      const response = await api.post(`/groups/${id}/topics`, {
        title: topicTitle,
        content: topicContent
      });
      setTopics(prev => [response.data, ...prev]);
      setTopicTitle('');
      setTopicContent('');
      setShowTopicForm(false);
    } catch (error: unknown) {
      console.error('Error creating topic:', error);
    } finally {
      setCreatingTopic(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 5; // Number of topics per page
  const totalTopics = topics.length; // Total number of topics

  // Calculate the indexes for the current page
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;

  // Slice the topics based on the current page
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);

  // Calculate total pages
  const totalPages = Math.ceil(totalTopics / topicsPerPage);


  if (!group) return <div>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none' }}>📚 Goodreads Clone</Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/books" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Browse Books</Link>
          <Link href="/bookshelf" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>My Bookshelf</Link>
          <Link href="/profile" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Profile</Link>
          <Link href="/community" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Browse Groups</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 1200, margin: '2rem auto', background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem' }}>
        {/* Group Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: 8 }}>{group.name}</h1>
            <div style={{ color: '#666', marginBottom: 8 }}>{group.description}</div>
            <div>
              {group.tags.map((tag: string) => (
                <span key={tag} style={{ background: '#667eea', color: 'white', borderRadius: 4, padding: '2px 8px', marginRight: 8, fontSize: 12 }}>{tag}</span>
              ))}
            </div>
            <div style={{ color: '#888', marginTop: 8 }}>{members.length} members</div>
          </div>
          {isMember ? (
            <button onClick={handleLeave} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              Leave Group
            </button>
          ) : (
            <button onClick={handleJoin} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              Join Group
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #eee', marginBottom: 24 }}>
          {['home', 'discussions', 'members'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'home' | 'discussions' | 'members')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #667eea' : 'none',
                color: activeTab === tab ? '#667eea' : '#333',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                fontSize: '1rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Recent Discussions</h2>
            <div>
              {currentTopics.slice(0, 5).map(topic => (
                <Link key={topic._id} href={`/community/topic/${topic._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderBottom: '1px solid #eee', padding: '1rem 0', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#667eea' }}>{topic.title}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>
                      By {topic.author?.name || 'Unknown'} · {topic.posts.length} posts
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Pagination Controls */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: currentPage === 1 ? '#ccc' : '#667eea',
                  color: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Previous
              </button>
              <span>{currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: currentPage === totalPages ? '#ccc' : '#667eea',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Next
              </button>
            </div>
            {isMember && (
              <button
                onClick={() => setShowTopicForm(true)}
                style={{
                  marginTop: 16,
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Start a Discussion
              </button>
            )}
          </div>
        )}

        {activeTab === 'discussions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.3rem' }}>All Discussions</h2>
              {isMember && (
                <button
                  onClick={() => setShowTopicForm(true)}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  New Discussion
                </button>
              )}
            </div>
            {currentTopics.map(topic => (
              <Link key={topic._id} href={`/community/topic/${topic._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ borderBottom: '1px solid #eee', padding: '1rem 0', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#667eea' }}>{topic.title}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>
                    By {topic.author?.name || 'Unknown'} · {topic.posts.length} posts
                  </div>
                </div>
              </Link>
            ))}
            {/* Pagination Controls */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: currentPage === 1 ? '#ccc' : '#667eea',
                  color: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Previous
              </button>
              <span>{currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: currentPage === totalPages ? '#ccc' : '#667eea',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Members ({members.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {members.map((member: User) => (
                <Link key={member._id} href={`/profile/${member._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div key={member._id} style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    border: '1px solid #e9ecef',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: member.avatar ? `url(${member.avatar}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: member.avatar ? 'transparent' : 'white',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {!member.avatar && (member.name ? member.name.charAt(0).toUpperCase() : '👤')}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#667eea' }}>{member.name}</div>
                    {member.bio && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        lineHeight: '1.4',
                        maxHeight: '2.8em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {member.bio}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Topic Creation Form */}
        {showTopicForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Start a New Discussion</h3>
              <form onSubmit={handleCreateTopic}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
                  <input
                    type="text"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #ddd',
                      fontSize: '1rem'
                    }}
                    placeholder="Discussion title"
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Content</label>
                  <textarea
                    value={topicContent}
                    onChange={(e) => setTopicContent(e.target.value)}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Share your thoughts..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowTopicForm(false)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTopic}
                    style={{
                      background: creatingTopic ? '#ccc' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      cursor: creatingTopic ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {creatingTopic ? 'Creating...' : 'Create Discussion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 