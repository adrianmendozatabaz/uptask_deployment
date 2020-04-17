//importar express
const express = require('express');
//importar el routing 
const routes = require('./routes');
//importar el path
const path = require('path');
//importar body parser
const bosyParser = require('body-parser');
//importar helpers funciones propias
const helpers = require('./helpers');
//importar flash para alertas rapidas
const flash = require('connect-flash');
//importar sessiones
const session = require('express-session');
//cookie parser
const cookieParser = require('cookie-parser');
//importar los passport
const passport = require('./config/passport');
//importar las variables
require('dotenv').config({path: 'variables.env'});

//crear la conexion a la bd
const db = require('./config/db');
//importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');
//crear la tabla con sync
db.sync()
    .then(() => console.log('conectado a la db'))
    .catch(error => console.log(error));

//crear una aplicacion de express
const app = express();

//donde cargar los archivos staticos
app.use(express.static('public'));

//habilitar pug
app.set('view engine', 'pug');

//agregra flash messages
app.use(flash());

//cookie parser
app.use(cookieParser());

//sesiones
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}))

//importar el passport
app.use(passport.initialize());
app.use(passport.session());

//pasar vardum a la app
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});

//añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

//habilitar body parser para leer datos de formulario
app.use(bosyParser.urlencoded({extended: true}));

//ruta para el home
app.use('/', routes());

//Servidor y Puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando');
})