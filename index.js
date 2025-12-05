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
  }
});

//Menu principal
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

//Cadastro de equipe
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
        <option value="top">Top</option>
        <option value="jungle">Jungle</option>
        <option value="mid">Mid</option>
        <option value="atirador">Atirador</option>
        <option value="suporte">Suporte</option>
      </select><br><br>

      <label>Elo:</label><br>
      <input type="text" name="elo"><br><br>

      <label>Gênero:</label><br>
      <select name="genero">
        <option value="">Selecione</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
        <option value="Outro">Outro</option>
      </select><br><br>
      

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
