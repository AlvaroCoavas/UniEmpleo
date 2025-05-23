<?php
require_once '../config/database.php';
require_once '../dao/UsuarioDAO.php';
require_once '../dao/VacanteDAO.php';
require_once '../models/Postulacion.php';
require_once '../utils/Utils.php';

class PostulacionDao {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); 
    }

    public function guardarPostulacion(Postulacion $postulacion) {
        $sql = "INSERT INTO postulaciones (id_usuario_persona, id_vacante, fecha_postulacion, estado) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $id_usuario_persona = $postulacion->getIdUsuarioPersona();
        $id_vacante = $postulacion->getIdVacante();
        $fecha_postulacion = date('Y-m-d H:i:s'); 
        $estado = 'pendiente'; 

        $stmt->bind_param('iiss', $id_usuario_persona, $id_vacante, $fecha_postulacion, $estado);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }

    public function listarPostulacionesPorUsuario($id_usuario_persona) {
        $sql = "SELECT p.*, v.titulo, v.descripcion, v.fecha_publicacion, v.tipo, v.perfil, v.salario 
                FROM postulaciones p
                JOIN vacantes v ON p.id_vacante = v.id_vacante
                WHERE p.id_usuario_persona = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_usuario_persona);
        $stmt->execute();
        $result = $stmt->get_result();

        $postulaciones = [];
        while ($row = $result->fetch_assoc()) {
            $postulaciones[] = [
                'id_postulacion' => $row['id_postulacion'],
                'id_usuario_persona' => $row['id_usuario_persona'],
                'id_vacante' => $row['id_vacante'],
                'fecha_postulacion' => $row['fecha_postulacion'],
                'estado' => $row['estado'],
                'vacante' => [
                    'titulo' => $row['titulo'],
                    'descripcion' => $row['descripcion'],
                    'fecha_publicacion' => $row['fecha_publicacion'],
                    'tipo' => $row['tipo'],
                    'perfil' => $row['perfil'],
                    'salario' => $row['salario']

                ]
            ];
        }

        return $postulaciones;
    }

    public function eliminarPostulacion($id_postulacion) {
        $sql = "DELETE FROM postulaciones WHERE id_postulacion = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_postulacion);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }
}
?>