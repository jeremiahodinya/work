const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const User = require("../models/User");
const Land = require("../models/Land");

const bcrypt = require("bcryptjs");



const multer = require("multer");

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: "public/uploads", // Ensure this folder exists
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage }); // ✅ Define `upload`


dotenv.config(); // Load environment variables

const app = express();





// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));
app.use(express.static("src"));
// MongoDB Connection
mongoose
  .connect('mongodb+srv://jeremiahodinniya502:FDdI8bJXc6vnANXD@cluster0.95wdh.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route for rendering pages
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/Farmer", (req, res) => res.render("Farmer"));

// app.get("/Available", (req, res) => res.render("Available"));
app.get("/dashboard", (req, res) => res.render("dashboard"));
app.get("/Available", async (req, res) => {
  try {
    const lands = await Land.find(); // Fetch lands from DB
    res.render("Available", { lands }); // Pass lands data to the EJS template
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).send("Error loading lands");
  }
});

app.get("/index", (req, res) => res.render("index"));

app.get("/", (req, res) => {
  res.render("home", { user: req.session.user || null });
});




app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body; // Removed role

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Save user with plain text password (NOT SECURE)
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});




// GET: Show land posting form
app.get("/lands", async (req, res) => {
  const lands = await Land.find();
  res.render("lands", { lands });
});



app.post("/add", upload.single("landImage"), async (req, res) => {
  try {
    const { ownerName, landSize, location, price, contact, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newLand = new Land({ ownerName, landSize, location, price, contact, description, imagePath });
    await newLand.save();

    res.redirect("/lands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});


// **Login Route**
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", { email, password }); // Debugging line

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    console.log("User found in DB:", user); // Debugging line

    if (!user || password !== user.password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    res.redirect("/home");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// **Home Route (After Login)**
app.get("/home", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("home", { user: req.session.user });
});

// **Logout Route**
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.redirect("/dashboard");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
