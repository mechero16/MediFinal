const express = require('express');
const router = express.Router();

const {
  saveReport,
  deleteReport,
  getReportsByUser
} = require('../controllers/reportController');



// Save report
router.post('/save', saveReport);

// Get all reports by user
router.get('/:userId', getReportsByUser);

// Delete report
router.delete('/:reportId', deleteReport);


// Update report status (share/unshare)
/* router.patch('/report/:reportId/status', updateReportStatus); */

module.exports = router;
