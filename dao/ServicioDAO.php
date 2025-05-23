 <?php
    require_once '../config/database.php';
    require_once '../dao/ServicioDAO.php';
    require_once '../models/Servicio.php';
    require_once '../utils/Utils.php';
    require_once '../dao/UsuarioDAO.php';
 
 class ServicioDAO {

        private $conexion;
    
        public function __construct() {
            $this->conn = Database::getConnection();
        }
        public function guardarServicio(Servicio $servicio) {
            $sql = "INSERT INTO servicios (id_usuario_solicita, nombre_servicio, descripcion, fecha_solicitud, estado) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta: " . $this->conexion->error);
            }

            $id_usuario_solicita = $servicio->getIdUsuarioSolicita();
            $nombre_servicio = $servicio->getNombreServicio();
            $descripcion = $servicio->getDescripcion();
            $fecha_solicitud = date('Y-m-d H:i:s'); 
            $estado = 'pendiente'; 
            $stmt->bind_param('issss', $id_usuario_solicita, $nombre_servicio, $descripcion, $fecha_solicitud, $estado);

            if ($stmt->execute()) {
                return true;
            } else {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
            }

        }

        public function obtenerServiciosPorUsuario($id_usuario_solicita) {
            $servicios = [];
        
            $sql = "SELECT * FROM servicios WHERE id_usuario_solicita = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_usuario_solicita);
            $stmt->execute();
            $result = $stmt->get_result();
        
            while ($row = $result->fetch_assoc()) {
                
                $servicio = [
                    'id_servicio' => $row['id_servicio'],
                    'nombre_servicio' => $row['nombre_servicio'],
                    'descripcion' => $row['descripcion'],
                    'fecha_solicitud' => $row['fecha_solicitud'],
                    'estado' => $row['estado'],
                    'ofertantes' => []
                ];
        
               
                $sql2 = "SELECT u.id_usuario, p.nombre, p.apellido, u.correo 
                         FROM servicio_ofrecido so
                         JOIN usuarios u ON so.id_usuario_ofrece = u.id_usuario
                         JOIN personas p ON u.id_usuario = p.id_usuario
                         WHERE so.id_servicio = ?";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("i", $row['id_servicio']);
                $stmt2->execute();
                $result2 = $stmt2->get_result();
        
                while ($ofertante = $result2->fetch_assoc()) {
                    $servicio['ofertantes'][] = [
                        'id_usuario' => $ofertante['id_usuario'],
                        'nombre' => $ofertante['nombre'] . ' ' . $ofertante['apellido'],
                        'correo' => $ofertante['correo']
                    ];
                }
        
                $servicios[] = $servicio;
            }
        
            return $servicios;
        }
        
        public function obtenerSolicitudesConOfertas($usuarioId) {
        
        $sql = "SELECT 
                    s.id_servicio, 
                    s.nombre_servicio, 
                    s.descripcion, 
                    s.fecha_solicitud, 
                    s.estado,
                    u.id_usuario AS id_ofertante, 
                    p.nombre AS nombre_ofertante, 
                    p.apellido AS apellido_ofertante, 
                    u.correo AS correo_ofertante
                FROM servicios s
                LEFT JOIN servicio_ofrecido so ON s.id_servicio = so.id_servicio
                LEFT JOIN usuarios u ON so.id_usuario_ofrece = u.id_usuario
                LEFT JOIN personas p ON u.id_usuario = p.id_usuario
                WHERE s.id_usuario_solicita = ?
                ORDER BY s.id_servicio";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('i', $usuarioId);
            $stmt->execute();
            $result = $stmt->get_result();
        
            $serviciosAgrupados = [];
        
            while ($row = $result->fetch_assoc()) {
                $id = $row['id_servicio'];
        
                if (!isset($serviciosAgrupados[$id])) {
                    $serviciosAgrupados[$id] = [
                        'id_servicio' => $row['id_servicio'],
                        'nombre_servicio' => $row['nombre_servicio'],
                        'descripcion' => $row['descripcion'],
                        'fecha_solicitud' => $row['fecha_solicitud'],
                        'estado' => $row['estado'],
                        'ofertantes' => [],
                    ];
                }
        
                if ($row['id_ofertante']) {
                    $serviciosAgrupados[$id]['ofertantes'][] = [
                        'id' => $row['id_ofertante'],
                        'nombre' => $row['nombre_ofertante'] . ' ' . $row['apellido_ofertante'],
                        'correo' => $row['correo_ofertante'],
                    ];
                }
            }
        
            return array_values($serviciosAgrupados);
        }
        
        public function listarServiciosNoPropios($id_usuario) {
            $sql = "SELECT * FROM servicios WHERE id_usuario_solicita != ?";
            $stmt = $this->conn->prepare($sql);
            
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta: " . $this->conexion->error);
            }

            $stmt->bind_param('i', $id_usuario);
            $stmt->execute();
            $result = $stmt->get_result();

            $servicios = [];
            while ($row = $result->fetch_assoc()) {
                $servicios[] = [
                    'id_servicio' => $row['id_servicio'],
                    'id_usuario_solicita' => $row['id_usuario_solicita'],
                    'nombre_servicio' => $row['nombre_servicio'],
                    'descripcion' => $row['descripcion'],
                    'fecha_solicitud' => $row['fecha_solicitud'],
                    'estado' => $row['estado'],
                ];
            }

            return $servicios;
        }

        public function asignarUsuarioOfrece($idServicio, $usuarioId) {
            $sql = "UPDATE servicios SET id_usuario_ofrece = ? WHERE id_servicio = ?";
            $stmt = $this->conn->prepare($sql);
        
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta: " . $this->conn->error);
            }
        
            $stmt->bind_param('ii', $usuarioId, $idServicio);
        
            if ($stmt->execute()) {
                return $stmt->affected_rows > 0; 
            } else {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
            }
        }
        
         

 }

 ?>