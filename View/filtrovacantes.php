<?php
$conexion = new mysqli("localhost", "root", "", "uniempleo");

$palabra = $_GET['palabra_clave'] ?? '';
$ubicacion = $_GET['ubicacion'] ?? '';
$area = $_GET['area'] ?? '';
$experiencia = $_GET['experiencia'] ?? '';

// Construcción dinámica de la consulta
$sql = "SELECT * FROM vacantes WHERE 1=1";

if (!empty($palabra)) {
    $sql .= " AND (titulo LIKE '%$palabra%' OR descripcion LIKE '%$palabra%')";
}
if (!empty($ubicacion)) {
    $sql .= " AND ubicacion LIKE '%$ubicacion%'";
}
if (!empty($area)) {
    $sql .= " AND area = '$area'";
}
if (!empty($experiencia)) {
    $sql .= " AND experiencia = '$experiencia'";
}

$resultado = $conexion->query($sql);

echo "<h2>Resultados:</h2>";
while ($fila = $resultado->fetch_assoc()) {
    echo "<div style='border:1px solid #ccc; padding:10px; margin:10px'>";
    echo "<h3>{$fila['titulo']}</h3>";
    echo "<p><strong>Empresa:</strong> {$fila['empresa']}</p>";
    echo "<p><strong>Ubicación:</strong> {$fila['ubicacion']}</p>";
    echo "<p><strong>Área:</strong> {$fila['area']}</p>";
    echo "<p><strong>Experiencia requerida:</strong> {$fila['experiencia']}</p>";
    echo "<p>{$fila['descripcion']}</p>";
    echo "</div>";
}

$conexion->close();
?>
