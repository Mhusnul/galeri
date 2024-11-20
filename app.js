const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/imageGallery', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define schema and model for images
const imageSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imagePath: String,
  metadata: {
    uploadedAt: { type: Date, default: Date.now },
    size: Number
  }
});

const Image = mongoose.model('Image', imageSchema);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Save with unique filename
  }
});

const upload = multer({ storage: storage });

// Routes

// Home page: Display all images with search and filter
app.get('/', async (req, res) => {
  const search = req.query.search || '';
  const category = req.query.category || '';
  
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (category) filter.category = category;

  const images = await Image.find(filter);
  
  res.render('index', { images, search, category });
});

// Add new image (upload form)
app.get('/add', (req, res) => {
  res.render('addImage');
});

// Handle image upload
app.post('/add', upload.single('image'), async (req, res) => {
  const { title, description, category } = req.body;
  const newImage = new Image({
    title,
    description,
    category,
    imagePath: `/images/${req.file.filename}`,
    metadata: { size: req.file.size }
  });

  await newImage.save();
  res.redirect('/');
});

// View image detail
app.get('/image/:id', async (req, res) => {
  const image = await Image.findById(req.params.id);
  res.render('imageDetail', { image });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
