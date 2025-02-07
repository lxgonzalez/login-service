const express = require('express');
const passport = require('passport');
const cors = require('cors');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('redis').createClient();

require('dotenv').config();

const app = express();
const API_GATEWAY = process.env.API_GATEWAY;
const allowedOrigins = ['http://localhost:5173', 'http://eternalgraphicsgroup25.s3-website-us-east-1.amazonaws.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true,
}));
// Configuración de sesión

app.use(session({
  store: new RedisStore({ client: redisClient }), // Almacena las sesiones en Redis
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    domain: 'load-balancer-login-1066750330.us-east-1.elb.amazonaws.com',
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// Configura la estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_GATEWAY}/auth/google/callback`
    //   "http://localhost:1028/auth/google/callback"
},
    (accessToken, refreshToken, profile, done) => {
        // Aquí puedes guardar el perfil del usuario en tu base de datos
        return done(null, profile);
    }));

// Serializa y deserializa el usuario
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Ruta para iniciar la autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback después de la autenticación
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log('Usuario autenticado:', req.user); // Verifica el usuario autenticado
      req.session.user = req.user;
      res.redirect('http://eternalgraphicsgroup25.s3-website-us-east-1.amazonaws.com');
    });
  
  app.get('/', (req, res) => {
    console.log('Sesión:', req.session); // Verifica la sesión
    if (req.session.user) {
      res.send(`Bienvenido, ${req.session.user.displayName}!`);
    } else {
      res.send('No estás autenticado.');
    }
  });

// Inicia el servidor
const PORT = process.env.PORT || 1028;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});