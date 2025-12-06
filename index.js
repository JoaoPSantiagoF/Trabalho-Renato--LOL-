const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "segredo123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 },
  })
);

// Banco em memória
let equipes = [];
let jogadores = [];

// Middleware de proteção
function proteger(req, res, next) {
  if (!req.session.logado) {
    return res.redirect("/");
  }
  next();
}

// Tela de login
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

// Login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === "admin" && senha === "123") {
    req.session.logado = true;
    const agora = new Date().toLocaleString("pt-BR");
    res.cookie("ultimoAcesso", agora);
    return res.redirect("/menu");
  }

  res.send(`<h3>Login inválido!</h3><a href='/'>Voltar</a>`);
});

// Menu
app.get("/menu", proteger, (req, res) => {
  const ultimo = req.cookies.ultimoAcesso || "Primeiro acesso";

  res.send(`
    <h1>Menu do Sistema - Campeonato de LoL</h1>
    <p><strong>Último acesso:</strong> ${ultimo}</p>

    <button onclick="location.href='/cadastro-equipe'">Cadastro de Equipes</button><br><br>
    <button onclick="location.href='/cadastro-jogador'">Cadastro de Jogadores</button><br><br>
    <button onclick="location.href='/logout'">Logout</button>
  `);
});

// Cadastro de equipe
app.get("/cadastro-equipe", proteger, (req, res) => {
  res.send(`
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #999;
        padding: 8px;
        text-align: left;
      }
      th {
        background: #f2f2f2;
      }
      h4 {
        margin-bottom: 5px;
        margin-top: 20px;
      }
    </style>

    <h2>Cadastrar Equipe</h2>

    <form id="formEquipe" method="POST" action="/cadastro-equipe">
      <label>Nome da equipe:</label><br>
      <input type="text" id="nomeEquipe" name="nome"><br><br>

      <label>Nome do capitão:</label><br>
      <input type="text" id="capitao" name="capitao"><br><br>

      <label>Telefone/WhatsApp:</label><br>
      <input type="text" id="contato" name="contato"><br><br>

      <button type="submit">Cadastrar</button>
    </form>

    <script src="/validacao.js"></script>

    <hr>
    <h3>Equipes cadastradas</h3>

    <table>
      <tr>
        <th>Nome da Equipe</th>
        <th>Capitão</th>
        <th>Contato</th>
      </tr>

      ${
        equipes.length === 0
          ? `
          <tr>
            <td colspan="3" style="text-align:center;">Nenhuma equipe cadastrada.</td>
          </tr>
        `
          : equipes
              .map(
                e => `
          <tr>
            <td>${e.nome}</td>
            <td>${e.capitao}</td>
            <td>${e.contato}</td>
          </tr>
        `
              )
              .join("")
      }
    </table>

    <br><button onclick="location.href='/menu'">Voltar ao menu</button>
  `);
});

// Receber equipe (SEM validação)
app.post("/cadastro-equipe", proteger, (req, res) => {
  const { nome, capitao, contato } = req.body;

  equipes.push({ nome, capitao, contato });

  res.redirect("/cadastro-equipe");
});

// Cadastro de jogador
app.get("/cadastro-jogador", proteger, (req, res) => {
  if (equipes.length === 0) {
    return res.send(`
      <h3>Cadastre ao menos uma equipe antes de cadastrar jogadores.</h3>
      <button onclick="location.href='/menu'">Voltar ao menu</button>
    `);
  }

  res.send(`
    <h2>Cadastrar Jogador</h2>

    <form id="formJogador" method="POST" action="/cadastro-jogador">
      <label>Nome do jogador:</label><br>
      <input type="text" id="nomeJogador" name="nomeJogador"><br><br>

      <label>Nickname:</label><br>
      <input type="text" id="nick" name="nick"><br><br>

      <label>Função:</label><br>
      <select id="funcao" name="funcao">
        <option value="">Selecione</option>
        <option value="top">Top</option>
        <option value="jungle">Jungle</option>
        <option value="mid">Mid</option>
        <option value="atirador">Atirador</option>
        <option value="suporte">Suporte</option>
      </select><br><br>

      <label>Elo:</label><br>
      <input type="text" id="elo" name="elo"><br><br>

      <label>Gênero:</label><br>
      <select id="genero" name="genero">
        <option value="">Selecione</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select><br><br>

      <label>Equipe:</label><br>
      <select id="equipe" name="equipe">
        ${equipes.map(e => `<option value="${e.nome}">${e.nome}</option>`).join("")}
      </select><br><br>

      <button type="submit">Cadastrar</button>
    </form>

    <script src="/validacao.js"></script>

    <hr>
    <h3>Jogadores cadastrados</h3>

    ${agrupaJogadoresPorEquipe()}

    <br><button onclick="location.href='/menu'">Voltar ao menu</button>
  `);
});

// Receber jogador (SEM validação)
app.post("/cadastro-jogador", proteger, (req, res) => {
  const { nomeJogador, nick, funcao, elo, genero, equipe } = req.body;

  jogadores.push({ nomeJogador, nick, funcao, elo, genero, equipe });

  res.redirect("/cadastro-jogador");
});

// Agrupar jogadores por equipe
function agrupaJogadoresPorEquipe() {
  let html = "";

  equipes.forEach(eq => {
    html += `
      <h4>Equipe: ${eq.nome}</h4>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr>
          <th>Jogador</th>
          <th>Nickname</th>
          <th>Função</th>
          <th>Elo</th>
          <th>Gênero</th>
        </tr>
    `;

    let j = jogadores.filter(j => j.equipe === eq.nome);

    if (j.length === 0) {
      html += `
        <tr>
          <td colspan="5" style="text-align:center;">Nenhum jogador cadastrado.</td>
        </tr>
      `;
    } else {
      j.forEach(x => {
        html += `
          <tr>
            <td>${x.nomeJogador}</td>
            <td>${x.nick}</td>
            <td>${x.funcao}</td>
            <td>${x.elo}</td>
            <td>${x.genero}</td>
          </tr>
        `;
      });
    }

    html += `</table><br>`;
  });

  return html;
}

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Porta
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Servidor rodando na porta " + port);
});
