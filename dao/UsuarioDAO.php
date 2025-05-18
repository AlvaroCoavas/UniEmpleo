<?php
require_once(__DIR__ . '/../config/database.php');

class UsuarioDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Guardar un usuario en la base de datos
    public function guardarUsuario($correo, $contrasena, $tipo_usuario) {
        $sql = "INSERT INTO usuarios (correo, contrasena, tipo_usuario) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('sss', $correo, $contrasena, $tipo_usuario);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Obtener todos los usuarios
    public function obtenerTodosLosUsuarios() {
        $sql = "SELECT * FROM usuarios";
        $result = $this->conn->query($sql);

        if ($result === false) {
            throw new Exception("Error al ejecutar la consulta: " . $this->conn->error);
        }

        return $result->fetch_all(MYSQLI_ASSOC);
    }

 
    public function obtenerUsuarioPorId($id_usuario) {
        $sql = "SELECT u.id_usuario, p.nombre, p.apellido, u.correo 
                FROM usuarios u
                JOIN personas p ON u.id_usuario = p.id_usuario
                WHERE u.id_usuario = ?";
        $stmt = $this->conn->prepare($sql);
    
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }
    
        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();
    
        $usuario = $result->fetch_assoc(); // Devuelve un array asociativo con los datos del usuario
    
        // Depuración: Verifica los datos del usuario
        var_dump($usuario);
    
        return $usuario;
    }

    // Obtener el último ID insertado
    public function obtenerUltimoId() {
        return $this->conn->insert_id;
    }

    // Actualizar un usuario
    public function actualizarUsuario($id_usuario, $correo, $contrasena, $tipo_usuario) {
        $sql = "UPDATE usuarios SET correo = ?, contrasena = ?, tipo_usuario = ? WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('sssi', $correo, $contrasena, $tipo_usuario, $id_usuario);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Eliminar un usuario
    public function eliminarUsuario($id_usuario) {
        $sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_usuario);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Verificar si un correo ya está registrado
    public function verificarCorreo($correo) {
        $sql = "SELECT * FROM usuarios WHERE correo = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('s', $correo);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc(); // Devuelve un arreglo asociativo si encuentra el correo
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    // Obtener un usuario por su correo
    public function obtenerUsuarioPorCorreo($correo) {
        $sql = "SELECT * FROM usuarios WHERE correo = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('s', $correo);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc(); // Devuelve un arreglo asociativo con los datos del usuario
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }
}
?>