<?php
session_start();
require_once '../../../dao/PersonaDAO.php';
require_once '../../../dao/UsuarioDAO.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: ../../Usuarios/Index.php');
    exit();
}

$personaDAO = new PersonaDAO();
$usuarioDAO = new UsuarioDAO();

if (isset($_POST['cambiar_contrasena'])) {
    $contrasena_actual = $_POST['contrasena_actual'];
    $nueva = $_POST['nueva_contrasena'];
    $confirmar = $_POST['confirmar_contrasena'];

    // Obtén el usuario actual desde la base de datos
    $persona = $personaDAO->obtenerPersonaPorId($_SESSION['usuario_id']);

    // Verifica la contraseña actual usando password_verify
    if (password_verify($contrasena_actual, $persona->getContrasena())) {
        if ($nueva === $confirmar && !password_verify($nueva, $persona->getContrasena())) {
            // Hashea la nueva contraseña antes de guardarla
            $hash_nueva = password_hash($nueva, PASSWORD_DEFAULT);
            $persona->setContrasena($hash_nueva);
            $usuarioDAO->actualizarUsuario($persona);
            echo "<script>alert('Contraseña actualizada correctamente');</script>";
        } else {
            echo "<script>alert('Las contraseñas nuevas no coinciden o son iguales a la actual');</script>";
        }
    } else {
        echo "<script>alert('La contraseña actual es incorrecta');</script>";
    }
}


