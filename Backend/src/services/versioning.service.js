const Version = require('../models/version.model');
const Document = require('../models/document.model');

// Create a new version (snapshot)
const saveVersion = async (docId, content) => {
  await Version.create({ document: docId, content });
};

// Get all versions for a document
const getVersions = async (docId) => {
  return await Version.find({ document: docId }).sort({ timestamp: -1 });
};

// Revert to a previous version
const revertToVersion = async (docId, versionId) => {
  const version = await Version.findOne({ _id: versionId, document: docId });
  if (!version) throw new Error('Version not found');

  const doc = await Document.findByIdAndUpdate(
    docId,
    { content: version.content },
    { new: true }
  );

  await saveVersion(docId, version.content); // Save new snapshot of reverted state
  return doc;
};

module.exports = {
  saveVersion,
  getVersions,
  revertToVersion
};
