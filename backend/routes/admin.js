const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const Rating = require('../models/Rating');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'utshogoateddev1';
const ADMIN_TOKEN = Buffer.from(ADMIN_PASSWORD).toString('base64');

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Wrong password' });
  }
  res.json({ token: ADMIN_TOKEN });
});

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  const [totalUsers, totalListings, pendingVerifications, pendingReports] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ isActive: true }),
    User.countDocuments({ studentIdUrl: { $ne: '' }, isStudentVerified: false }),
    Report.countDocuments({ status: 'pending' }),
  ]);
  res.json({ totalUsers, totalListings, pendingVerifications, pendingReports });
});

// GET /api/admin/verifications
router.get('/verifications', adminAuth, async (req, res) => {
  const users = await User.find({
    studentIdUrl: { $ne: '' },
    isStudentVerified: false
  }).select('name email college location studentIdUrl createdAt').sort({ createdAt: -1 });
  res.json(users);
});

// PATCH /api/admin/verify/:userId
router.patch('/verify/:userId', adminAuth, async (req, res) => {
  const { approved } = req.body;
  if (approved) {
    await User.findByIdAndUpdate(req.params.userId, { isStudentVerified: true });
    res.json({ message: 'User verified successfully' });
  } else {
    await User.findByIdAndUpdate(req.params.userId, { studentIdUrl: '' });
    res.json({ message: 'Verification rejected' });
  }
});

// GET /api/admin/reports
router.get('/reports', adminAuth, async (req, res) => {
  const reports = await Report.find({ status: 'pending' })
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email college')
    .populate('reportedListing', 'title price')
    .sort({ createdAt: -1 });
  res.json(reports);
});

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', adminAuth, async (req, res) => {
  const { action } = req.body;
  const report = await Report.findById(req.params.id).populate('reportedUser').populate('reportedListing');
  if (!report) return res.status(404).json({ message: 'Report not found' });

  if (action === 'ban_user' && report.reportedUser) {
    await User.findByIdAndUpdate(report.reportedUser._id, { isBanned: true });
  }
  if (action === 'remove_listing' && report.reportedListing) {
    await Listing.findByIdAndUpdate(report.reportedListing._id, { isActive: false });
  }

  await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
  res.json({ message: 'Report resolved' });
});

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  const { page = 1, search } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const users = await User.find(query)
    .select('name email college location isStudentVerified isVerifiedSeller isBanned createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * 20)
    .limit(20);
  const total = await User.countDocuments(query);
  res.json({ users, total });
});

// PATCH /api/admin/users/:id/toggle-ban
router.patch('/users/:id/toggle-ban', adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isBanned = !user.isBanned;
  await user.save();
  res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
});

// PATCH /api/admin/users/:id/toggle-verified-seller
router.patch('/users/:id/toggle-verified-seller', adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isVerifiedSeller = !user.isVerifiedSeller;
  await user.save();
  res.json({ message: user.isVerifiedSeller ? 'Seller verified' : 'Seller unverified' });
});

// GET /api/admin/listings
router.get('/listings', adminAuth, async (req, res) => {
  const { page = 1, search } = req.query;
  const query = {};
  if (search) query.title = new RegExp(search, 'i');
  const listings = await Listing.find(query)
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * 20)
    .limit(20);
  const total = await Listing.countDocuments(query);
  res.json({ listings, total });
});

// DELETE /api/admin/listings/:id
router.delete('/listings/:id', adminAuth, async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, { isActive: false, isSold: true });
  res.json({ message: 'Listing removed' });
});

module.exports = router;
