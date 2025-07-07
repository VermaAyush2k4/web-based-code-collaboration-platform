import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchDocuments();
    }
  }, [token]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDocument = async (docId) => {
  if (!window.confirm('Delete this document?')) return;
  try {
    await api.delete(`/documents/${docId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDocuments(); // Refresh list
  } catch (err) {
    console.error('Delete failed', err);
  }
};


  const createDocument = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post('/documents', { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTitle('');
      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome, {user?.username}</h2>
      <button onClick={logout}>Logout</button>

      <h3 style={{ marginTop: 30 }}>Create New Document</h3>
      <form onSubmit={createDocument}>
        <input
          type="text"
          placeholder="Document title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      <h3 style={{ marginTop: 40 }}>Your Documents</h3>
      <ul>
        {documents.map((doc) => (
          <li key={doc._id} style={{ margin: '10px 0' }}>
            <span>{doc.title}</span>
            <button style={{ marginLeft: 10 }} onClick={() => navigate(`/editor/${doc._id}`)}>

              Open
            </button>
              <button style={{ marginLeft: 10, background: 'red' }} onClick={() => deleteDocument(doc._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
