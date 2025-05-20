<?php
require_once '../models/Empresa.php';
require_once '../dao/EmpresaDAO.php';
require_once '../dao/UsuarioDAO.php';

class EmpresaController {
    private $empresaDAO;
    private $usuarioDAO;

    public function __construct() {
        $this->empresaDAO = new EmpresaDAO();
        $this->usuarioDAO = new UsuarioDAO();
    }

    // Registrar una nueva empresa
    public function register($data) {
        // Validar los datos requeridos
        if (empty($data['correo']) || empty($data['contrasena']) || empty($data['nombre_empresa'])) {
            throw new Exception("Faltan datos obligatorios para registrar la empresa.");
        }

        // Crear una instancia del modelo Empresa
        $empresa = new Empresa(
            
            $data['id_usuario'],
            $data['correo'],
            $data['contrasena'], // Hashear la contraseña
            $data['nombre_empresa'],
            $data['lugar_operacion'] ?? null,
            $data['ruc'] ?? null,
            $data['sector'] ?? null,
            $data['descripcion'] ?? null
        );


        // Guardar los datos específicos de la empresa
        if ($this->empresaDAO->guardarEmpresa($empresa)) {
            return true; // Registro exitoso
        } else {
            throw new Exception("Error al guardar los datos de la empresa.");
        }
    }

    // Obtener datos de una empresa por ID de usuario
    public function getEmpresa($id_usuario) {
        $empresa = $this->empresaDAO->obtenerEmpresaPorId($id_usuario);

        if ($empresa) {
            return $empresa; // Devuelve la instancia del modelo Empresa
        } else {
            throw new Exception("Empresa no encontrada.");
        }
    }

    // Actualizar datos de una empresa
    public function update($data) {
        // Validar los datos requeridos
        if (empty($data['id_usuario']) || empty($data['correo']) || empty($data['nombre_empresa'])) {
            throw new Exception("Faltan datos obligatorios para actualizar la empresa.");
        }

        // Crear una instancia del modelo Empresa
        $empresa = new Empresa(
            $data['id_usuario'],
            $data['correo'],
            !empty($data['contrasena']) ? password_hash($data['contrasena'], PASSWORD_DEFAULT) : null, // Hashear si hay nueva contraseña
            $data['nombre_empresa'],
            $data['lugar_operacion'] ?? null,
            $data['ruc'] ?? null,
            $data['sector'] ?? null,
            $data['descripcion'] ?? null
        );

        // Actualizar los datos del usuario en la tabla usuarios
        $this->usuarioDAO->actualizarUsuario($empresa);

        // Actualizar los datos específicos de la empresa
        if ($this->empresaDAO->actualizarEmpresa($empresa)) {
            return true; // Actualización exitosa
        } else {
            throw new Exception("Error al actualizar los datos de la empresa.");
        }
    }

    // Eliminar una empresa por ID de usuario
    public function delete($id_usuario) {
        // Eliminar los datos específicos de la empresa
        if ($this->empresaDAO->eliminarEmpresa($id_usuario)) {
            // Eliminar los datos del usuario en la tabla usuarios
            if ($this->usuarioDAO->eliminarUsuario($id_usuario)) {
                return true; // Eliminación exitosa
            } else {
                throw new Exception("Error al eliminar los datos del usuario.");
            }
        } else {
            throw new Exception("Error al eliminar los datos de la empresa.");
        }
    }
}
?>