const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//referencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//LocalStrategy - Login con credenciales propias us y pass
passport.use(
    new LocalStrategy(
        //Por default passport espera usuario y password
        {
            usernameField: 'email',
            passwordField : 'password'
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: {
                        email,
                        activo: 1
                    }
                })
                //el usuario existe, password incorrecto
                if(!usuario.verificarPassword(password)){
                    return done(null, false, {
                        message: 'Password Incorrecto'
                    })    
                }
                //el email correcto y us correcto
                return done(null, usuario);
            } catch (error) {
                //Ese usuario no existe
                return done(null, false, {
                    message: 'La cuenta no existe'
                })
            }
        }
    )
);

//serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
})

//deserealizar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
})

//Exportar
module.exports = passport;