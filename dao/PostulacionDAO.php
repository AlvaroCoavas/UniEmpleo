<?php
require_once '../config/database.php';
require_once '../dao/UsuarioDAO.php';
require_once '../dao/VacanteDAO.php';
require_once '../models/Postulacion.php';
require_once '../utils/Utils.php';

class PostulacionDao {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Guardar una postulacion en la base de datos
    public function guardarPostulacion(Postulacion $postulacion) {
        $sql = "INSERT INTO postulaciones (id_usuario_persona, id_vacante, fecha_postulacion, estado) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        // Asignar valores a variables antes de pasarlos como referencia
        $id_usuario_persona = $postulacion->getIdUsuarioPersona();
        $id_vacante = $postulacion->getIdVacante();
        $fecha_postulacion = date('Y-m-d H:i:s'); // Fecha actual
        $estado = 'pendiente'; // Estado inicial

        $stmt->bind_param('iiss', $id_usuario_persona, $id_vacante, $fecha_postulacion, $estado);

        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    }
}


?>