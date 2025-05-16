<?php
function verificarSesion() {
    if (!isset($_SESSION['id_usuario'])) {
        header("Location: ../View/login.php");
        exit();
    }
}

function redirigirSiEsNuevoUsuario() {
    if (isset($_SESSION['nuevo_usuario']) && $_SESSION['nuevo_usuario'] === true) {
        unset($_SESSION['nuevo_usuario']);
        return true;
    }
    return false;
}

class Validation {
    // Validar el formato del correo electrónico
    public static function validarCorreo($correo) {
        return filter_var($correo, FILTER_VALIDATE_EMAIL);
    }

    // Validar la fecha de nacimiento
    public static function validarFechaNacimiento($fecha_nacimiento) {
        $fecha_actual = date("Y-m-d");
        return strtotime($fecha_nacimiento) <= strtotime($fecha_actual);
    }

    // Validar la longitud de la contraseña
    public static function validarLongitudContrasena($contrasena) {
        return strlen($contrasena) >= 8;
    }

    // Validar que la contraseña contenga al menos un número
    public static function validarContrasenaNumero($contrasena) {
        return preg_match('/[0-9]/', $contrasena);
    }

    // Validar que la contraseña contenga al menos una letra mayúscula
    public static function validarContrasenaMayuscula($contrasena) {
        return preg_match('/[A-Z]/', $contrasena);
    }

    // Verificar si el correo ya existe en la base de datos
    public static function verificarCorreoExistente($conn, $correo) {
        $sql = "SELECT * FROM usuarios WHERE correo = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }
}
?>