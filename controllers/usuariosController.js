const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta',{
        nombrePagina: 'Crear Cuenta en Uptask'
    });
}

exports.formIniciarSesion = (req, res) => {
    const {error} = res.locals.mensajes;
    res.render('iniciarSesion',{
        nombrePagina: 'Inicia Sesión en Uptask',
        error
    });
}

exports.crearCuenta = async (req, res) => {
    //leer los datos
    const {email, password } = req.body;
    
    try {
        //crear el usuario 
        await  Usuarios.create({
            email,
            password
        });
        
        //crear una url confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        //crear el objeto de usuario
        const usuario = {
            email
        }

        //enviar el email
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta Uptask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        });
        //redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, para que confirmes tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta',{
            mensajes: req.flash(),
            nombrePagina: 'Crear Cuenta en Uptask',
            email,
            password
        });
    }
}

exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer Contraseña'
    })
}

exports.confirmarCuenta = async (req, res, next) => {
    //comprobar si el usuario ya ha sido activado
    const usuarioConfirmado = await Usuarios.findOne({
        where: {
            email: req.params.correo,
            activo: 1
        }
    })

    if(usuarioConfirmado){
        req.flash('correcto', 'La cuenta ya ha sido activada');
        res.redirect('/iniciar-sesion');
        return next();
    }

    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    })
    //si no existe el usuario
    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/crear-cuenta');
    }else{
        //actualizar el registro
        usuario.activo = 1;
        await usuario.save();

        req.flash('correcto', 'Cuenta activada con exito');
        res.redirect('/iniciar-sesion');
    }
}