<?php
// Conexión a la base de datos
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

// Recibir datos del formulario
$nombre     = $_POST['nombre'] ?? '';
$email      = $_POST['email'] ?? '';
$telefono   = $_POST['telefono'] ?? '';
$programa   = $_POST['programa'] ?? '';
$graduacion = $_POST['graduacion'] ?? '';
$perfil     = $_POST['perfil'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';
$confirmar  = $_POST['confirmar_contrasena'] ?? '';

if ($contrasena === '' || $confirmar === '' || $contrasena !== $confirmar) {
    echo "<script>alert('La contraseña es requerida y debe coincidir'); window.history.back();</script>";
    exit;
}

// Hash seguro de la contraseña
$hash = password_hash($contrasena, PASSWORD_DEFAULT);

// Subida del archivo CV
$cv_nombre = $_FILES['cv']['name'] ?? '';
$cv_temporal = $_FILES['cv']['tmp_name'] ?? '';

// Validar extensión PDF
$extension = strtolower(pathinfo($cv_nombre, PATHINFO_EXTENSION));
if ($extension !== 'pdf') {
    echo "<script>alert('El CV debe ser un archivo PDF'); window.history.back();</script>";
    exit;
}

$cv_dir = 'cvs';
if (!is_dir($cv_dir)) {
    mkdir($cv_dir, 0777, true);
}

// Nombre único para evitar colisiones
$cv_destino = $cv_dir . '/' . uniqid('cv_', true) . '.pdf';

if (!move_uploaded_file($cv_temporal, $cv_destino)) {
    echo "<script>alert('Error al subir el archivo CV'); window.history.back();</script>";
    exit;
}

// Insertar datos en la base de datos (prepared statements)
$stmt = mysqli_prepare($conexion, "INSERT INTO egresados (nombre, email, correo, contrasena, telefono, programa, graduacion, perfil, cv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo "Error en la preparación de la consulta: " . mysqli_error($conexion);
    exit;
}
mysqli_stmt_bind_param($stmt, 'ssssssiss', $nombre, $email, $email, $hash, $telefono, $programa, $graduacion, $perfil, $cv_destino);

if (mysqli_stmt_execute($stmt)) {
    header('Location: LoginEgresados.php?ok=1');
    exit;
} else {
    echo "Error al guardar en la base de datos: " . mysqli_error($conexion);
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);
?>
