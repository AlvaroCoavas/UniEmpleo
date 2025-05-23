<?php
require_once '../config/database.php';
require_once '../models/ServicioOfrecido.php';
require_once '../dao/UsuarioDAO.php';
require_once '../dao/PersonaDAO.php';
require_once '../dao/ServicioDAO.php';
require_once '../models/Servicio.php';
require_once '../utils/Utils.php';


class ServicioOfrecidoDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    public function registrar(ServicioOfrecido $ofrecido) {
        $sql = "INSERT INTO servicio_ofrecido (id_servicio, id_usuario_ofrece, fecha_ofrecimiento) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('iis', 
            $ofrecido->getIdServicio(), 
            $ofrecido->getIdUsuario(), 
            $ofrecido->getFechaOfrecimiento()
        );
        return $stmt->execute();
    }

    public function guardarOferta($idServicio, $usuarioId) {
        $sql = "INSERT INTO servicio_ofrecido (id_servicio, id_usuario_ofrece) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('ii', $idServicio, $usuarioId);
        return $stmt->execute();
    }

    public function yaOfrecio($id_servicio, $id_usuario) {
        $sql = "SELECT COUNT(*) as total FROM servicio_ofrecido WHERE id_servicio = ? AND id_usuario_ofrece = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('ii', $id_servicio, $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'] > 0;
    }

    public function obtenerPorServicio($id_servicio) {
        $sql = "SELECT u.nombre, u.correo, so.fecha_ofrecimiento
                FROM servicio_ofrecido so
                JOIN usuarios u ON u.id_usuario = so.id_usuario_ofrece
                WHERE so.id_servicio = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $id_servicio);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }


    public function obtenerUsuariosPorServicio($id_servicio) {
        $usuarios = [];
    
        $stmt ="SELECT p.nombre, p.apellido, p.telefono, u.id_usuario, u.correo
                FROM servicios_ofrecido so
                INNER JOIN usuarios u ON so.id_usuario_ofrece = u.id_usuario
                INNER JOIN persona p ON u.id_usuario = p.id_usuario
                WHERE so.id_servicio = ?";
    
        $stmt = $this->conn->prepare($stmt);
        if ($stmt) {
            $stmt->bind_param("i", $id_servicio);
            $stmt->execute();
            $resultado = $stmt->get_result();
    
            while ($fila = $resultado->fetch_assoc()) {
                $usuarios[] = $fila;
            }
    
            $stmt->close();
        }
    
        return $usuarios;
    }
    
    
}
?>
