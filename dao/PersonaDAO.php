<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Persona.php';

class PersonaDAO {
    private $conn;

    public function __construct() {
        $this->conn = Database::getConnection(); // Obtener la conexión a la base de datos
    }

    // Guardar una nueva persona
   
    public function guardarPersona(Persona $persona) {
        
        // Obtener los datos de la persona
        $id_usuario = $persona->getIdUsuario();
        $nombre = $persona->getNombre();
        $apellido = $persona->getApellido();
        $cedula = $persona->getCedula();
        $telefono = $persona->getTelefono();
        $fecha_nacimiento = $persona->getFechaNacimiento();
        $lugar_residencia = $persona->getLugarResidencia();
        $profesion_u_oficio = $persona->getProfesionUOficio();
        $resumen_profesional = $persona->getResumenProfesional();
        $servicios_completados = $persona->getServiciosCompletados();
    
        // Depuración opcional (puedes eliminar esta línea en producción)
       // var_dump($id_usuario, $nombre, $apellido, $fecha_nacimiento, $cedula, $telefono, $lugar_residencia, $profesion_u_oficio, $resumen_profesional, $servicios_completados);
    
        // Preparar la consulta SQL
        $sql = "INSERT INTO personas (
                    id_usuario, nombre, apellido, cedula, telefono, 
                    fecha_nacimiento, lugar_residencia, profesion_u_oficio, 
                    resumen_profesional, servicios_completados
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
        $stmt = $this->conn->prepare($sql);
    
        if ($stmt === false) {
            throw new Exception("Error al preparar la consulta: " . $this->conn->error);
        }
    
        // Asociar los parámetros a la consulta
        $stmt->bind_param(
            'issssssssi',
            $id_usuario,
            $nombre,
            $apellido,
            $cedula,
            $telefono,
            $fecha_nacimiento,
            $lugar_residencia,
            $profesion_u_oficio,
            $resumen_profesional,
            $servicios_completados
        );
    
        // Ejecutar la consulta
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }
    
        return true; // Inserción exitosa
    }
    
    // Obtener datos de una persona por ID de usuario
    public function obtenerPersonaPorId($id_usuario) {
        $sql = "SELECT u.id_usuario, u.correo, u.contrasena, p.nombre, p.apellido, p.fecha_nacimiento, p.cedula, p.telefono, p.lugar_residencia, p.profesion_u_oficio, p.resumen_profesional, p.servicios_completados 
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

        $data = $result->fetch_assoc();
        if ($data) {
            return new Persona(
                $data['id_usuario'],
                $data['correo'],
                $data['contrasena'],
                $data['nombre'],
                $data['apellido'],
                $data['cedula'],
                $data['telefono'],
                $data['fecha_nacimiento'],
                $data['lugar_residencia'],
                $data['profesion_u_oficio'],
                $data['resumen_profesional'],
                $data['servicios_completados']
                
            );
        }

        return null; // Si no se encuentra la persona
    }

    // Actualizar datos de una persona
    public function actualizarPersona(Persona $persona) {
    // Actualizar los datos en la tabla usuarios
    $sqlUsuario = "UPDATE usuarios SET correo = ?, contrasena = ? WHERE id_usuario = ?";
    $stmtUsuario = $this->conn->prepare($sqlUsuario);

    if ($stmtUsuario === false) {
        throw new Exception("Error al preparar la consulta de usuarios: " . $this->conn->error);
    }

    // Asigna a variables antes de bind_param
    $correo = $persona->getCorreo();
    $contrasena = $persona->getContrasena();
    $idUsuario = $persona->getIdUsuario();

    $stmtUsuario->bind_param(
        'ssi',
        $correo,
        $contrasena,
        $idUsuario
    );

    if (!$stmtUsuario->execute()) {
        throw new Exception("Error al ejecutar la consulta de usuarios: " . $stmtUsuario->error);
    }

    // Actualizar los datos específicos de la persona
    $sqlPersona = "UPDATE personas 
                   SET nombre = ?, apellido = ?, fecha_nacimiento = ?, cedula = ?, telefono = ?, lugar_residencia = ?, profesion_u_oficio = ?, resumen_profesional = ?, servicios_completados = ? 
                   WHERE id_usuario = ?";
    $stmtPersona = $this->conn->prepare($sqlPersona);

    if ($stmtPersona === false) {
        throw new Exception("Error al preparar la consulta de personas: " . $this->conn->error);
    }

    // Asigna a variables antes de bind_param
    $nombre = $persona->getNombre();
    $apellido = $persona->getApellido();
    $fecha_nacimiento = $persona->getFechaNacimiento();
    $cedula = $persona->getCedula();
    $telefono = $persona->getTelefono();
    $lugar_residencia = $persona->getLugarResidencia();
    $profesion_u_oficio = $persona->getProfesionUOficio();
    $resumen_profesional = $persona->getResumenProfesional();
    $servicios_completados = $persona->getServiciosCompletados();
    $idUsuario = $persona->getIdUsuario();

    $stmtPersona->bind_param(
        'sssssssisi',
        $nombre,
        $apellido,
        $fecha_nacimiento,
        $cedula,
        $telefono,
        $lugar_residencia,
        $profesion_u_oficio,
        $resumen_profesional,
        $servicios_completados,
        $idUsuario
    );

    if (!$stmtPersona->execute()) {
        throw new Exception("Error al ejecutar la consulta de personas: " . $stmtPersona->error);
    }

    return true; // Actualización exitosa
}

    // Eliminar una persona por ID de usuario
    public function eliminarPersona($id_usuario) {
        // Eliminar primero de la tabla personas
        $sqlPersona = "DELETE FROM personas WHERE id_usuario = ?";
        $stmtPersona = $this->conn->prepare($sqlPersona);

        if ($stmtPersona === false) {
            throw new Exception("Error al preparar la consulta de personas: " . $this->conn->error);
        }

        $stmtPersona->bind_param('i', $id_usuario);

        if (!$stmtPersona->execute()) {
            throw new Exception("Error al ejecutar la consulta de personas: " . $stmtPersona->error);
        }

        // Luego eliminar de la tabla usuarios
        $sqlUsuario = "DELETE FROM usuarios WHERE id_usuario = ?";
        $stmtUsuario = $this->conn->prepare($sqlUsuario);

        if ($stmtUsuario === false) {
            throw new Exception("Error al preparar la consulta de usuarios: " . $this->conn->error);
        }

        $stmtUsuario->bind_param('i', $id_usuario);

        if (!$stmtUsuario->execute()) {
            throw new Exception("Error al ejecutar la consulta de usuarios: " . $stmtUsuario->error);
        }

        return true; // Eliminación exitosa
    }
}
?>