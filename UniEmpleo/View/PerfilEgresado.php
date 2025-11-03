<?php
require_once dirname(__DIR__) . '/Auth/auth.php';
require_egresado();

$correo = $_SESSION['correo'] ?? null;
$egresado = null;
if ($correo) {
  $conn = mysqli_connect("localhost", "root", "", "uniempleo");
  if ($conn) {
    $stmt = mysqli_prepare($conn, "SELECT nombre, correo, email, telefono, programa, graduacion, perfil, cv FROM egresados WHERE correo = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, 's', $correo);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    if ($result && $row = mysqli_fetch_assoc($result)) { $egresado = $row; }
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
  }
}

$substr = function($s){ return function_exists('mb_substr') ? mb_substr($s,0,1,'UTF-8') : substr($s,0,1); };
$initial = strtoupper($substr($egresado['nombre'] ?? $correo ?? 'U'));
$nombre = $egresado['nombre'] ?? 'Egresado';
$programa = $egresado['programa'] ?? '—';
$graduacion = $egresado['graduacion'] ?? '—';
$telefono = $egresado['telefono'] ?? '—';
$email = $egresado['email'] ?? $correo ?? '—';
$perfil = $egresado['perfil'] ?? 'Completa tu perfil para mejores recomendaciones.';
$cv = $egresado['cv'] ?? null;
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Perfil</title>
  <link rel="stylesheet" href="/Css/style.css">
  <style>
    /* Feed vertical (perfil) */
    .feed { display: grid; gap: 12px; }
    .feed-item { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:10px; }
    .feed-item .title { font-weight:600; }
    .feed-item .meta { color:#6b7280; font-size:12px; margin-top:4px; }
    .feed-item--news .title a { color:#1f2937; text-decoration:none; }
    .feed-item--news .title a:hover { color:#4338ca; }
    .sentinel { height:1px; }
  </style>
</head>
<body>
  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    <h1>Mi Perfil</h1>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3>Egresado</h3>
      <div class="menu">
        <a href="/View/InicioEgresado.php">Inicio</a>
        <a href="/View/BuscarVacantes.php">Buscar Vacantes</a>
        <a href="/View/Vacantes.php" class="active">Ver Vacantes</a>
        <a href="/View/PerfilEgresado.php" class="active">Mi Perfil</a>
        <a href="/View/RegistroEgresados.html">Actualizar Perfil</a>
        <a href="/Auth/logout.php">Salir</a>
      </div>
    </aside>

    <div class="content content--two-col">
      <div class="col-left">
        <?php include __DIR__ . '/components/profile_card.php'; ?>
        <div class="card">
          <h3>Sobre mí</h3>
          <p><?php echo nl2br(htmlspecialchars($perfil)); ?></p>
        </div>

        <div class="card">
          <h3>Educación</h3>
          <ul class="list">
            <li><strong>Unicolombo</strong><br><span><?php echo htmlspecialchars($programa); ?></span><br><span>Promoción: <?php echo htmlspecialchars($graduacion); ?></span></li>
          </ul>
        </div>

        <div class="card">
          <h3>Contacto</h3>
          <ul class="list">
            <li>Correo: <a href="mailto:<?php echo htmlspecialchars($email); ?>"><?php echo htmlspecialchars($email); ?></a></li>
            <li>Teléfono: <?php echo htmlspecialchars($telefono); ?></li>
          </ul>
        </div>

        <div class="card">
          <h3>Documentos</h3>
          <?php if ($cv): ?>
            <p>CV cargado: <a class="button" href="<?php echo htmlspecialchars($cv); ?>" target="_blank">Abrir CV</a></p>
          <?php else: ?>
            <p>No has cargado un CV. <a class="button btn--ghost" href="/View/RegistroEgresados.html">Sube tu CV</a></p>
          <?php endif; ?>
        </div>
      </div>
      <div class="col-right">
        <section class="card card--center">
          <div class="profile-cover">
            <div class="profile-cover-inner">
              <div class="profile-avatar-xl"><?php echo htmlspecialchars($initial); ?></div>
              <div class="profile-lead">
                <h2 class="profile-title"><?php echo htmlspecialchars($nombre); ?></h2>
                <p class="profile-sub">Programa: <?php echo htmlspecialchars($programa); ?> · Graduación: <?php echo htmlspecialchars($graduacion); ?></p>
                <p class="profile-sub">Correo: <?php echo htmlspecialchars($email); ?> · Tel: <?php echo htmlspecialchars($telefono); ?></p>
                <div class="profile-actions">
                  <a class="button" href="/View/RegistroEgresados.html">Editar perfil</a>
                  <?php if ($cv): ?><a class="button btn--ghost" href="<?php echo htmlspecialchars($cv); ?>" target="_blank">Ver CV</a><?php endif; ?>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--center">
          <h2>Publicaciones</h2>
          <div id="feed" class="feed"></div>
          <div id="feed-sentinel" class="sentinel"></div>
        </section>
      </div>
    </div>
  </div>

  <footer class="footer"><p>&copy; 2025 Uniempleo</p></footer>
  <script>
    (function(){
      const toggle = document.getElementById('menuToggle');
      const backdrop = document.getElementById('backdrop');
      const body = document.body;
      if (toggle) toggle.addEventListener('click', () => body.classList.toggle('sidebar-open'));
      if (backdrop) backdrop.addEventListener('click', () => body.classList.remove('sidebar-open'));
    })();
    // Feed infinito (perfil)
    (function(){
      const feedEl = document.getElementById('feed');
      const sentinel = document.getElementById('feed-sentinel');
      if (!feedEl || !sentinel) return;
      let page = 0;
      let loading = false;
      async function loadPage(){
        if (loading) return; loading = true;
        try {
          const res = await fetch('../Api/feed_api.php?page=' + page + '&limit=10', { cache: 'no-store' });
          const json = await res.json();
          (json.items || []).forEach(renderItem);
          page += 1;
        } catch (e) { console.error('feed error', e); }
        loading = false;
      }
      function renderItem(it){
        const div = document.createElement('div');
        div.className = 'feed-item feed-item--' + (it.type || 'post');
        if (it.type === 'vacante') {
          div.innerHTML = `
            <div class="title">${escapeHtml(it.title)}</div>
            <div class="meta">Empresa: ${escapeHtml(it.empresa || '—')} · ${escapeHtml(it.ubicacion || '—')} · ${escapeHtml(it.tipo || '—')}</div>
            <p>${escapeHtml(it.desc || '').slice(0, 220)}...</p>
          `;
        } else if (it.type === 'news') {
          div.innerHTML = `
            <div class="title"><a href="${escapeAttr(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a></div>
            <div class="meta">${escapeHtml(it.source || 'Noticia')} · ${formatDate(it.date)}</div>
          `;
        } else if (it.type === 'video') {
          const iframe = it.videoId ? 
            `<iframe src="https://www.youtube.com/embed/${escapeAttr(it.videoId)}" frameborder="0" allowfullscreen></iframe>` :
            `<iframe src="${escapeAttr(it.url || '')}" frameborder="0" allowfullscreen></iframe>`;
          div.innerHTML = `
            <div class="title">${escapeHtml(it.title || 'Video')}</div>
            <div class="meta">Publicado por: ${escapeHtml(it.publisher || '')} ${it.date ? '· ' + formatDate(it.date) : ''}</div>
            <div style="aspect-ratio:16/9;">${iframe}</div>
          `;
        }
        feedEl.appendChild(div);
      }
      function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
      function escapeAttr(s){ return escapeHtml(s); }
      function formatDate(d){ try { const dt = new Date(d); return dt.toLocaleString('es-CO'); } catch(e){ return ''; } }
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) loadPage(); });
      });
      io.observe(sentinel);
      loadPage();
    })();
  </script>
  <?php include __DIR__ . '/components/messages_widget.php'; ?>
</body>
</html>