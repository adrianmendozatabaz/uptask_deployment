import axios from "axios";
import Swal from "sweetalert2";
import {actualizarAvance} from '../funciones/avance';

const tareas = document.querySelector('.listado-pendientes');

if (tareas) {
    tareas.addEventListener('click', e => {
        if (e.target.classList.contains('fa-check-circle')) {
            const icono = e.target;
            const idTarea = icono.parentElement.parentElement.dataset.tarea;

            //console.log(idTarea);
            //request a tareas id
            const url = `${location.origin}/tareas/${idTarea}`;

            axios.patch(url, {
                    idTarea
                })
                .then(function (respuesta) {

                    if (respuesta.status === 200) {
                        icono.classList.toggle('completo');
                        //actualizar la barra de progreso
                        actualizarAvance();
                    }
                })
        }
        if (e.target.classList.contains('fa-trash')) {
            const tareaHTML = e.target.parentElement.parentElement,
                idTarea = tareaHTML.dataset.tarea;
            console.log(tareaHTML);
            console.log(idTarea);
            Swal.fire({
                title: '¿Deseas borrar esta tarea?',
                text: "Una tarea eliminada no se puede recuperar!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, Borrar!',
                cancelButtonText: 'No, Cancelar'
            }).then((result) => {
                if (result.value) {
                    const url = `${location.origin}/tareas/${idTarea}`;

                    //enviar el delete por medio de axios
                    axios.delete(url, {params: {idTarea}})
                        .then(function(respuesta){
                            if(respuesta.status === 200){
                                tareaHTML.parentElement.removeChild(tareaHTML);

                                //alerta
                                Swal.fire(
                                    '¡Tarea Eliminada!',
                                    respuesta.data,
                                    'success'
                                )

                                //actualizar la progress bar
                                actualizarAvance();
                            }                            
                        })
                }
            })
        }

    })
}

export default tareas;