const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "segredo123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 },
  })
);

//Banco de dados em memória
let equipes = []; 
let jogadores = []; 

//Middlewares
function proteger(req, res, next) {
  if (!req.session.logado) {
    return res.redirect("/");
  }
  next();
}

//Tela de login
app.get("/", (req, res) => {
  res.send(`
    <h2>Login do Sistema - Campeonato LoL</h2>
    <form method="POST" action="/login">
        <label>Usuário:</label><br>
        <input type="text" name="usuario"><br><br>

        <label>Senha:</label><br>
        <input type="password" name="senha"><br><br>

        <button type="submit">Entrar</button>
    </form>
  `);
});

//Carregar login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === "admin" && senha === "123") {
    req.session.logado = true;
    const agora = new Date().toLocaleString("pt-BR");
    res.cookie("ultimoAcesso", agora);
    res.redirect("/menu");
  } else {
    res.send("<h3>Usuário ou senha inválidos.</h3><a href='/'>Tentar novamente</a>");
  }
});

//Menu principal
app.get("/menu", proteger, (req, res) => {
  const ultimo = req.cookies.ultimoAcesso || "Primeiro acesso";

  res.send(`
    <h1>Menu do Sistema - Campeonato de LoL</h1>
    <p><strong>Último acesso:</strong> ${ultimo}</p>

    <a href="/cadastro-equipe">Cadastro de Equipes</a><br><br>
    <a href="/cadastro-jogador">Cadastro de Jogadores</a><br><br>
    <a href="/logout">Logout</a>
  `);
});

//Cadastro de equipe
app.get("/cadastro-equipe", proteger, (req, res) => {
  res.send(`
    <h2>Cadastrar Equipe</h2>
    <form method="POST" action="/cadastro-equipe">
      <label>Nome da equipe:</label><br>
      <input type="text" name="nome"><br><br>

      <label>Nome do capitão:</label><br>
      <input type="text" name="capitao"><br><br>

      <label>Telefone/WhatsApp:</label><br>
      <input type="text" name="contato"><br><br>

      <button type="submit">Cadastrar</button>
    </form>

    <hr>
    <h3>Equipes cadastradas</h3>
    <ul>
      ${equipes.map(e => `<li>${e.nome} - Capitão: ${e.capitao} (${e.contato})</li>`).join("")}
    </ul>

    <br><a href="/menu">Voltar ao menu</a>
  `);
});

//Carregar formulário de equipe
app.post("/cadastro-equipe", proteger, (req, res) => {
  const { nome, capitao, contato } = req.body;

  if (!nome || !capitao || !contato) {
    return res.send("<h3>Preencha todos os campos!</h3><a href='/cadastro-equipe'>Voltar</a>");
  }

  equipes.push({ nome, capitao, contato });

  res.redirect("/cadastro-equipe");
});

//Cadastro de jogador
app.get("/cadastro-jogador", proteger, (req, res) => {
  if (equipes.length === 0) {
    return res.send(`
      <h3>Cadastre ao menos uma equipe antes de cadastrar jogadores.</h3>
      <a href="/menu">Voltar ao menu</a>
    `);
  }

  res.send(`
    <h2>Cadastrar Jogador</h2>

    <form method="POST" action="/cadastro-jogador">
      <label>Nome do jogador:</label><br>
      <input type="text" name="nomeJogador"><br><br>

      <label>Nickname:</label><br>
      <input type="text" name="nick"><br><br>

      <label>Função:</label><br>
      <select name="funcao">
        <option value="">Selecione</option>
        <option value="top">top</option>
        <option value="jungle">jungle</option>
        <option value="mid">mid</option>
        <option value="atirador">atirador</option>
        <option value="suporte">suporte</option>
      </select><br><br>

      <label>Elo:</label><br>
      <input type="text" name="elo"><br><br>

      <label>Gênero:</label><br>
      <input type="text" name="genero"><br><br>

      <label>Equipe:</label><br>
      <select name="equipe">
        ${equipes.map(e => `<option value="${e.nome}">${e.nome}</option>`).join("")}
      </select><br><br>

      <button type="submit">Cadastrar</button>
    </form>

    <hr>
    <h3>Jogadores cadastrados</h3>

    ${agrupaJogadoresPorEquipe()}

    <br><a href="/menu">Voltar ao menu</a>
  `);
});

//Carregar formulário de jogador
app.post("/cadastro-jogador", proteger, (req, res) => {
  const { nomeJogador, nick, funcao, elo, genero, equipe } = req.body;

  if (!nomeJogador || !nick || !funcao || !elo || !genero || !equipe) {
    return res.send("<h3>Preencha todos os campos!</h3><a href='/cadastro-jogador'>Voltar</a>");
  }

  jogadores.push({ nomeJogador, nick, funcao, elo, genero, equipe });

  res.redirect("/cadastro-jogador");
});

//Agrupar jogadores por equipe
function agrupaJogadoresPorEquipe() {
  let html = "";

  equipes.forEach(eq => {
    html += `<h4>Equipe: ${eq.nome}</h4><ul>`;

    let j = jogadores.filter(j => j.equipe === eq.nome);

    if (j.length === 0) {
      html += "<li>Nenhum jogador cadastrado.</li>";
    } else {
      j.forEach(x => {
        html += `<li>${x.nomeJogador} (${x.nick}) - ${x.funcao}, Elo: ${x.elo}, Gênero: ${x.genero}</li>`;
      });
    }

    html += "</ul>";
  });

  return html;
}

//Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//Porta
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Servidor rodando na porta " + port);
});
