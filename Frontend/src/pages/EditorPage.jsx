import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const EditorPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContent(res.data.content);
        setTitle(res.data.title);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoc();
  }, [id, token]);

  // WebSocket setup
useEffect(() => {
  const socket = new WebSocket(`ws://localhost:5000?documentId=${id}`);
  socketRef.current = socket;

  socket.onopen = () => {
    console.log('[WS] Connected to WebSocket server');
  };

  socket.onmessage = (event) => {
    console.log('[WS] Message received:', event.data);
    const incoming = JSON.parse(event.data);
    if (incoming.type === 'update') {
      setContent(incoming.content); // <- this should trigger textarea update
    }
  };

  socket.onerror = (err) => {
    console.error('[WS] Error:', err);
  };

  return () => {
    socket.close();
  };
}, [id]);



  // Handle content change
const handleChange = (e) => {
  const newText = e.target.value;
  setContent(newText);

  // Send WS message
  if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    socketRef.current.send(JSON.stringify({ type: 'update', content: newText }));
  }

  // Auto-save
  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    saveDocument(newText);
  }, 1000);
};


  // Save content to backend
const saveDocument = async (updatedContent) => {
  try {
    await api.put(`/documents/${id}`, {
      title: title || 'Untitled Document',
      content: updatedContent
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Document saved');
  } catch (err) {
    console.error('Auto-save failed', err);
  }
};


  // Load version history
  const loadVersions = async () => {
    try {
      const res = await api.get(`/documents/${id}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVersions(res.data);
    } catch (err) {
      console.error('Failed to load versions', err);
    }
  };

  // Revert to a selected version
  const revertVersion = async (versionId) => {
    try {
      const res = await api.post(`/documents/${id}/revert/${versionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(res.data.content);
    } catch (err) {
      console.error('Revert failed', err);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>{title}</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => {
          if (!showVersions) loadVersions();
          setShowVersions(!showVersions);
        }}>
          {showVersions ? 'Hide Versions' : 'Show Versions'}
        </button>
      </div>

      {showVersions && (
        <div style={{
          border: '1px solid #ccc',
          padding: 10,
          marginBottom: 20,
          maxHeight: 200,
          overflowY: 'auto'
        }}>
          <h4>Version History</h4>
          {versions.length === 0 ? (
            <p>No versions found</p>
          ) : (
            versions.map(v => (
              <div key={v._id} style={{ marginBottom: 8 }}>
                <span>{new Date(v.timestamp).toLocaleString()}</span>
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => revertVersion(v._id)}
                >
                  Revert
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <textarea
        style={{ width: '100%', height: '70vh', fontSize: '16px' }}
        value={content}
        onChange={handleChange}
      />
    </div>
  );
};

export default EditorPage;
