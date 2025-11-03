<?php
session_start();
$isEmpresa = isset($_SESSION['empresa_id']);
$isEgresado = isset($_SESSION['correo']);
$empresaNombre = $_SESSION['empresa_nombre'] ?? '';
$egresadoCorreo = $_SESSION['correo'] ?? '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Inicio | Uniempleo</title>
    <link rel="stylesheet" href="/Css/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand"><a href="/View/Index.php">UniEmpleo</a></div>
        <div class="nav-links">
            <a href="/View/Index.php" class="active">Inicio</a>
            <div class="dropdown">
              <a href="#" class="dropbtn">Egresados</a>
              <div class="dropdown-content">
                <a href="/View/LoginEgresados.php">Login</a>
                <a href="/View/RegistroEgresados.html">Registrarse</a>
              </div>
            </div>
            <div class="dropdown">
              <a href="#" class="dropbtn">Empresas</a>
              <div class="dropdown-content">
                <a href="/View/LoginEmpresa.html">Login</a>
                <a href="/View/RegistroEmpresa.html">Registrarse</a>
              </div>
            </div>
            <!-- Enlace “Vacantes” eliminado del navbar -->
        </div>
    </nav>

    <?php if ($isEmpresa): ?>
      <header class="header">
        <h1>Panel de Empresa</h1>
        <p>Bienvenido, <?php echo htmlspecialchars($empresaNombre); ?>. Gestiona tus vacantes y acciones rápidas.</p>
      </header>
      <main class="inicio-main">
        <section class="card" style="margin-bottom:16px;">
          <h2>Inicio</h2>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Misión</h3>
              <p>Conectar egresados del Unicolombo con empresas, facilitando oportunidades laborales de calidad, procesos de selección ágiles y vínculos sostenibles.</p>
            </div>
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Visión</h3>
              <p>Ser el puente líder que transforma el talento en impacto, convirtiendo a Uniempleo en referente regional de empleabilidad e inclusión.</p>
            </div>
          </div>
          <div class="card" style="margin-top:12px;">
            <h3>Sobre nosotros</h3>
            <p>Para empresas: publica vacantes, gestiona candidatos y encuentra perfiles alineados a tus necesidades.
            Para egresados: construye tu perfil profesional, busca vacantes y mejora tu empleabilidad con oportunidades relevantes.</p>
          </div>
        </section>
        <!-- Bienvenida (Empresa) sin tarjetas de acción -->
      </main>

    <?php elseif ($isEgresado): ?>
      <header class="header">
        <h1>Panel de Egresado</h1>
        <p>Bienvenido, <?php echo htmlspecialchars($egresadoCorreo); ?>. Busca y explora vacantes recomendadas.</p>
      </header>
      <main class="inicio-main">
        <section class="card" style="margin-bottom:16px;">
          <h2>Inicio</h2>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Misión</h3>
              <p>Conectar egresados del Unicolombo con empresas, facilitando oportunidades laborales de calidad, procesos de selección ágiles y vínculos sostenibles.</p>
            </div>
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Visión</h3>
              <p>Ser el puente líder que transforma el talento en impacto, convirtiendo a Uniempleo en referente regional de empleabilidad e inclusión.</p>
            </div>
          </div>
          <div class="card" style="margin-top:12px;">
            <h3>Sobre nosotros</h3>
            <p>Para empresas: publica vacantes, gestiona candidatos y encuentra perfiles alineados a tus necesidades.
            Para egresados: construye tu perfil profesional, busca vacantes y mejora tu empleabilidad con oportunidades relevantes.</p>
          </div>
        </section>
        <!-- Bienvenida (Egresado) sin tarjetas de acción -->
      </main>

    <?php else: ?>
      <header class="header">
        <h1>Bienvenido a Uniempleo</h1>
        <p>Explora el portal. Accede desde el menú superior.</p>
      </header>
      <main class="inicio-main">
        <section class="card" style="margin-bottom:16px;">
          <h2>Inicio</h2>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Misión</h3>
              <p>Conectar egresados del Unicolombo con empresas, facilitando oportunidades laborales de calidad, procesos de selección ágiles y vínculos sostenibles.</p>
            </div>
            <div class="card" style="flex:1; min-width:260px;">
              <h3>Visión</h3>
              <p>Ser el puente líder que transforma el talento en impacto, convirtiendo a Uniempleo en referente regional de empleabilidad e inclusión.</p>
            </div>
          </div>
          <div class="card" style="margin-top:12px;">
            <h3>Sobre nosotros</h3>
            <p>Para empresas: publica vacantes, gestiona candidatos y encuentra perfiles alineados a tus necesidades.
            Para egresados: construye tu perfil profesional, busca vacantes y mejora tu empleabilidad con oportunidades relevantes.</p>
          </div>
        </section>
      </main>
    <?php endif; ?>

    <footer class="footer">
        <p>&copy; 2025 Uniempleo | Todos los derechos reservados</p>
    </footer>
</body>
</html>