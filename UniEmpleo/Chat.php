<?php
require_once __DIR__ . '/auth.php';
start_secure_session();

$isEmpresa = isset($_SESSION['empresa_id']);
$isEgresado = isset($_SESSION['correo']);
if (!$isEmpresa && !$isEgresado) { if (!headers_sent()) header('Location: LoginEgresados.php?redirect=1'); else echo '<script>location.href="LoginEgresados.php?redirect=1"</script>'; exit; }

$tipo = $isEmpresa ? 'empresa' : 'egresado';
$nombreUsuario = '';
$userId = 0;
$conn = mysqli_connect('localhost','root','','uniempleo');
if ($conn) {
  if ($tipo==='empresa') {
    $userId = (int)($_SESSION['empresa_id'] ?? 0);
    $res = mysqli_query($conn, "SELECT nombre FROM empresas WHERE id=".$userId." LIMIT 1");
    if ($res && $row = mysqli_fetch_assoc($res)) { $nombreUsuario = $row['nombre']; }
  } else {
    $correo = $_SESSION['correo'] ?? '';
    $stmt = mysqli_prepare($conn, "SELECT id, nombre FROM egresados WHERE correo = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, 's', $correo);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    if ($res && $row = mysqli_fetch_assoc($res)) { $userId = (int)$row['id']; $nombreUsuario = $row['nombre']; }
    mysqli_stmt_close($stmt);
  }
  mysqli_close($conn);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Chat</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    <h1>Chat · <?php echo htmlspecialchars($nombreUsuario); ?></h1>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3><?php echo $tipo==='empresa' ? 'Empresa' : 'Egresado'; ?></h3>
      <div class="menu">
        <?php if ($tipo==='empresa'): ?>
          <a href="DashboardEmpresa.php">Inicio Empresa</a>
          <a href="PublicarVacante.php">Publicar Vacante</a>
          <a href="MisVacantes.php">Mis Vacantes</a>
          <a href="Chat.php" class="active">Chat</a>
          <a href="logout.php">Salir</a>
        <?php else: ?>
          <a href="BuscarVacantes.php">Buscar Vacantes</a>
          <a href="Vacantes.php">Ver Vacantes</a>
          <a href="PerfilEgresado.php">Mi Perfil</a>
          <a href="Chat.php" class="active">Chat</a>
          <a href="RegistroEgresados.html">Actualizar Perfil</a>
          <a href="logout.php">Salir</a>
        <?php endif; ?>
      </div>
    </aside>

    <div class="content">
      <section class="chat">
        <div class="chat-sidebar">
          <div class="chat-actions">
            <input id="searchInput" type="text" placeholder="Buscar empresas o personas">
            <button class="button" id="newConvBtn">Nueva conversación</button>
          </div>
          <div class="chat-results" id="searchResults" style="display:none;"></div>
          <h3 style="margin-top:10px;">Conversaciones</h3>
          <div class="chat-conversations" id="conversationList"></div>
        </div>
        <div class="chat-main">
          <div class="chat-header" id="chatHeader">Selecciona una conversación</div>
          <div class="chat-messages" id="messageList"></div>
          <div class="chat-input">
            <input id="msgInput" type="text" placeholder="Escribe un mensaje" />
            <button class="button" id="sendBtn">Enviar</button>
          </div>
        </div>
      </section>
    </div>
  </div>

  <footer class="footer">
    <p>&copy; 2025 Uniempleo</p>
  </footer>

  <script>
    (function(){
      const toggle = document.getElementById('menuToggle');
      const backdrop = document.getElementById('backdrop');
      const body = document.body;
      if (toggle) toggle.addEventListener('click', () => body.classList.toggle('sidebar-open'));
      if (backdrop) backdrop.addEventListener('click', () => body.classList.remove('sidebar-open'));
    })();

    const api = async (action, data={}) => {
      const fd = new FormData(); fd.append('action', action);
      Object.keys(data).forEach(k => fd.append(k, data[k]));
      const res = await fetch('chat_api.php', { method:'POST', body: fd });
      return res.json();
    };

    let currentConversation = null;

    async function loadConversations(){
      const res = await fetch('chat_api.php?action=list_conversations');
      const data = await res.json();
      const cont = document.getElementById('conversationList');
      cont.innerHTML = '';
      (data.conversations||[]).forEach(c => {
        const div = document.createElement('div');
        div.className = 'conv-item';
        const otherName = c.other ? (c.other.name + (c.other.type==='empresa'?' · Empresa':' · Persona')) : 'Desconocido';
        const last = c.last ? c.last.body : '';
        div.innerHTML = `<strong>${otherName}</strong><br><span>${last}</span>`;
        div.addEventListener('click',()=>openConversation(c.id, c.other));
        cont.appendChild(div);
      });
    }

    async function openConversation(id, other){
      currentConversation = id;
      document.getElementById('chatHeader').textContent = other ? `${other.name} (${other.type})` : 'Chat';
      await loadMessages();
    }

    async function loadMessages(){
      if (!currentConversation) return;
      const res = await fetch('chat_api.php?action=fetch_messages&conversation_id='+currentConversation);
      const data = await res.json();
      const list = document.getElementById('messageList');
      list.innerHTML = '';
      (data.messages||[]).forEach(m => {
        const el = document.createElement('div');
        el.className = 'msg '+(m.sender_type);
        el.innerHTML = `<span class="meta">${m.sender_type}</span><p>${m.body}</p>`;
        list.appendChild(el);
      });
      list.scrollTop = list.scrollHeight;
    }

    async function sendMsg(){
      const inp = document.getElementById('msgInput');
      const body = inp.value.trim();
      if (!currentConversation || !body) return;
      const r = await api('send_message',{ conversation_id: currentConversation, body });
      if (r && r.ok){ inp.value=''; loadMessages(); }
    }

    document.getElementById('sendBtn').addEventListener('click', sendMsg);
    document.getElementById('msgInput').addEventListener('keypress', e => { if (e.key==='Enter') sendMsg(); });

    async function searchParticipants(q){
      const res = await fetch('chat_api.php?action=search_participants&q='+encodeURIComponent(q||''));
      const data = await res.json();
      const box = document.getElementById('searchResults');
      box.style.display = 'block';
      box.innerHTML = '<h4>Empresas</h4>';
      (data.empresas||[]).forEach(e => {
        const b = document.createElement('button'); b.className='btn-link'; b.textContent = e.nombre; b.onclick = ()=>startConv('empresa', e.id);
        box.appendChild(b);
      });
      box.innerHTML += '<h4>Personas</h4>';
      (data.personas||[]).forEach(p => {
        const b = document.createElement('button'); b.className='btn-link'; b.textContent = p.nombre; b.onclick = ()=>startConv('egresado', p.id);
        box.appendChild(b);
      });
    }

    async function startConv(type, id){
      const r = await api('start_conversation',{ target_type:type, target_id:id });
      if (r && r.ok){
        document.getElementById('searchResults').style.display='none';
        await loadConversations();
        // Abrir la última conversación (recién creada)
        openConversation(r.conversation_id, null);
      }
    }

    document.getElementById('newConvBtn').addEventListener('click',()=>{
      const q = document.getElementById('searchInput').value.trim();
      searchParticipants(q);
    });

    // Polling
    setInterval(()=>{ loadMessages(); }, 3000);

    loadConversations();
  </script>
</body>
</html>