// Eliminar cuenta si se envió el formulario
if (isset($_POST['eliminar_cuenta'])) {
    $usuarioDAO->eliminarPersona($_SESSION['usuario_id']);
    session_destroy();
    header('Location: ../../Usuarios/Index.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recoge los datos del formulario
    $nombre = $_POST['nombres'];
    $apellido = $_POST['apellidos'];
    $cedula = $_POST['cedula'];
    $telefono = $_POST['telefono'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];
    $lugar_residencia = $_POST['lugar_residencia'];
    $profesion_u_oficio = $_POST['profesion_u_oficio'];
    $resumen_profesional = $_POST['resumen_profesional'];
    $servicios_completados = $_POST['servicios_completados'];

    // Obtén el objeto persona actual
    $persona = $personaDAO->obtenerPersonaPorId($_SESSION['usuario_id']);

    // Actualiza los valores
    $persona->setNombre($nombre);
    $persona->setApellido($apellido);
    $persona->setCedula($cedula);
    $persona->setTelefono($telefono);
    $persona->setFechaNacimiento($fecha_nacimiento);
    $persona->setLugarResidencia($lugar_residencia);
    $persona->setProfesionUOficio($profesion_u_oficio);
    $persona->setResumenProfesional($resumen_profesional);
    $persona->setServiciosCompletados($servicios_completados);

    // Guarda los cambios en la base de datos
    $personaDAO->actualizarPersona($persona);

    // Opcional: recarga los datos actualizados
    $persona = $personaDAO->obtenerPersonaPorId($_SESSION['usuario_id']);
} else {
    $persona = $personaDAO->obtenerPersonaPorId($_SESSION['usuario_id']);
}

if (!$persona) {
    echo "No se encontró el perfil.";
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi cuenta - Uniempleo</title>
    <link rel="stylesheet" href="../../Css/style.css">
    <style>
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
        }

        /* Sidebar */
        .sidebar {
            width: 200px;
            background-color: #003b80;
            color: white;
            padding: 20px;
            height: 100vh;
        }

        .sidebar h2 {
            color: white;
        }

        .sidebar a {
            display: block;
            color: white;
            margin: 10px 0;
            text-decoration: none;
        }

        /* Main content */
        .main {
            flex: 1;
            background-color: #f5f9fc;
            padding: 40px;
        }

        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
        }

        .profile-circle {
            background-color: #38b000;
            color: white;
            font-weight: bold;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-right: 20px;
        }

        .profile-info {
            flex-grow: 1;
        }

        .profile-info h2 {
            margin: 0;
            font-size: 24px;
        }

        .actions a {
            margin-left: 20px;
            color: #003b80;
            text-decoration: underline;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            font-weight: bold;
            font-size: 14px;
            display: block;
            margin-bottom: 5px;
        }

        input[type="text"],
        input[type="email"] {
            width: 100%;
            padding: 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        input[readonly] {
            background-color: #e9ecef;
            cursor: not-allowed;
        }

        .btn {
            background-color: #003b80;
            color: white;
            padding: 10px 20px;
            font-size: 14px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .btn:hover {
            background-color: #0050aa;
        }

    </style>
    
</head>
<header id="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <h1 style="margin-left: 10px; flex-shrink: 0;">Uniempleo</h1>
        <nav class="nav">
      <a href="../PersonaView/persona_dashboard.php">Volver</a>
    </nav>
    </div>
</header>
<body>
        
    <div class="main">
        <h1>Mi cuenta</h1>
        <br/>
        <div class="profile-header">
            <div class="profile-circle">
            <?php 
            echo strtoupper(substr($persona->getNombre(), 0, 1)); 
            ?>
            </div>
            <div class="profile-info">
                <h2><?php echo htmlspecialchars($persona->getNombre()); ?></h2>
            </div>
            <div class="actions">
                <button type="button" 
                        class="btn" 
                        style="background:#003b80; margin-right:10px;" 
                        onclick="mostrarModal('modalContrasena');">
                    Cambiar contraseña
                </button>
                <form method="POST" style="display:inline;" onsubmit="return confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');">
                <input type="hidden" name="form_tipo" value="eliminar">
                <button type="submit" name="eliminar_cuenta" class="btn" style="background:#d90429;">Eliminar cuenta</button>
            </form>
            </div>
        </div>

    <!-- Modal Cambiar Contraseña -->
<div id="modalContrasena" class="modal" style="display:none; position:fixed; z-index:1000; left:0; top:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4);">
  <div style="background:#fff; max-width:400px; margin:100px auto; padding:30px; border-radius:8px; position:relative;">
    <h3>Cambiar contraseña</h3>
    <br/>
    <form method="POST" onsubmit="return validarContrasena();">
      <div class="form-group">
        <label>Contraseña actual</label>
        <input type="password" name="contrasena_actual" id="contrasena_actual" required>
      </div>
      <div class="form-group">
        <label>Nueva contraseña</label>
        <input type="password" name="nueva_contrasena" id="nueva_contrasena" required>
      </div>
      <div class="form-group">
        <label>Repite la nueva contraseña</label>
        <input type="password" name="confirmar_contrasena" id="confirmar_contrasena" required>
      </div>
      <button type="submit" name="cambiar_contrasena" class="btn" style="background:#003b80;">Guardar</button>
      <button type="button" class="btn" style="background:#ccc; color:#003b80;" onclick="cerrarModal('modalContrasena')">Cancelar</button>
    </form>
    <div id="error_contrasena" style="color:red; margin-top:10px;"></div>
  </div>
</div>

    <form method="POST" action="">
        <div class="form-group">
            <label>Nombre</label>
            <input type="text" name="nombres" value="<?php echo htmlspecialchars($persona->getNombre()); ?>">
        </div>
        <div class="form-group">
            <label>Apellido</label>
            <input type="text" name="apellidos" value="<?php echo htmlspecialchars($persona->getApellido()); ?>">
        </div>
        <div class="form-group">
            <label>Cedula</label>
            <input type="text" name="cedula" value="<?php echo htmlspecialchars($persona->getCedula()); ?>">
        </div>
        <div class="form-group">
            <label>Telefono</label>
            <input type="text" name="telefono" value="<?php echo htmlspecialchars($persona->getTelefono()); ?>">
        </div>
        <div class="form-group">
            <label>Fecha de nacimiento</label>
            <input type="date" name="fecha_nacimiento" value="<?php echo htmlspecialchars($persona->getFechaNacimiento()); ?>">
        </div>
        <div class="form-group">
            <label>Lugar de residencia</label>
            <input type="text" name="lugar_residencia" value="<?php echo htmlspecialchars($persona->getLugarResidencia()); ?>">
        </div>
        <div class="form-group">
            <label>Profesion u oficio</label>
            <input type="text" name="profesion_u_oficio" value="<?php echo htmlspecialchars($persona->getProfesionUOficio()); ?>">
        </div>
        <div class="form-group">
            <label>Resumen profesional</label>
            <textarea name="resumen_profesional"><?php echo htmlspecialchars($persona->getResumenProfesional()); ?></textarea>
        </div>
        <div class="form-group">
            <label>Servicios completados</label>
            <input type="text" name="servicios_completados" value="<?php echo htmlspecialchars($persona->getServiciosCompletados()); ?>">
        </div>
        <button type="submit" class="btn">Guardar</button>
    </form>
      
      <script src="../../Js/main.js"></script>
</body>
</html>
