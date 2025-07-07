const express = require('express');
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
getDocumentVersions,
  revertDocument
} = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);


router.get('/:id/versions', getDocumentVersions);
router.post('/:id/revert/:versionId', revertDocument);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
