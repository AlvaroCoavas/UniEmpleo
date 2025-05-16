<?php
session_start();
require_once '../config/database.php';

class PerfilController {
    public static function obtenerPerfil($id_usuario) {
        global $conn;
        $sql = "SELECT p.nombre, u.correo, p.profesion_u_oficio, p.lugar_residencia, p.fecha_registro, p.servicios_completados 
                FROM perfil_persona p
                INNER JOIN usuarios u ON u.id_usuario = p.id_usuario
                WHERE u.id_usuario = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}
?>