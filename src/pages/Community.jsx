import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, addPost } from '../services/db';
import { ArrowLeft, MessageCircle, Heart, Plus, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Community.css';

const CATEGORIES = ['All', 'Dogs', 'Cats', 'Health', 'Training', 'Funny'];

export default function Community() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Post Form State
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Dogs' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts(activeCategory);
  }, [activeCategory]);

  async function loadPosts(cat) {
    setLoading(true);
    const data = await getPosts(cat);
    setPosts(data);
    setLoading(false);
  }

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    
    setSubmitting(true);
    try {
      await addPost({
        ...newPost,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        authorName: userProfile?.name || currentUser.email.split('@')[0],
      });
      setIsModalOpen(false);
      setNewPost({ title: '', content: '', category: 'Dogs' });
      loadPosts(activeCategory); // Refresh list
    } catch (error) {
      alert("Failed to create post");
    }
    setSubmitting(false);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="community-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="community-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Community Forum</h1>
            <p>Connect with other pet parents, ask questions, and share stories.</p>
          </div>
        </div>
        
        <div className="community-actions">
          <div className="search-bar glass-panel" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Post
          </button>
        </div>

        <div className="categories">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="posts-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <MessageCircle size={48} className="text-tertiary" style={{ margin: '0 auto 1rem' }} />
            <h3>No posts found</h3>
            <p className="text-secondary">Be the first to start a discussion in this category!</p>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div 
              key={post.id} 
              className="post-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => alert('Post Detail view not implemented yet! We need to add comments.')}
            >
              <div className="post-votes">
                <button className="vote-btn" onClick={(e) => e.stopPropagation()}>
                  <Heart size={20} />
                </button>
                <span style={{ fontWeight: 600 }}>{post.upvotes || 0}</span>
              </div>
              
              <div className="post-content">
                <div className="post-header">
                  <span className="post-category">{post.category}</span>
                  <span className="post-author">by {post.authorName}</span>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    • {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}</p>
                
                <div className="post-footer">
                  <div className="post-stat">
                    <MessageCircle size={16} /> 0 Comments
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h2>Create Discussion</h2>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={100}
                    placeholder="What do you want to discuss?"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea 
                    required 
                    placeholder="Add more details here..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
