<?php
require_once '../config/database.php';

class EmpresaDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    // Crear una nueva empresa
    public function guardarEmpresa($id_usuario, $nombre_empresa, $lugar_operacion) {
        $sql = "INSERT INTO empresas (id_usuario, nombre_empresa, lugar_operacion) 
                VALUES (:id_usuario, :nombre_empresa, :lugar_operacion)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->bindParam(':nombre_empresa', $nombre_empresa);
        $stmt->bindParam(':lugar_operacion', $lugar_operacion);
        return $stmt->execute();
    }

    // Obtener datos de una empresa por ID de usuario
    public function obtenerEmpresaPorUsuarioId($id_usuario) {
        $sql = "SELECT * FROM empresas WHERE id_usuario = :id_usuario";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Actualizar datos de una empresa
    public function actualizarEmpresa($id_usuario, $nombre_empresa, $lugar_operacion) {
        $sql = "UPDATE empresas 
                SET nombre_empresa = :nombre_empresa, lugar_operacion = :lugar_operacion 
                WHERE id_usuario = :id_usuario";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->bindParam(':nombre_empresa', $nombre_empresa);
        $stmt->bindParam(':lugar_operacion', $lugar_operacion);
        return $stmt->execute();
    }

}
?>