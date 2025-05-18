<?php
require_once '../config/database.php';

class PersonaDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Guardar una nueva persona
    public function guardarPersona($id_usuario, $nombre, $apellido, $fecha_nacimiento) {
        $sql = "INSERT INTO personas (id_usuario, nombre, apellido, fecha_nacimiento) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        // Verificar si la preparación de la consulta fue exitosa
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        // Usar bind_param para enlazar los parámetros
        $stmt->bind_param('isss', $id_usuario, $nombre, $apellido, $fecha_nacimiento);

        // Ejecutar la consulta
        if ($stmt->execute()) {
            return true; // Inserción exitosa
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }
}
?>