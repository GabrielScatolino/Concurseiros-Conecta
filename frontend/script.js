const App = (() => {

  const historico = [];

  const USUARIO_LOGADO_KEY = 'usuario_logado_id';

  function setUsuarioLogado(id) {
    localStorage.setItem(USUARIO_LOGADO_KEY, id);
  }

  function getUsuarioLogado() {
    return localStorage.getItem(USUARIO_LOGADO_KEY);
  }

  function limparUsuarioLogado() {
    localStorage.removeItem(USUARIO_LOGADO_KEY);
  }

  const TELAS = {
    login: 'tela_login',
    cadastro: 'tela_cadastro',
    recuperar_senha: 'tela_senha',
    confirmacao: 'tela_confirmacao',
    home: 'tela_home',
    cadastrar_concurso: 'tela_cadastrar_concurso',
    concursos: 'tela_concursos',
    buscar: 'tela_buscar',
    editar_concurso: 'tela_editar_concurso',
    configuracoes: 'tela_configuracoes',
    perfil: 'tela_perfil',
    edicao: 'tela_edicao',
  };

  const NAV_CONFIG = {
    home: 'nav-home',
    cadastrar_concurso: 'nav-home',
    concursos: 'nav-conexoes',
    buscar: 'nav-buscar',
    configuracoes: 'nav-configuracoes',
    perfil: 'nav-configuracoes',
    edicao: 'nav-configuracoes',
  };

  const bottomNav = () => document.getElementById('bottom-nav');
  const viewport = () => document.getElementById('app-viewport');

  function ir(nomeTela) {
    const idAlvo = TELAS[nomeTela];
    if (!idAlvo) { console.warn(`[App] Tela desconhecida: "${nomeTela}"`); return; }

    // Desativa todas as telas
    document.querySelectorAll('.tela').forEach(el => el.classList.remove('ativa'));

    // Ativa a tela destino
    const telaEl = document.getElementById(idAlvo);
    if (!telaEl) { console.warn(`[App] #${idAlvo} não encontrado`); return; }
    telaEl.classList.add('ativa');

    // Carrega dados do usuário ao entrar nas telas de perfil/edição
    if (nomeTela === 'perfil' || nomeTela === 'edicao') {
      carregarDadosUsuario(nomeTela);
    }

    // Gerencia bottom-nav
    const nav = bottomNav();
    if (NAV_CONFIG[nomeTela]) {
      nav.classList.add('visivel');
      // Remove ativo de todos os botões nav
      nav.querySelectorAll('button').forEach(b => b.classList.remove('nav-ativo'));
      // Ativa o botão correto
      const ativoBtn = document.getElementById(NAV_CONFIG[nomeTela]);
      if (ativoBtn) ativoBtn.classList.add('nav-ativo');
    } else {
      nav.classList.remove('visivel');
    }

    // Histórico
    if (historico[historico.length - 1] !== nomeTela) historico.push(nomeTela);

    // Rola viewport ao topo
    const vp = viewport();
    if (vp) vp.scrollTop = 0;
  }

  function voltar() {
    historico.pop();
    const anterior = historico.pop() || 'login';
    ir(anterior);
  }

  function logout() {
    if (!confirm('Deseja sair da sua conta?')) return;
    limparUsuarioLogado();
    historico.length = 0;
    ir('login');
  }

  // ── Handlers de formulários ──────────────────────────────────
  function maskCPF(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
  }

  // 1. CADASTRAR Usuário (Create)
  async function cadastrarUsuario() {
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const cpf = document.getElementById('cad-cpf').value.replace(/\D/g, '');
    const senha = document.getElementById('cad-senha').value;
    const confirmar = document.getElementById('cad-confirmar').value;

    if (!nome || !email || !cpf || !senha || !confirmar) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmar) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, email, password: senha, cpf }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao cadastrar usuário.');
      }

      alert('Conta criada com sucesso! Faça login para continuar.');
      ir('login');
    } catch (erro) {
      alert(erro.message);
    }
  }

  // 2. "LOGIN" temporário, baseado em getAllUsers + filtro por e-mail
  async function login() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
      alert('Informe e-mail e senha.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/users');
      const usuarios = await resposta.json();

      if (!resposta.ok) {
        throw new Error(usuarios.error || 'Erro ao buscar usuários.');
      }

      const usuarioEncontrado = usuarios.find(u => u.email === email);

      if (!usuarioEncontrado) {
        alert('E-mail ou senha inválidos.');
        return;
      }

      // ⚠️ Sem validação real de senha até existir uma rota de login no back-end
      setUsuarioLogado(usuarioEncontrado.id_usuario);
      ir('home');
    } catch (erro) {
      alert(erro.message);
    }
  }

  // 3. CARREGAR dados do usuário logado (usado em perfil e edição)
  async function carregarDadosUsuario(nomeTela) {
    const id = getUsuarioLogado();
    if (!id) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/users/' + id);
      const usuario = await resposta.json();

      if (!resposta.ok) {
        throw new Error(usuario.error || 'Erro ao carregar dados do usuário.');
      }

      if (nomeTela === 'perfil') {
        const nomeEl = document.querySelector('#tela_perfil .nome-usuario');
        const emailEl = document.querySelector('#tela_perfil .email-usuario');
        if (nomeEl) nomeEl.textContent = usuario.nome;
        if (emailEl) emailEl.textContent = usuario.email;
      }

      if (nomeTela === 'edicao') {
        const nomeInput = document.getElementById('editar_nome');
        const emailInput = document.getElementById('editar_email');
        if (nomeInput) nomeInput.value = usuario.nome;
        if (emailInput) emailInput.value = usuario.email;
        // senha não é retornada pelo back-end por segurança; campo fica em branco
      }
    } catch (erro) {
      alert(erro.message);
    }
  }

  // 4. ATUALIZAR Usuário (Update)
  async function salvarEdicaoPerfil() {
    const id = getUsuarioLogado();
    if (!id) {
      alert('Nenhum usuário logado.');
      return;
    }

    const nome = document.getElementById('editar_nome').value.trim();
    const email = document.getElementById('editar_email').value.trim();
    const senha = document.getElementById('editar_senha').value;

    if (!nome || !email) {
      alert('Nome e e-mail são obrigatórios.');
      return;
    }

    const corpo = { name: nome, email };
    if (senha) corpo.password = senha;

    try {
      const resposta = await fetch('http://localhost:3000/api/users/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao atualizar perfil.');
      }

      alert('Perfil atualizado com sucesso!');
      ir('perfil');
    } catch (erro) {
      alert(erro.message);
    }
  }

  // 5. EXCLUIR Usuário (Delete) — ainda sem botão na tela, função pronta pra usar
  async function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/users/' + id, {
        method: 'DELETE',
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao excluir usuário.');
      }

      alert('Conta excluída com sucesso!');
      limparUsuarioLogado();
      historico.length = 0;
      ir('login');
    } catch (erro) {
      alert(erro.message);
    }
  }


  async function cadastrarConcurso(e) {
    e.preventDefault();
    const cargo = document.getElementById('cargo').value.trim();
    const banca = document.getElementById('banca').value.trim();
    const local = document.getElementById('local').value.trim();
    const urlEdital = document.getElementById('url_edital').value.trim();
    const dataProva = document.getElementById('data_prova').value;

    console.log('[Cadastrar Concurso] Dados do formulário:', { cargo, id_banca: banca, local, url_edital: urlEdital, data: dataProva });

    if (!cargo || !banca || !local || !dataProva || !urlEdital) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const body = { cargo, id_banca: banca, local, url_edital: urlEdital, data: dataProva };
      console.log('[Cadastrar Concurso] Enviando POST /api/concursos:', body);

      const resposta = await fetch('http://localhost:3000/api/concursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('[Cadastrar Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Cadastrar Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao cadastrar concurso.');
      }

      alert('Concurso cadastrado com sucesso!');
      document.getElementById('form-concurso').reset();
      ir('home');
    } catch (erro) {
      console.error('[Cadastrar Concurso] Erro:', erro.message);
      alert(erro.message);
    }
  }

  async function verTodosConcursos() {
    console.log('[Listar Concursos] Buscando todos os concursos...');
    try {
      const resposta = await fetch('http://localhost:3000/api/concursos');
      console.log('[Listar Concursos] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Listar Concursos] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao buscar concursos.');
      }

      if (!dados.length) {
        alert('Nenhum concurso cadastrado.');
        return;
      }

      renderizarConcursos(dados);
      alert(dados.length + ' concurso(s) encontrado(s).');
    } catch (erro) {
      alert(erro.message);
    }
  }

  async function excluirConcurso(id) {
    console.log('[Excluir Concurso] ID recebido:', id);
    if (!confirm('Deseja realmente excluir este concurso?')) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/concursos/' + id, {
        method: 'DELETE',
      });

      console.log('[Excluir Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Excluir Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao excluir concurso.');
      }

      alert('Concurso excluído com sucesso!');

      const botaoExcluir = document.querySelector('.btn-excluir[data-id="' + id + '"]');
      const card = botaoExcluir ? botaoExcluir.closest('.concurso-card') : null;
      if (card) card.remove();
    } catch (erro) {
      alert(erro.message);
    }
  }

  function renderizarConcursos(concursos) {
    const container = document.getElementById('concursos-container');
    container.innerHTML = '';

    concursos.forEach(function (concurso) {
      const card = document.createElement('div');
      card.className = 'concurso-card';

      card.innerHTML = `
        <h3>${concurso.cargo}</h3>
        <p><strong>ID:</strong> ${concurso.id_concurso}</p>
        <p><strong>Banca:</strong> ${concurso.bancaRef ? concurso.bancaRef.nome : 'N/A'}</p>
        <p><strong>Local:</strong> ${concurso.local || 'N/A'}</p>
        <p><strong>Data:</strong> ${concurso.data ? new Date(concurso.data).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>Edital:</strong> ${concurso.url_edital ? '<a href="' + concurso.url_edital + '" target="_blank">Link</a>' : 'N/A'}</p>
        <div class="card-acoes">
          <button type="button" class="btn-editar" data-id="${concurso.id_concurso}">Editar</button>
          <button type="button" class="btn-excluir" data-id="${concurso.id_concurso}">Excluir</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function buscar(e) {
    e.preventDefault();
    const termo = document.getElementById('campo-busca').value.trim();
    if (!termo) return;
    alert(`Buscando por: "${termo}"`);
  }

  async function buscarConcursoPorId() {
    const id = document.getElementById('input-busca-id').value.trim();

    console.log('[Buscar Concurso] ID digitado:', id);

    if (!id) {
      alert('Informe o ID do concurso.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/concursos/' + id);
      console.log('[Buscar Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Buscar Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Concurso não encontrado.');
      }

      renderizarConcursos([dados]);
      alert('Concurso encontrado!');
    } catch (erro) {
      alert(erro.message);
    }
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    const id = document.getElementById('editar_id_concurso').value.trim();
    const cargo = document.getElementById('editar_cargo').value.trim();
    const banca = document.getElementById('editar_banca').value.trim();
    const local = document.getElementById('editar_local').value.trim();
    const urlEdital = document.getElementById('editar_url_edital').value.trim();
    const dataProva = document.getElementById('editar_data_prova').value;

    if (!cargo || !banca || !local || !dataProva || !urlEdital) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/concursos/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargo,
          id_banca: banca,
          local,
          url_edital: urlEdital,
          data: dataProva,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao salvar alterações.');
      }

      alert('Concurso atualizado com sucesso!');
      ir('concursos');
    } catch (erro) {
      alert(erro.message);
    }
  }

  // ── Init ─────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    ir('login');
    console.log('[App] Concurseiros Conecta iniciado.');

    const btnVerTodos = document.getElementById('btn-ver-todos');
    const btnBuscarId = document.getElementById('btn-buscar-id');

    if (btnVerTodos) {
      btnVerTodos.addEventListener('click', verTodosConcursos);
    }

    if (btnBuscarId) {
      btnBuscarId.addEventListener('click', buscarConcursoPorId);
    }

    document.addEventListener('click', function (evento) {
      if (evento.target.classList.contains('btn-excluir')) {
        const id = evento.target.getAttribute('data-id');
        if (id) excluirConcurso(id);
      }
    });

    document.addEventListener('click', function (evento) {
      if (evento.target.classList.contains('btn-editar')) {
        const id = evento.target.getAttribute('data-id');
        if (id) {
          document.getElementById('editar_id_concurso').value = id;
          ir('editar_concurso');
        }
      }
    });
  });

 return {
  ir, voltar, logout,
  cadastrarConcurso, buscar, verTodosConcursos, buscarConcursoPorId, excluirConcurso, salvarEdicao,
  login, cadastrarUsuario, salvarEdicaoPerfil, excluirUsuario, maskCPF, getUsuarioLogado
};
})();