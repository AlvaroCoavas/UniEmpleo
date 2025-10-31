<?php
require_once __DIR__ . '/auth.php';
start_secure_session();
$myType = isset($_SESSION['empresa_id']) ? 'empresa' : (isset($_SESSION['correo']) ? 'egresado' : '');
?>
<div id="miniChat" class="mini-chat" aria-live="polite">
  <button id="miniChatToggle" class="mini-chat__toggle" aria-expanded="false" aria-controls="miniChatPanel" title="Mensajes">
    <span class="mini-chat__icon">💬</span>
    <span id="miniChatBadge" class="mini-chat__badge" style="display:none;">0</span>
  </button>
  <div id="miniChatPanel" class="mini-chat__panel" hidden>
    <div class="mini-chat__header">
      <strong>Mensajes</strong>
      <button id="miniChatClose" class="mini-chat__close" aria-label="Cerrar">✕</button>
    </div>

    <div class="mini-chat__tabs">
      <button id="tabConvs" class="mini-chat__tab active">Conversaciones</button>
      <button id="tabUsers" class="mini-chat__tab">Usuarios</button>
    </div>

    <div id="mcConvs" class="mini-chat__convs">
      <div class="mini-chat__list" id="mcConversationList"></div>
    </div>

    <div id="mcUsers" class="mini-chat__users" hidden>
      <div class="mini-chat__search">
        <input type="text" id="mcSearch" placeholder="Buscar empresas o personas" />
        <button class="button" id="mcSearchBtn">Buscar</button>
      </div>
      <div id="mcSearchResults" class="mini-chat__results" hidden></div>
    </div>

    <div class="mini-chat__messages" id="mcMessages"></div>
    <div class="mini-chat__compose" id="mcCompose">
      <input type="text" id="mcInput" placeholder="Escribe un mensaje"/>
      <button class="button" id="mcSend">Enviar</button>
    </div>
  </div>
