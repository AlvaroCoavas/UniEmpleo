<?php
// Conexión a la base de datos
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

// Recibir datos del formulario
$nombre     = $_POST['nombre'];
$email      = $_POST['email'];
$telefono   = $_POST['telefono'];
$programa   = $_POST['programa'];
$graduacion = $_POST['graduacion'];
$perfil     = $_POST['perfil'];

// Subida del archivo CV
$cv_nombre = $_FILES['cv']['name'];
$cv_temporal = $_FILES['cv']['tmp_name'];
$cv_destino = "cvs/" . basename($cv_nombre);

// Crear carpeta si no existe
if (!is_dir('cvs')) {
    mkdir('cvs', 0777, true);
}

if (move_uploaded_file($cv_temporal, $cv_destino)) {
    // Insertar datos en la base de datos
    $query = "INSERT INTO egresados (nombre, email, telefono, programa, graduacion, perfil, cv)
              VALUES ('$nombre', '$email', '$telefono', '$programa', '$graduacion', '$perfil', '$cv_destino')";

    if (mysqli_query($conexion, $query)) {
        echo "<h3>Perfil registrado correctamente.</h3>";
        echo "<a href='registro_egresado.html'>Volver</a>";
    } else {
        echo "Error al guardar en la base de datos: " . mysqli_error($conexion);
    }
} else {
    echo "Error al subir el archivo CV.";
}

mysqli_close($conexion);
?>
