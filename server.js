require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Conexão com banco
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'producao'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Endpoint para gerar o relatório
app.get('/api/report', (req, res) => {
    // Para simplificar, vamos buscar todos os dados e fazer os cálculos aqui.
    // Em um cenário real, você pode querer filtrar por data ou outros critérios.

    const sql = `
        SELECT
            (SELECT meta_pecas FROM meta_dia ORDER BY data_registro DESC LIMIT 1) AS meta,
            SUM(pecas_produzidas) AS total_pecas_produzidas,
            SUM(pecas_aprovadas) AS total_pecas_aprovadas,
            SUM(pecas_reprovadas) AS total_pecas_reprovadas
        FROM dados_hora_a_hora;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados para o relatório:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados para o relatório' });
        }

        const data = results[0];

        const meta = data.meta || 0;
        const pecasProduzidas = data.total_pecas_produzidas || 0;
        const totalAprovados = data.total_pecas_aprovadas || 0;
        const totalReprovados = data.total_pecas_reprovadas || 0;

        // Calculate percentages
        const percentAprovados = pecasProduzidas > 0 ? (totalAprovados / pecasProduzidas) * 100 : 0;
        const percentReprovados = pecasProduzidas > 0 ? (totalReprovados / pecasProduzidas) * 100 : 0;

        res.json({
            meta,
            pecasProduzidas,
            totalAprovados,
            percentAprovados,
            totalReprovados,
            percentReprovados
        });
    });
});

// Endpoint: Indicadores
app.get('/api/indicadores', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const date = req.query.date || today;

  const sql = `
    SELECT 
      (SELECT SUM(meta) FROM meta_dia WHERE DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) = ?) AS meta_dia,
      (SELECT SUM(qtd_dados) * 12 FROM dados_hora_a_hora WHERE DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) = ?) AS total_produzido,
      (SELECT SUM(qtd) FROM eficiencia WHERE flag = 'produtiva' AND DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) = ?) AS total_aprovados,
      (SELECT SUM(qtd) FROM eficiencia WHERE flag = 'rejeitada' AND DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) = ?) AS total_reprovados
  `;

  db.query(sql, [date, date, date, date], (err, results) => {
    if (err) {
      console.error('Erro ao buscar indicadores:', err);
      return res.status(500).json({ error: 'Erro ao buscar dados do banco de dados', details: err.message });
    }

    if (results.length > 0) {
      const data = results[0];
      const indicadores = {
        meta: data.meta_dia || 0,
        total_produzido: data.total_produzido || 0,
        total_aprovados: data.total_aprovados || 0,
        total_reprovados: data.total_reprovados || 0,
        horas_trabalhadas: 10,
        horas_paradas: 0.5
      };
      res.json(indicadores);
    } else {
      res.status(404).json({ message: 'Nenhum dado encontrado para a data especificada.' });
    }
  });
});

// Endpoint: Produção hora a hora
app.get('/api/producao_horaria', (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  const sql = `
    SELECT 
      HOUR(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) AS hora,
      SUM(qtd_dados) AS quantidade
    FROM dados_hora_a_hora
    WHERE DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) = ?
    GROUP BY hora
    ORDER BY hora
  `;

  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produção horária:', err);
      return res.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
    }

    res.json(results);
  });
});



// Relatório entre datas
app.get('/api/relatorio', (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) {
        return res.status(400).json({ error: 'Datas "start" e "end" são obrigatórias.' });
    }

    const sql = `
        SELECT 
            SUM(CASE WHEN flag = 'produtiva' THEN qtd ELSE 0 END) AS total_aprovados,
            SUM(CASE WHEN flag = 'rejeitada' THEN qtd ELSE 0 END) AS total_reprovados,
            (SELECT SUM(qtd_dados) * 12 FROM dados_hora_a_hora 
                WHERE DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) BETWEEN ? AND ?) AS total_produzido
        FROM eficiencia
        WHERE DATE(STR_TO_DATE(data_hora, '%d/%m/%Y %H:%i:%s')) BETWEEN ? AND ?
    `;

    db.query(sql, [start, end, start, end], (err, results) => {
        if (err) {
            console.error('Erro no relatório:', err);
            return res.status(500).json({ error: 'Erro ao buscar dados do relatório.' });
        }
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'Nenhum dado encontrado para o período especificado.' });
        }
    });
});

// ========================
// CRUD de Projetos
// ========================

// Criar projeto
app.post('/api/projetos', (req, res) => {
  const { nome, lider, equipe } = req.body;
  if (!nome || !lider || !Array.isArray(equipe)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const sql = 'INSERT INTO projetos (nome, lider, equipe_json) VALUES (?, ?, ?)';
  db.query(sql, [nome, lider, JSON.stringify(equipe)], (err, result) => {
    if (err) {
      console.error('Erro ao inserir projeto:', err);
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }
    res.status(200).json({ message: 'Projeto cadastrado com sucesso' });
  });
});

// Ler projetos
    app.get('/api/projetos', (req, res) => {
    db.query('SELECT id, nome, lider, equipe_json, etapa_atual FROM projetos', (err, results) => {
        if (err) {
        console.error('Erro ao buscar projetos:', err);
        return res.status(500).json({ error: 'Erro ao buscar projetos' });
        }
        res.json(results);
    });
    });

// Atualizar projeto
app.put('/api/projetos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, lider, equipe, etapa_atual } = req.body;

  if (!nome || !lider || !Array.isArray(equipe) || isNaN(etapa_atual)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const sql = `
    UPDATE projetos 
    SET nome = ?, lider = ?, equipe_json = ?, etapa_atual = ?
    WHERE id = ?
  `;

  db.query(sql, [nome, lider, JSON.stringify(equipe), etapa_atual, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar projeto:', err);
      return res.status(500).json({ error: 'Erro ao atualizar projeto' });
    }

    res.json({ message: 'Projeto atualizado com sucesso' });
  });
});



// Deletar projeto
app.delete('/api/projetos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM projetos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir projeto:', err);
      return res.status(500).json({ error: 'Erro ao excluir projeto' });
    }
    res.json({ message: 'Projeto excluído com sucesso' });
  });
});

// ========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
