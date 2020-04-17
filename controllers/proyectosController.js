//importar el modelo
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');
//importar slug
const slug = require('slug');

exports.proyectosHome = async (req, res) => {
    //traer todos los registros de la bd y enviarlos
    
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto = async (req, res) => {
    //enviar la consulta de proyecrtos a todas las ventanas
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {usuarioId}});

    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    })
}

exports.nuevoProyecto = async (req, res) => {
    //enviar la consulta de proyecrtos a todas las ventanas
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    // Enviar a la consola lo que el usuario escribe
    //console.log(req.body);

    //validar que se tengan datos
    const {
        nombre
    } = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({
            'texto': 'Agrega un nombre al proyecto'
        })
    }

    //si hay errores 
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //No hay errorres 
        //insertar en la bd
        const usuarioId = res.locals.usuario.id;
        const url = slug(nombre).toLowerCase();
        await Proyectos.create({ nombre, usuarioId });
        //despues de insertar aque pagina se redirecciona
        res.redirect('/');
    }

}

exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});

    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }
    })
    
    //verificar si el proyecto esta vacio
    if(!proyecto) return next();
    //render a la vista
    res.render('tareas', {
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.formularioEditar = async (req, res) => {
    const usuarioId = res.locals.usuario.id;
    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});
    
    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //render a la vista
    res.render('nuevoProyecto',{
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    })
}

exports.actualizarProyecto = async (req, res) => {
    //enviar la consulta de proyecrtos a todas las ventanas
    const usuarioId = res.locals.usuario.id;
    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    // Enviar a la consola lo que el usuario escribe
    //console.log(req.body);

    //validar que se tengan datos
    const {
        nombre
    } = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({
            'texto': 'Agrega un nombre al proyecto'
        })
    }

    //si hay errores 
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //No hay errorres 
        //insertar en la bd
        const url = slug(nombre).toLowerCase();
        await Proyectos.update(
            { nombre: nombre },
            { where: {id: req.params.id}}
        );
        //despues de insertar aque pagina se redirecciona
        res.redirect('/');
    }
}

exports.eliminarProyecto = async (req, res, next) =>{
    const {urlProyecto} = req.query;
    const resultado = await Proyectos.destroy({where: {url: urlProyecto}}); 
    //respuesta en caso de no poder eliminar
    if(!resultado){
        return next();
    }  
    res.status(200).send('Proyecto Eliminado Correctamente'); 
}