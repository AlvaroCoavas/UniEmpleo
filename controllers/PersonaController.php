<?php
require_once '../models/Persona.php';
require_once '../dao/PersonaDAO.php';
require_once '../dao/UsuarioDAO.php';

class PersonaController {
    private $personaDAO;
    private $usuarioDAO;

    public function __construct() {
        $this->personaDAO = new PersonaDAO();
        $this->usuarioDAO = new UsuarioDAO();
    }

    public function register($data) {
        if (empty($data['id_usuario']) || empty($data['nombre']) || empty($data['apellido'])) {
            throw new Exception("Faltan datos obligatorios para registrar la persona.");
        }
    
        $persona = new Persona(
            $data['id_usuario'],
            $data['correo'],
            $data['contrasena'],                
            $data['nombre'],
            $data['apellido'],
            $data['cedula'] ?? null,
            $data['telefono'] ?? null,
            $data['fecha_nacimiento'] ?? null,
            $data['lugar_residencia'] ?? null,
            $data['profesion_u_oficio'] ?? null,
            $data['resumen_profesional'] ?? null,
            $data['servicios_completados'] ?? 0
        );
    
        if ($this->personaDAO->guardarPersona($persona)) {
            return true; 
        } else {
            throw new Exception("Error al guardar los datos de la persona.");
        }
    }

    // Obtener datos de una persona por ID de usuario
    public function getPersona($id_usuario) {
        $persona = $this->personaDAO->obtenerPersonaPorId($id_usuario);

        if ($persona) {
            return $persona; 
        } else {
            throw new Exception("Persona no encontrada.");
        }
    }

    // Actualizar datos de una persona
    public function update($data) {
        
        if (empty($data['id_usuario']) || empty($data['correo']) || empty($data['nombre']) || empty($data['apellido'])) {
            throw new Exception("Faltan datos obligatorios para actualizar la persona.");
        }

        $persona = new Persona(
            $data['id_usuario'],
            $data['correo'],
            !empty($data['contrasena']) ? password_hash($data['contrasena'], PASSWORD_DEFAULT) : null, // Hashear si hay nueva contraseña
            $data['nombre'],
            $data['apellido'],
            $data['cedula'] ?? null,
            $data['telefono'] ?? null,
            $data['fecha_nacimiento'] ?? null,
            $data['lugar_residencia'] ?? null,
            $data['profesion_u_oficio'] ?? null,
            $data['resumen_profesional'] ?? null,
            $data['servicios_completados'] ?? 0
        );

        $this->usuarioDAO->actualizarUsuario($persona);

        if ($this->personaDAO->actualizarPersona($persona)) {
            return true; 
        } else {
            throw new Exception("Error al actualizar los datos de la persona.");
        }
    }

    public function delete($id_usuario) {
       
        if ($this->personaDAO->eliminarPersona($id_usuario)) {
            if ($this->usuarioDAO->eliminarUsuario($id_usuario)) {
                return true; 
            } else {
                throw new Exception("Error al eliminar los datos del usuario.");
            }
        } else {
            throw new Exception("Error al eliminar los datos de la persona.");
        }
    }
}
?>