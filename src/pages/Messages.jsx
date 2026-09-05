import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats, subscribeToChat, sendMessage } from '../services/db';
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react';
import './Messages.css';

export default function Messages() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load all user's chats for the sidebar
  useEffect(() => {
    async function loadChats() {
      if (!currentUser) return;
      try {
        const userChats = await getUserChats(currentUser.uid);
        setChats(userChats);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    loadChats();
  }, [currentUser]);

  // Subscribe to the active chat thread
  useEffect(() => {
    if (!chatId) {
      setActiveChat(null);
      return;
    }
    
    const unsubscribe = subscribeToChat(chatId, (chatData) => {
      setActiveChat(chatData);
      scrollToBottom();
    });
    
    return () => unsubscribe();
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId) return;
    
    try {
      await sendMessage(chatId, currentUser.uid, messageText.trim());
      setMessageText('');
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  return (
    <div className="messages-layout">
      {/* Sidebar: Chat List */}
      <aside className={`messages-sidebar glass-panel ${chatId ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-header">
          <button className="icon-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h2>My Messages</h2>
        </div>
        
        <div className="chat-list">
          {loading ? (
            <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Loading chats...</p>
          ) : chats.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No conversations yet.</p>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-list-item ${chat.id === chatId ? 'active' : ''}`}
                onClick={() => navigate(`/messages/${chat.id}`)}
              >
                <div className="chat-avatar badge-primary">
                  <User size={20} />
                </div>
                <div className="chat-preview">
                  <h4>{chat.listingTitle}</h4>
                  <p>
                    {chat.messages?.length > 0 
                      ? chat.messages[chat.messages.length - 1].text 
                      : 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Area: Active Chat */}
      <main className={`messages-main glass-panel ${!chatId ? 'hidden-mobile' : ''}`}>
        {!chatId ? (
          <div className="empty-chat-state">
            <MessageSquare size={48} className="text-tertiary" />
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to view messages.</p>
          </div>
        ) : !activeChat ? (
          <div className="loading-state">Loading chat...</div>
        ) : (
          <div className="chat-container">
            <header className="chat-header">
              <button className="icon-btn mobile-only" onClick={() => navigate('/messages')}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-info">
                <h3>{activeChat.listingTitle}</h3>
                <span className="chat-role">
                  {activeChat.buyerId === currentUser.uid ? 'You are the Buyer' : 'You are the Seller'}
                </span>
              </div>
            </header>

            <div className="chat-history">
              {activeChat.messages?.length === 0 ? (
                <div className="empty-history text-secondary">
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                activeChat.messages?.map((msg, index) => {
                  const isMine = msg.senderId === currentUser.uid;
                  return (
                    <div key={index} className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                      <div className={`message-bubble ${isMine ? 'bg-primary text-white' : 'bg-gray'}`}>
                        {msg.text}
                      </div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="form-control"
              />
              <button type="submit" className="btn btn-primary icon-btn" disabled={!messageText.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
