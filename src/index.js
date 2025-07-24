// src/index.js

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Land = require("../models/Land");

// Load env variables
dotenv.config();
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://jeremiahodinniya502:YHH0HLnn2cnULCsp@cluster0.95wdh.mongodb.net/',", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(express.static("public"));
app.use(express.static("src"));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true,
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });

// Farmer Schema & Model
const farmerSchema = new mongoose.Schema({
  name: String,
  type: String,
  email: String,
  phone: String,
  location: String,
  experience: Number,
  bio: String,
  imageUrl: String,
});
const Farmer = mongoose.model("Farmer", farmerSchema);


app.get("/Farmer", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.render("Farmer", { farmers });
  } catch (error) {
    console.error("Error loading farmers:", error.message);
    res.status(500).send("Failed to load farmers");
  }
});



app.get('/farmer-profile', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.render('Farmer', { farmers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profiles');
  }
});


app.get('/farmer-profile', async (req, res) => {
  const farmers = await Farmer.find();
  res.render('Farmer', { farmers });
});




app.post('/submit-farmer-profile', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file?.path;

    const farmer = new Farmer({
      name: req.body.name,
      type: req.body.type,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      experience: req.body.experience,
      bio: req.body.bio,
      imageUrl: imageUrl
    });

    await farmer.save();
    res.redirect('/farmer-profile'); // must redirect
  } catch (err) {
    console.error('Error saving farmer profile:', err);
    res.status(500).send('Error saving profile');
  }
});




// ROUTES

app.get("/", (req, res) =>
  res.render("home", { user: req.session.user || null })
);

app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/dashboard", (req, res) => res.render("dashboard"));
app.get("/Farmer", (req, res) => res.render("Farmer"));

app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("home", { user: req.session.user });
});

// Show all lands
app.get("/lands", async (req, res) => {
  const lands = await Land.find();
  res.render("lands", { lands });
});

app.get("/Available", async (req, res) => {
  try {
    const lands = await Land.find();
    res.render("Available", { lands });
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).send("Error loading lands");
  }
});

// API to get all farmers
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Submit new farmer
app.post("/api/farmers", upload.single("image"), async (req, res) => {
  try {
    
    console.log("📝 Request Body:", req.body);
    console.log("📷 Uploaded File:", req.file);


    const { name, type, email, phone, location, experience, bio } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const farmerSchema = new mongoose.Schema({
  name: String,
  type: String, 
  email: String,
  phone: String,
  location: String,
  experience: String,
  bio: String,
  imageUrl: String
});

    await newFarmer.save();
    res.redirect("/Farmer");
  } catch (error) {
    console.error("Error saving farmer:", error.message);
    res.status(500).json({ error: "Failed to save farmer" });
  }
});

// Submit new land
app.post("/add", upload.single("landImage"), async (req, res) => {
  try {
    const { ownerName, landSize, location, price, contact, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newLand = new Land({
      ownerName,
      landSize,
      location,
      price,
      contact,
      description,
      imagePath,
    });

    await newLand.save();
    res.redirect("/lands");
  } catch (err) {
    console.error(" Error saving land:", err.message);
    res.status(500).send("Error saving land");
  }
});

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error(" Signup error:", error.message);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    res.redirect("/home");
  } catch (err) {
    console.error(" Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Error logging out" });
    res.redirect("/dashboard");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
