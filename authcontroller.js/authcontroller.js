const User = require('../models/User');
const Provider = require('../models/Provider');
const bcrypt = require('bcrypt');

// Render signup page
exports.getSignup = (req, res) => {
    res.render('signup');
};

// Handle signup logic
exports.postSignup = async (req, res) => {
    const { username, password,fullName, email,phone } = req.body;

    try {
        const user = new User({ username, password,phone,email,fullName});
        await user.save();
        req.session.userId = user._id; // Save user ID in session
        res.redirect('/home');
    } catch (error) {
        res.status(400).send('Error creating user');
    }
};

// Handle Service Provider signup logic
exports.ProviderSignup = async (req, res) => {
    const { username, password,phone,email,fullName, nin, skills, experience} = req.body;

    try {
        const Providers = new Provider({ username, password,phone,email,fullName, nin, skills, experience});
        await Providers.save();
        req.session.userId = Providers._id; // Save user ID in session
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        
        res.status(400).send('Error creating user');
    }
};

// Render login page
exports.getLogin = (req, res) => {
    res.render('login');
};

exports.getdashboard = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const Providers = await Provider.findById(req.session.userId);
    res.render('dashboard', { pro: Providers});
};



// Render Provider login page
exports.getProviderLogin = (req, res) => {
    res.render('providerLogin');
};
// Handle login logic
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).render('login', { errorMessage: 'Invalid username or password' });
        }

        // Assuming you have a function for password comparison (e.g., bcrypt.compare)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).render('login', { errorMessage: 'Invalid username or password' });
        }

        req.session.userId = user._id; // Save user ID in session
        res.redirect('/home');
    } catch (error) {
        res.status(500).render('login', { errorMessage: 'An error occurred, please try again later.' });
    }
};

// Handle Provider login logic
exports.ProviderLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const provider = await Provider.findOne({ username });
        if(!provider){
            return res.status(400).render('providerLogin', { errorMessage: 'Invalid username ' });
        }
        const isPasswordValid = await bcrypt.compare(password, provider.password);
        if (!isPasswordValid) {
            return res.status(400).render('providerLogin', { errorMessage: 'Invalid  password' });
        }
      
            req.session.userId = provider.user._id; // Save user ID in session
            res.redirect('/dashboard');
            
       
    } catch (error) {
        res.status(500).render('providerLogin', { errorMessage: 'An error occurred, please try again later.' });
    }
};

// Handle home page logic
exports.getHome = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const service = await Provider.find().limit(6);
    const user = await User.findById(req.session.userId);

    res.render('home', { username: User.username , User:user, service:service});
};
// GET LANDING PAGE
exports.getLandingPage = async (req, res) => {



    res.render('index');
};
exports.getlearn = async (req, res) => {

    res.render('learn');
    };
exports.getProvider = async (req, res) => {

res.render('providers');
};

exports.getProfiles = async (req, res) => {
    const service = await Provider.find();
    res.render('Profiles', {service:service}
        
     );
};
// Handle logout logic
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

exports.providerlogout = (req, res) => {
    req.session.destroy();
    res.redirect('/Login');
};
// GET ALL SERVICE PROVIDER
// exports.getService = async (req, res) => {
//     try {
//         const service = await Provider.find(); // Fetch all data from MongoDB
//         res.render('h', { data }); // Pass data to the EJS view
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error fetching data');
//     }
// };