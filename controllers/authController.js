const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: '¡Ambos Campos Son Obligatorios!'
});

//funcion para revisar si el usuario esta logeado o no
exports.usuarioAutenticado = (req, res, next) => {
    //si el usuario esta autenticado puede continuar
    if(req.isAuthenticated()){
        return next();
    }
    //si no esta autenticado se va al form
    return res.redirect('/iniciar-sesion');
}

//cerrar Sesion
exports.cerrarSesion = (req, res) =>{
    req.session.destroy(() => {
        //cerrar sesion nos lleve al login
        res.redirect('/iniciar-sesion');
    })
}

//genera un token si el us es valido
exports.enviarToken = async (req, res) =>{
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({ where: { email }});

    //si no existe el usuario
    if(!usuario){
        req.flash('error', 'No existe este usuario');
        res.redirect('/reestablecer');
    }

    //si el usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;

    //guardarlos en la base de datos
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //envia el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    });
    //terminar la accion
    req.flash('correcto', 'Se envio un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

//se valida el token que se le dio al usuario
exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //si no hay usuario
    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    //formulario para generar el password
    res.render('resetPassword',{
        nombrePagina: 'Reestablecer Contraseña'
    })
}

//cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
    //verifica token y fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

    //verificamos si el usuario existe
    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    //hashear el nuevo password y actualizar token y expiracion
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password
    await usuario.save();
    
    //redireccionar
    req.flash('correcto', '¡Tu password se ha modificado correctamente!');
    res.redirect('/iniciar-sesion');
    
}