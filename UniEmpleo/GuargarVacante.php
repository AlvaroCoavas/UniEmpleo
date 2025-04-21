<?php
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

$titulo = $_POST['titulo'];
$descripcion = $_POST['descripcion'];
$ubicacion = $_POST['ubicacion'];
$tipo_empleo = $_POST['tipo_empleo'];
$empresa_id = 1; // ⚠️ Aquí más adelante se usará el ID de la empresa logueada

$query = "INSERT INTO vacantes (empresa_id, titulo, descripcion, ubicacion, tipo_empleo)
          VALUES ('$empresa_id', '$titulo', '$descripcion', '$ubicacion', '$tipo_empleo')";

if (mysqli_query($conexion, $query)) {
    echo "<h3>Vacante publicada correctamente.</h3>";
} else {
    echo "Error: " . mysqli_error($conexion);
}

mysqli_close($conexion);
?>