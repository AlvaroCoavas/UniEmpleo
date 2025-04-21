<?php
// Conexión a la base de datos
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Vacantes Disponibles</title>
    <link rel="stylesheet" href="style.css"> <!-- Asegúrate de tener tu estilo aquí -->
</head>
<body>
    <header class="header">
        <h1>Vacantes Disponibles</h1>
    </header>

    <div class="content">
        <?php
        $consulta = "SELECT * FROM vacantes ORDER BY fecha_publicacion DESC";
        $resultado = mysqli_query($conexion, $consulta);

        if (mysqli_num_rows($resultado) > 0) {
            while ($fila = mysqli_fetch_assoc($resultado)) {
                echo "<div class='formulario'>";
                echo "<h3>" . htmlspecialchars($fila['cargo']) . "</h3>";
                echo "<p><strong>Empresa:</strong> " . htmlspecialchars($fila['empresa']) . "</p>";
                echo "<p><strong>Descripción:</strong> " . nl2br(htmlspecialchars($fila['descripcion'])) . "</p>";
                echo "<p><strong>Requisitos:</strong> " . nl2br(htmlspecialchars($fila['requisitos'])) . "</p>";
                echo "<p><strong>Publicado el:</strong> " . htmlspecialchars($fila['fecha_publicacion']) . "</p>";
                echo "<form action='postular.php' method='post'>
                        <input type='hidden' name='id_vacante' value='" . $fila['id'] . "'>
                        <input type='submit' value='Postularme'>
                      </form>";
                echo "</div>";
            }
        } else {
            echo "<p>No hay vacantes disponibles en este momento.</p>";
        }

        mysqli_close($conexion);
        ?>
    </div>

    <footer class="footer">
        <p>&copy; 2025 Uniempleo</p>
    </footer>
</body>
</html>