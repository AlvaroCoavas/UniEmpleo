<?php
require_once '../config/database.php';
require_once '../models/Vacante.php';

class VacanteDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Crear una nueva vacante
    public function guardarVacante(Vacante $vacante) {
        
        $id_usuario_empresa = $vacante->getIdUsuarioEmpresa();
        $titulo = $vacante->getTitulo();
        $descripcion = $vacante->getDescripcion();
        $salario = $vacante->getSalario();
        $estado = $vacante->getEstado();
        $fechaPublicacion = $vacante->getFechaPublicacion();
        $ciudad = $vacante->getCiudad();
        $tipo = $vacante->getTipo();
        $perfil = $vacante->getPerfil();

    var_dump($id_usuario_empresa, $titulo, $descripcion, $salario, $estado, $fechaPublicacion, $ciudad, $tipo, $perfil);
        // Preparar la consulta SQL
        $sql = "INSERT INTO vacantes (id_usuario_empresa, titulo, descripcion, salario, estado, fecha_publicacion, ciudad, tipo, perfil) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        // Validar la conexión antes de preparar la consulta
        if ($this->conn === null) {
            throw new Exception("Error: La conexión a la base de datos no está establecida");
        }
        
        $stmt = $this->conn->prepare($sql);
    
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }
    
        // Obtener los valores y validarlos antes de insertarlos
      
        
        $stmt->bind_param(
            'issssssss',
            $id_usuario_empresa,
            $titulo,
            $descripcion,
            $salario,
            $estado,
            $fechaPublicacion,
            $ciudad,
            $tipo,
            $perfil
        );
    
        
            if (!$stmt->execute()) {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
            }
            
            // Retornar el ID de la vacante insertada
            $idInsertado = $this->conn->insert_id;
            $stmt->close();
            
            return $idInsertado;
        
            // Cerrar el statement antes de propagar la excepción
            $stmt->close();
            throw $e;
        
    }

    // Obtener todas las vacantes
    public function obtenerTodasLasVacantes() {
        $sql = "SELECT * FROM vacantes";
        $result = $this->conn->query($sql);

        if ($result === false) {
            throw new Exception("Error al ejecutar la consulta: " . $this->conn->error);
        }

        $vacantes = [];
        while ($row = $result->fetch_assoc()) {
            $vacantes[] = new Vacante(
                $row['id_vacante'],
                $row['id_usuario_empresa'],
                $row['titulo'],
                $row['descripcion'],
                $row['salario'],
                $row['estado'],
                $row['fecha_publicacion'],
                $row['ciudad'],
                $row['tipo'],
                $row['perfil']
            );
        }

        return $vacantes;
    }

    // Obtener una vacante por ID
    public function obtenerVacantePorId($id_vacante) {
        $sql = "SELECT * FROM vacantes WHERE id_vacante = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_vacante);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_assoc();
        if ($data) {
            return new Vacante(
                $data['id_vacante'],
                $data['id_empresa'],
                $data['titulo'],
                $data['descripcion'],
                $data['salario'],
                $data['estado'],
                $data['fecha_publicacion'],
                $data['ciudad'],
                $data['tipo'],
                $data['perfil']
            );
        }

        return null; // Si no se encuentra la vacante
    }

    // Actualizar una vacante
    public function actualizarVacante(Vacante $vacante) {
        $sql = "UPDATE vacantes 
                SET titulo = ?, descripcion = ?, salario = ?, estado = ?, fecha_publicacion = ?, ciudad = ?, tipo = ?, perfil = ? 
                WHERE id_vacante = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param(
            'ssdsssssi',
            $vacante->getTitulo(),
            $vacante->getDescripcion(),
            $vacante->getSalario(),
            $vacante->getEstado(),
            $vacante->getFechaPublicacion(),
            $vacante->getCiudad(),
            $vacante->getTipo(),
            $vacante->getPerfil(),
            $vacante->getIdVacante()
        );

        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        return true; // Actualización exitosa
    }

    // Eliminar una vacante por ID
    public function eliminarVacante($id_vacante) {
        $sql = "DELETE FROM vacantes WHERE id_vacante = ?";
        $stmt = $this->conn->prepare($sql);

        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }

        $stmt->bind_param('i', $id_vacante);

        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        return true; // Eliminación exitosa
    }
}
?>