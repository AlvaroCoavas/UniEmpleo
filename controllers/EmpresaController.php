<?php
require_once '../models/Empresa.php';
require_once '../dao/EmpresaDAO.php';

class EmpresaController {
    private $empresaDAO;

    public function __construct() {
        $this->empresaDAO = new EmpresaDAO();
    }

    // Registrar una nueva empresa
    public function register($data) {
        // Crear una instancia del modelo Empresa
        $empresa = new Empresa(
            $data['id_usuario'],
            $data['nombre_empresa'],
            $data['lugar_operacion']
        );

        // Guardar la empresa en la base de datos
        if ($this->empresaDAO->guardarEmpresa(
            $empresa->getIdUsuario(),
            $empresa->getNombreEmpresa(),
            $empresa->getLugarOperacion()
        )) {
            return true; // Registro exitoso
        } else {
            return "Error al guardar los datos de la empresa.";
        }
    }

    // Obtener datos de una empresa por ID de usuario
    public function getEmpresa($id_usuario) {
        $empresaData = $this->empresaDAO->obtenerEmpresaPorUsuarioId($id_usuario);

        if ($empresaData) {
            // Crear una instancia del modelo Empresa con los datos obtenidos
            return new Empresa(
                $empresaData['id_usuario'],
                $empresaData['nombre_empresa'],
                $empresaData['lugar_operacion']
            );
        } else {
            return null; // Empresa no encontrada
        }
    }

    // Actualizar datos de una empresa
    public function update($data) {
        // Crear una instancia del modelo Empresa
        $empresa = new Empresa(
            $data['id_usuario'],
            $data['nombre_empresa'],
            $data['lugar_operacion']
        );

        // Actualizar los datos de la empresa en la base de datos
        if ($this->empresaDAO->actualizarEmpresa(
            $empresa->getIdUsuario(),
            $empresa->getNombreEmpresa(),
            $empresa->getLugarOperacion()
        )) {
            return true; // Actualización exitosa
        } else {
            return "Error al actualizar los datos de la empresa.";
        }
    }

    // Eliminar una empresa por ID de usuario
    public function delete($id_usuario) {
        if ($this->empresaDAO->eliminarEmpresa($id_usuario)) {
            return true; // Eliminación exitosa
        } else {
            return "Error al eliminar los datos de la empresa.";
        }
    }
}
?>