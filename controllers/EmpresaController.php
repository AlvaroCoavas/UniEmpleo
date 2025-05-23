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


    public function register($data) {
        
        if (empty($data['correo']) || empty($data['contrasena']) || empty($data['nombre_empresa'])) {
            throw new Exception("Faltan datos obligatorios para registrar la empresa.");
        }

        $empresa = new Empresa(
            
            $data['id_usuario'],
            $data['correo'],
            $data['contrasena'], 
            $data['nombre_empresa'],
            $data['lugar_operacion'] ?? null,
            $data['ruc'] ?? null,
            $data['sector'] ?? null,
            $data['descripcion'] ?? null
        );

        if ($this->empresaDAO->guardarEmpresa($empresa)) {
            return true; 
        } else {
            throw new Exception("Error al guardar los datos de la empresa.");
        }
    }

    public function getEmpresa($id_usuario) {
        $empresa = $this->empresaDAO->obtenerEmpresaPorId($id_usuario);

        if ($empresa) {
            return $empresa; 
        } else {
            throw new Exception("Empresa no encontrada.");
        }
    }

    public function update($data) {
      
        if (empty($data['id_usuario']) || empty($data['correo']) || empty($data['nombre_empresa'])) {
            throw new Exception("Faltan datos obligatorios para actualizar la empresa.");
        }

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

        $this->usuarioDAO->actualizarUsuario($empresa);

  
        if ($this->empresaDAO->actualizarEmpresa($empresa)) {
            return true; 
        } else {
            throw new Exception("Error al actualizar los datos de la empresa.");
        }
    }

    public function delete($id_usuario) {
        if ($this->empresaDAO->eliminarEmpresa($id_usuario)) {
          
            if ($this->usuarioDAO->eliminarUsuario($id_usuario)) {
                return true; 
            } else {
                throw new Exception("Error al eliminar los datos del usuario.");
            }
        } else {
            throw new Exception("Error al eliminar los datos de la empresa.");
        }
    }
}
?>