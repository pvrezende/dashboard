document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("projetosContainer");
  const res = await fetch(`${window.origin}/api/projetos`);
  const projetos = await res.json();

  const etapas = ["Projeto", "Compras", "Usinagem", "Montagem", "Elétrica", "Testes", "Entrega"];

  projetos.forEach(proj => {
    const card = document.createElement("div");
    card.className = "project-card";
    const etapaAtual = parseInt(proj.etapa_atual || 1);

    const stepper = etapas.map((etapa, index) => {
    const stepNum = index + 1;
    const isCompleted = stepNum < etapaAtual;
    const isCurrent = stepNum === etapaAtual;

  return `
    <div class="step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
      <div class="circle">${isCompleted ? '✓' : stepNum}</div>
      <div class="label">${etapa}</div>
    </div>
  `;
}).join('');

    card.innerHTML = `
      <div class="project-name">${proj.nome}</div>
      <div class="stepper">${stepper}</div>
      <div class="actions">
        <button class="details-btn">Detalhes</button>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </div>
    `;

    // Eventos
    card.querySelector(".details-btn").addEventListener("click", () => {
      document.getElementById("project-leader").textContent = proj.lider;
      const equipe = JSON.parse(proj.equipe_json);
      document.getElementById("team-list").innerHTML = equipe.map(p => `<li>${p}</li>`).join('');
      document.getElementById("projectModal").style.display = "block";
    });

    card.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("editId").value = proj.id;
      document.getElementById("editNome").value = proj.nome;
      document.getElementById("editLider").value = proj.lider;
      document.getElementById("editEquipe").value = JSON.parse(proj.equipe_json).join(', ');
      document.getElementById("editEtapa").value = proj.etapa_atual || 1;
      document.getElementById("editModal").style.display = "block";
    });

    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm(`Deseja excluir o projeto '${proj.nome}'?`)) {
        const del = await fetch(`/api/projetos/${proj.id}`, { method: 'DELETE' });
        if (del.ok) location.reload();
        else alert("Erro ao excluir projeto");
      }
    });

    container.appendChild(card);
  });

  // Fechar modais
  document.querySelectorAll(".modal .close").forEach(el => {
    el.onclick = () => el.closest(".modal").style.display = "none";
  });

  window.onclick = e => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  };

  // Formulário edição
  document.getElementById("editForm").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const nome = document.getElementById("editNome").value;
    const lider = document.getElementById("editLider").value;
    const equipe = document.getElementById("editEquipe").value.split(',').map(p => p.trim());
    const etapa_atual = parseInt(document.getElementById("editEtapa").value);

    const res = await fetch(`/api/projetos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, lider, equipe, etapa_atual })
    });

    if (res.ok) {
      alert("Projeto atualizado!");
      window.parent.document.getElementById("iframeTela2").src = "tela2.html";
    } else {
      alert("Erro ao atualizar projeto.");
    }
  });
});
