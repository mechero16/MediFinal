// controllers/reportController.js
const Report = require('../models/Report');

const saveReport = async (req, res) => {
  try {
    const { userId, symptoms, modelOutput, objectName } = req.body;

    if (!userId || !symptoms || !modelOutput) {
      return res.status(400).json({ message: 'userId, symptoms, and modelOutput are required' });
    }

    // Extract fields from model output
    const { predicted, prediction } = modelOutput;

       // Create diagnosis array from prediction object
    const diagnosis = Object.entries(prediction).map(([disease, probability]) => ({
      disease,
      percentage: probability // convert to percentage
    }));

    // Current date & time
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const newReport = new Report({
      userId,
      symptoms,
      diagnosis,
      status: false,
      predicted,
      date,
      time
    });

    const savedReport = await newReport.save();
    res.status(201).json({ message: 'Report saved successfully', report: savedReport });

  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get all reports by userId
const getReportsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ userId });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this user' });
    }

    res.status(200).json({ message: 'Reports fetched successfully', reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Delete report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const deletedReport = await Report.findByIdAndDelete(reportId);

    if (!deletedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: 'Report deleted successfully', report: deletedReport });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete USER report


module.exports = {
  saveReport,
  deleteReport,
  getReportsByUser

};
