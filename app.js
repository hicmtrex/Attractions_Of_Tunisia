if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsEngine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require('./utils/expressError');
const methodOverRide = require('method-override')
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
//const MapboxLanguage = require('@mapbox/mapbox-gl-language');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/progress-yelpCamp';




// Routes
const userRoutes = require('./routes/users');
const reviews = require('./routes/reviews');
const campgrounds = require('./routes/campgrounds');

// Mongoose 

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsEngine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(express.urlencoded({ extends: true }))
app.use(methodOverRide('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
    "https://use.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
     "https://i.pinimg.com",
    "https://cdnjs.cloudflare.com/",
    "https://pro.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://fonts.google.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://pro.fontawesome.com/",
    "https://fontawesome.com/",
    "https://fonts.google.com/",
    "https://fonts.gstatic.com"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/hicm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// Routes use
app.use('/', userRoutes)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/',(req, res) => {
    res.render('campgrounds/home')
});

app.get('/home',(req, res) => {
    res.render('campgrounds/home')
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'hicm@gmail.com', username: 'hicmtrex' });
    const newUser = await User.register(user, 'chichen');
    res.send(newUser);
});

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No! Something went wrong!!'
    res.status(statusCode).render('error', { err })
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})


