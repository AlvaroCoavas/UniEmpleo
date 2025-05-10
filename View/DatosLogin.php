<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "root", "bd_pa_uniempleo");

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener datos del formulario
$correo = $_POST['em'];
$pass = $_POST['pa'];

session_start();

// Buscar usuario por correo
$sql = "SELECT * FROM usuarios WHERE correo = '$correo'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    // Verificar la contraseña cifrada
    if (password_verify($pass, $row['contrasena'])) {
        $_SESSION['correo'] = $correo;
        $_SESSION['tipo'] = $row['tipo_usuario'];

        if ($row['tipo_usuario'] === 'persona') {
            header("Location: PrincipalPersonanatural.html");
        } else if ($row['tipo_usuario'] === 'empresa') {
            header("Location: PrincipalPersonanatural.html");
        }
        exit();
    } else {
        echo "<script>alert('Contraseña incorrecta'); window.location='index.html';</script>";
    }
} else {
    echo "<script>alert('Correo no registrado'); window.location='index.html';</script>";
}

$conn->close();
?>