</div>
<script>
(function(){
  const USER_TYPE = <?php echo json_encode($myType); ?> || '';
  const storeKey = 'miniChatSeen';
  const seen = JSON.parse(localStorage.getItem(storeKey) || '{}');

  const toggleBtn = document.getElementById('miniChatToggle');
  const panel = document.getElementById('miniChatPanel');
  const closeBtn = document.getElementById('miniChatClose');
  const badge = document.getElementById('miniChatBadge');

  const tabConvs = document.getElementById('tabConvs');
  const tabUsers = document.getElementById('tabUsers');
  const convsBox = document.getElementById('mcConvs');
  const usersBox = document.getElementById('mcUsers');

  const convList = document.getElementById('mcConversationList');
  const messagesBox = document.getElementById('mcMessages');
  const composeBox = document.getElementById('mcCompose');
  const input = document.getElementById('mcInput');
  const sendBtn = document.getElementById('mcSend');
  const searchInp = document.getElementById('mcSearch');
  const searchBtn = document.getElementById('mcSearchBtn');
  const searchResults = document.getElementById('mcSearchResults');

  let currentConv = null;
  let messagePoller = null;

  function startMessagePolling(){
    stopMessagePolling();
    messagePoller = setInterval(()=>{
      if (!panel.hidden && tabConvs.classList.contains('active') && currentConv){
        loadMessages();
      }
    }, 1000);
  }

  function stopMessagePolling(){
    if (messagePoller){ clearInterval(messagePoller); messagePoller = null; }
  }

  function setOpen(open){
    panel.hidden = !open;
    panel.style.display = open ? 'grid' : 'none';
    toggleBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('mini-chat-open', !!open);
    if (open) { refreshConversations(); if (tabConvs.classList.contains('active')) startMessagePolling(); }
    else { stopMessagePolling(); }
  }

  // Inicialmente oculto por estilo para evitar conflictos con CSS
  panel.style.display = 'none';
  toggleBtn.addEventListener('click', ()=> setOpen(panel.style.display === 'none' || panel.hidden));
  closeBtn.addEventListener('click', ()=> setOpen(false));

  function setTab(which){
    if (which === 'convs'){
      tabConvs.classList.add('active');
      tabUsers.classList.remove('active');
      panel.classList.remove('users-mode');
      convsBox.hidden = false;
      usersBox.hidden = true;
      messagesBox.hidden = false;
      composeBox.hidden = false;
      startMessagePolling();
    } else {
      tabUsers.classList.add('active');
      tabConvs.classList.remove('active');
      panel.classList.add('users-mode');
      convsBox.hidden = true;
      usersBox.hidden = false;
      messagesBox.hidden = true;
      composeBox.hidden = true;
      stopMessagePolling();
      refreshParticipants();
    }
  }

  tabConvs.addEventListener('click', ()=> setTab('convs'));
  tabUsers.addEventListener('click', ()=> setTab('users'));

  async function api(action, data){
    const fd = new FormData(); fd.append('action', action);
    if (data) Object.keys(data).forEach(k=>fd.append(k, data[k]));
    const r = await fetch('chat_api.php', { method:'POST', body: fd });
    return r.json();
  }

  async function refreshConversations(){
    const r = await fetch('chat_api.php?action=list_conversations');
    const data = await r.json();
    convList.innerHTML = '';
    let unread = 0;
    (data.conversations||[]).forEach(c => {
      const lastId = c.last && c.last.id ? Number(c.last.id) : 0;
      const lastSender = c.last && c.last.sender_type ? String(c.last.sender_type) : '';
      const prev = seen[c.id] ? Number(seen[c.id]) : 0;
      const isNewForMe = lastId > prev && lastSender && USER_TYPE && lastSender !== USER_TYPE;
      if (isNewForMe) unread++;
      const div = document.createElement('div');
      div.className = 'conv-item';
      const otherName = c.other ? (c.other.name + (c.other.type==='empresa'?' · Empresa':' · Persona')) : 'Desconocido';
      const lastBody = c.last ? c.last.body : '';
      div.innerHTML = `<strong>${otherName}</strong><br><span>${lastBody}</span>`;
      if (isNewForMe) div.style.background = '#fff7ed';
      div.onclick = ()=>openConversation(c.id, otherName);
      convList.appendChild(div);
    });
    if (unread > 0){ badge.textContent = unread; badge.style.display = 'inline-flex'; } else { badge.style.display = 'none'; }
  }

  async function openConversation(id){
    currentConv = id;
    await loadMessages();
    startMessagePolling();
    // marcar como visto usando el último mensaje
    const r = await fetch('chat_api.php?action=fetch_messages&conversation_id='+id);
    const data = await r.json();
    const last = (data.messages||[]).slice(-1)[0];
    if (last && last.id){ seen[id] = Number(last.id); localStorage.setItem(storeKey, JSON.stringify(seen)); refreshConversations(); }
  }

  async function loadMessages(){
    if (!currentConv) { messagesBox.innerHTML = '<p style="color:#6b7280;">Selecciona una conversación</p>'; return; }
    const r = await fetch('chat_api.php?action=fetch_messages&conversation_id='+currentConv);
    const data = await r.json();
    messagesBox.innerHTML = '';
    (data.messages||[]).forEach(m => {
      const el = document.createElement('div');
      el.className = 'msg '+m.sender_type;
      el.innerHTML = `<span class='meta'>${m.sender_type}</span><p>${m.body}</p>`;
      messagesBox.appendChild(el);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function send(){
    const body = input.value.trim();
    if (!currentConv || !body) return;
    const r = await api('send_message',{ conversation_id: currentConv, body });
    if (r && r.ok){ input.value=''; loadMessages(); refreshConversations(); }
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keypress', e => { if (e.key==='Enter') send(); });

  function initials(name){
    const parts = String(name||'').trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : '';
    const last = parts.length>1 ? parts[parts.length-1][0] : '';
    return (first+last).toUpperCase();
  }

  async function search(q){
    const r = await fetch('chat_api.php?action=search_participants&q='+encodeURIComponent(q||''));
    const data = await r.json();
    searchResults.hidden = false;
    searchResults.innerHTML = '';

    const empHeader = document.createElement('div');
    empHeader.innerHTML = '<h4>Empresas</h4>';
    searchResults.appendChild(empHeader);
    (data.empresas||[]).forEach(e=>{
      const item = document.createElement('div');
      item.className = 'mini-chat__item';
      item.innerHTML = `<div class="mini-chat__avatar">${initials(e.nombre)}</div>
        <div><div class="mini-chat__item-title">${e.nombre}</div><div class="mini-chat__subtitle">Empresa</div></div>`;
      item.onclick = ()=>startConv('empresa', e.id);
      searchResults.appendChild(item);
    });

    const perHeader = document.createElement('div');
    perHeader.innerHTML = '<h4>Personas</h4>';
    searchResults.appendChild(perHeader);
    (data.personas||[]).forEach(p=>{
      const item = document.createElement('div');
      item.className = 'mini-chat__item';
      item.innerHTML = `<div class="mini-chat__avatar">${initials(p.nombre)}</div>
        <div><div class="mini-chat__item-title">${p.nombre}</div><div class="mini-chat__subtitle">Persona</div></div>`;
      item.onclick = ()=>startConv('egresado', p.id);
      searchResults.appendChild(item);
    });
  }

  function refreshParticipants(){ search(''); }
  searchBtn.addEventListener('click', ()=> search(searchInp.value.trim()));

  async function startConv(type, id){
    const r = await api('start_conversation',{ target_type:type, target_id:id });
    if (r && r.ok){ setTab('convs'); await refreshConversations(); openConversation(r.conversation_id); }
  }

  // Polling para badge y lista de conversaciones
  setInterval(refreshConversations, 4000);
  refreshConversations();
  setTab('convs');
})();
</script>