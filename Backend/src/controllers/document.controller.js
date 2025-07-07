const Document = require('../models/document.model');
const { saveVersion, getVersions, revertToVersion } = require('../services/versioning.service');
// Create new document
const createDocument = async (req, res) => {
  try {
    const doc = await Document.create({
      title: req.body.title || 'Untitled Document',
      owner: req.user._id
    });
    console.log(`Document created: ${doc._id}`);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error creating document', error: err.message });
  }
};

// Get all documents for user
const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
};

// Get one document by ID
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);  // ✅ Don't restrict to owner only
  } catch (err) {
    res.status(500).json({ message: 'Error fetching document', error: err.message });
  }
};


// Update document
const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    
    // Save version
    await saveVersion(doc._id, doc.content);

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error updating document', error: err.message });
  }
};


// Delete document
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
};




// New: get document versions
const getDocumentVersions = async (req, res) => {
  try {
    const versions = await getVersions(req.params.id);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching versions', error: err.message });
  }
};

// New: revert to version
const revertDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const reverted = await revertToVersion(doc._id, req.params.versionId);
    res.json(reverted);
  } catch (err) {
    res.status(500).json({ message: 'Error reverting document', error: err.message });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  revertDocument
};