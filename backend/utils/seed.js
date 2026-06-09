require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studymart';

const seedData = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Listing.deleteMany({});

  const salt = await bcrypt.genSalt(12);
  const hashedPw = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    { name: 'Rafi Ahmed', email: 'rafi@test.com', password: hashedPw, phone: '01711000001', college: 'Notre Dame College', location: 'Dhaka', isVerifiedSeller: true },
    { name: 'Nadia Islam', email: 'nadia@test.com', password: hashedPw, phone: '01711000002', college: 'Viqarunnisa Noon School', location: 'Dhaka' },
    { name: 'Tanvir Hossain', email: 'tanvir@test.com', password: hashedPw, phone: '01711000003', college: 'Rajshahi College', location: 'Rajshahi' },
  ]);

  await Listing.insertMany([
    { title: 'HSC Physics 1st Paper - Azizul Hakim', description: 'Excellent condition, barely used. All pages intact. Very helpful for HSC preparation.', price: 180, category: 'Books', condition: 'Like New', location: 'Dhaka', seller: users[0]._id, images: [] },
    { title: 'Scientific Calculator FX-991EX', description: 'Casio FX-991EX scientific calculator. All functions working perfectly. Comes with original cover.', price: 950, category: 'Calculator', condition: 'Used', location: 'Dhaka', seller: users[0]._id, images: [] },
    { title: 'SSC Chemistry Notes (Full Year)', description: 'Handwritten notes covering complete SSC syllabus. Chapter summaries, equations, and practice problems included.', price: 120, category: 'Notes', condition: 'Used', location: 'Dhaka', seller: users[1]._id, images: [] },
    { title: 'HSC Math 2nd Paper Textbook', description: 'NCTB approved textbook for HSC 2nd year. Good condition, no marks or highlights.', price: 150, category: 'Books', condition: 'Used', location: 'Rajshahi', seller: users[2]._id, images: [] },
    { title: 'Ball Pen Set (10 pcs) - Reynolds', description: 'Brand new pack of 10 Reynolds ball pens. Blue and black colors. Selling because received duplicate gift.', price: 80, isFree: false, category: 'Stationery', condition: 'New', location: 'Dhaka', seller: users[1]._id, images: [] },
    { title: 'English Grammar & Composition - PC Das', description: 'Classic English grammar book. Very helpful for SSC and HSC students. Minor pencil marks on a few pages.', price: 200, isNegotiable: true, category: 'Books', condition: 'Used', location: 'Dhaka', seller: users[0]._id, images: [] },
  ]);

  console.log('✅ Seed data inserted successfully');
  console.log('Test users: rafi@test.com / nadia@test.com / tanvir@test.com | Password: password123');
  process.exit(0);
};

seedData().catch((e) => { console.error(e); process.exit(1); });