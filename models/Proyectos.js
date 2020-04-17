//IMPORTAR LOS ARCHIVOS A UTILIZAR
//importar sequelize
const Sequelize = require('sequelize');
//importar la base de datos
const db = require('../config/db');
//importar slug
const slug = require('slug');
//importar shortid
const shortid = require('shortid');

//definir el modelo
const Proyectos = db.define('proyectos',{
    id : {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre : {
        type: Sequelize.STRING(100)
    },
    url : {
        type: Sequelize.STRING(100)
    }
}, {
    hooks: {
        beforeCreate(proyecto){
            const url = slug(proyecto.nombre).toLowerCase();
            proyecto.url = `${url}-${shortid.generate()}`;
        }
    }
});

module.exports = Proyectos;
