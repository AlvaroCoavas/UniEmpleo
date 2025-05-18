<?php
require_once '../models/Persona.php';
require_once '../dao/PersonaDAO.php';

class PersonaController {
    private $personaDAO;

    public function __construct() {
        $this->personaDAO = new PersonaDAO();
    }

    // Registrar una nueva persona
    public function register($data) {
        // Crear una instancia del modelo Persona
        $persona = new Persona(
            $data['id_usuario'],
            $data['nombre'],
            $data['apellido'],
            $data['fecha_nacimiento']
        );

        // Guardar la persona en la base de datos
        if ($this->personaDAO->guardarPersona(
            $persona->getIdUsuario(),
            $persona->getNombre(),
            $persona->getApellido(),
            $persona->getFechaNacimiento()
        )) {
            return true; // Registro exitoso
        } else {
            return "Error al guardar los datos de la persona.";
        }
    }

    // Obtener datos de una persona por ID de usuario
    public function getPersona($id_usuario) {
        $personaData = $this->personaDAO->obtenerPersonaPorUsuarioId($id_usuario);

        if ($personaData) {
            // Crear una instancia del modelo Persona con los datos obtenidos
            return new Persona(
                $personaData['id_usuario'],
                $personaData['nombre'],
                $personaData['apellido'],
                $personaData['fecha_nacimiento']
            );
        } else {
            return null; // Persona no encontrada
        }
    }

    // Actualizar datos de una persona
    public function update($data) {
        // Crear una instancia del modelo Persona
        $persona = new Persona(
            $data['id_usuario'],
            $data['nombre'],
            $data['apellido'],
            $data['fecha_nacimiento']
        );

        // Actualizar los datos de la persona en la base de datos
        if ($this->personaDAO->actualizarPersona(
            $persona->getIdUsuario(),
            $persona->getNombre(),
            $persona->getApellido(),
            $persona->getFechaNacimiento()
        )) {
            return true; // Actualización exitosa
        } else {
            return "Error al actualizar los datos de la persona.";
        }
    }

    // Eliminar una persona por ID de usuario
    public function delete($id_usuario) {
        if ($this->personaDAO->eliminarPersona($id_usuario)) {
            return true; // Eliminación exitosa
        } else {
            return "Error al eliminar los datos de la persona.";
        }
    }
}
?>