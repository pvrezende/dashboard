document.getElementById("cadastroProjetoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = e.target.nome.value;
  const lider = e.target.lider.value;
  const equipe = e.target.equipe.value.split(',').map(p => p.trim());
  const etapa_atual = parseInt(e.target.etapa_atual.value);

  const res = await fetch('/api/projetos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, lider, equipe, etapa_atual })
  });

  const statusMsg = document.getElementById("statusMsg");
  if (res.ok) {
    statusMsg.textContent = "Projeto cadastrado com sucesso!";
    e.target.reset();
  } else {
    statusMsg.textContent = "Erro ao salvar projeto.";
  }
});
