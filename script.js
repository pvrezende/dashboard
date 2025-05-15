const API_BASE_URL = 'http://localhost:3000/api';
let lastReportData = null;
let productionChart = null;
const pecasPorCaixa = 12;

// Utilidades
function showError(message) {
  let container = document.getElementById('error-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'error-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.padding = '15px';
    container.style.backgroundColor = '#f44336';
    container.style.color = 'white';
    container.style.borderRadius = '5px';
    container.style.zIndex = '1000';
    document.body.appendChild(container);
  }
  container.textContent = message;
  container.style.display = 'block';
  setTimeout(() => container.style.display = 'none', 6000);
}

async function fetchData(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    showError(`Erro ao carregar dados: ${error.message}`);
    return null;
  }
}

// Atualiza relógio
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const dateTimeStr = now.toLocaleDateString('pt-BR', options);
  const dateTimeEl = document.getElementById('currentDateTime');
  if (dateTimeEl) dateTimeEl.textContent = dateTimeStr;
}

// Atualiza indicadores
// Atualiza indicadores
async function updateIndicators(data) {
  if (!data) return;

  const metaDia = data.meta || 0;
  const pecasEstimadas = metaDia * pecasPorCaixa;
  window.metaPecasEstimadas = pecasEstimadas;

  const pecasProduzidas = data.total_produzido || 0;
  const totalReprovados = data.total_reprovados || 0;
  const totalAprovados = pecasProduzidas - totalReprovados;

  let qualidade = 0;
  let reprovadosPercent = 0;

  if (pecasProduzidas > 0) {
    qualidade = (totalAprovados / pecasProduzidas) * 100;
    reprovadosPercent = (totalReprovados / pecasProduzidas) * 100; // Calcule reprovados percent diretamente
  }
  // Se pecasProduzidas for 0, qualidade e reprovadosPercent permanecem 0, o que é o comportamento desejado.

  document.querySelector('.indicator-card:nth-child(1) .value-box').textContent = `${Math.floor(pecasEstimadas / pecasPorCaixa)} cx`;
  document.querySelector('.indicator-card:nth-child(1) .units').textContent = `${pecasEstimadas}`;
  document.querySelector('.indicator-card:nth-child(2) .value-box').textContent = `${Math.floor(pecasProduzidas / pecasPorCaixa)} cx`;
  document.querySelector('.indicator-card:nth-child(2) .units').textContent = `${pecasProduzidas}`;
  document.querySelector('.indicator-card:nth-child(3) .indicator-value').textContent = totalAprovados;
  document.querySelector('.indicator-card:nth-child(4) .indicator-value').textContent = `${qualidade.toFixed(2)}%`;
  document.querySelector('.indicator-card:nth-child(5) .indicator-value').textContent = totalReprovados;
  document.querySelector('.indicator-card:nth-child(6) .indicator-value').textContent = `${reprovadosPercent.toFixed(2)}%`;
}


// Atualiza gráfico de produção
function updateProductionChart(hourlyData) {
  const ctx = document.getElementById('oeeChart').getContext('2d');
  if (!ctx || !hourlyData || hourlyData.length === 0) {
    if (productionChart) {
      productionChart.destroy();
      productionChart = null;
    }
    return;
  }

  if (productionChart) productionChart.destroy();

  // Filtrar dados para incluir apenas horas entre 6 e 16 (inclusive)
  const filteredData = hourlyData.filter(item => item.hora >= 6 && item.hora <= 16);

  const labels = filteredData.map(item => `${item.hora.toString().padStart(2, '0')}:00`);
  const data = filteredData.map(item => item.quantidade);
  const metaPorHora = (window.metaPecasEstimadas || 0) / 12 / 8.3; // Ajuste para meta por hora em caixas (total de peças / 12 horas / 8.3 caixas)
  const metaData = filteredData.map(() => parseFloat(metaPorHora.toFixed(2)));

  productionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Produção',
          data: data,
          backgroundColor: 'rgba(74, 144, 226, 0.2)',
          borderColor: 'rgba(74, 144, 226, 1)',
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgba(74, 144, 226, 1)',
          pointBorderWidth: 2,
          pointRadius: 5,
          fill: true,
          tension: 0.1
        },
        {
          label: 'Meta por Hora',
          data: metaData,
          borderColor: 'orange',
          borderDash: [6, 4],
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: context => context.dataset.label === 'Produção'
              ? ` (${context.parsed.y} cx)`
              : `Meta: ${context.parsed.y.toFixed(2)} cx`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Horário' } },
        y: { beginAtZero: true, title: { display: true, text: 'Quantidade por caixa' } }
      }
    }
  });
}

// Atualiza dados do dashboard
async function updateDashboardData() {
  const selectedDate = document.getElementById('datePicker').value;
  const indicadores = await fetchData('indicadores', { date: selectedDate });
  const producaoHoraria = await fetchData('producao_horaria', { date: selectedDate });
  await updateIndicators(indicadores);
  updateProductionChart(producaoHoraria);
}

// Função para recarregar a página (utilizada pelo botão de atualização)
function refreshDashboard() {
  location.reload();
}

// Funções do modal de relatório
function openModal() {
  document.getElementById('reportModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('reportModal').classList.remove('show');
  document.body.style.overflow = 'auto';
}
// Listener para fechar o modal clicando fora dele
window.onclick = function (event) {
  const modal = document.getElementById('reportModal');
  if (event.target === modal) closeModal();
}

// Funções para gerar e baixar relatório
async function gerarRelatorio() {
  const startInput = document.getElementById('startDate').value;
  const endInput = document.getElementById('endDate').value;
  const reportResultEl = document.getElementById('reportResult');
  const downloadReportBtn = document.getElementById('downloadReport');

  if (!startInput || !endInput) {
    showError('Por favor, selecione as datas de início e fim para o relatório.');
    reportResultEl.textContent = '';
    downloadReportBtn.disabled = true;
    return;
  }

  function formatDateToDDMMYYYY(dateStr) {
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  const startDate = formatDateToDDMMYYYY(startInput);
  const endDate = formatDateToDDMMYYYY(endInput);

  reportResultEl.innerHTML = 'Gerando relatório...';
  downloadReportBtn.disabled = true;

  try {
    const reportData = await fetchData('relatorio', { de: startDate, ate: endDate });

    if (reportData && reportData.length > 0) {
      lastReportData = reportData;

      const totalProduzido = reportData.reduce((sum, r) => sum + (r.total_produzido_periodo || 0), 0);
      const totalReprovado = reportData.reduce((sum, r) => sum + (r.total_reprovado_periodo || 0), 0);
      const totalAprovado = totalProduzido - totalReprovado;

      const html = `
        <div style="text-align: center;">
          <h3 style="margin-bottom: 10px;">RELATÓRIO DE PRODUÇÃO</h3>
          <p><strong><span style="color:#007bff">Período:</span></strong> ${startDate} a ${endDate}</p>
          <p style="color:green"><strong>✅ Aprovados:</strong> ${totalAprovado}</p>
          <p style="color:red"><strong>❌ Reprovados:</strong> ${totalReprovado}</p>
          <p style="color:#666"><strong>⚙️ Total Produzido:</strong> ${totalProduzido}</p>
        </div>
      `;
      reportResultEl.innerHTML = html;
      downloadReportBtn.disabled = false;
    } else {
      reportResultEl.textContent = 'Nenhum dado encontrado para o período selecionado.';
      downloadReportBtn.disabled = true;
      showError('Nenhum dado encontrado para o período selecionado.');
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    reportResultEl.textContent = 'Erro ao gerar relatório.';
    downloadReportBtn.disabled = true;
    showError('Erro ao gerar relatório.');
  }
}



function downloadRelatorio() {
  if (!lastReportData || lastReportData.length === 0) {
    showError('Nenhum relatório para baixar. Gere um relatório primeiro.');
    return;
  }

  let csvContent = "Data,Total Produzido,Total Reprovado,Qualidade (%)\n";
  lastReportData.forEach(row => {
    const qualidade = row.total_produzido_periodo > 0
      ? (((row.total_produzido_periodo - row.total_reprovado_periodo) / row.total_produzido_periodo) * 100).toFixed(2)
      : '0.00';

    csvContent += `${row.data_registro},${row.total_produzido_periodo},${row.total_reprovado_periodo},${qualidade}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'relatorio_producao.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showError('Relatório baixado com sucesso!');
}


// Troca de telas
function switchScreen(screenId) {
    // Esconde todas as telas e remove a classe 'active-title' de todos os h1
    const screens = document.querySelectorAll('.tela');
    screens.forEach(screen => {
        screen.classList.remove('active');
        // Encontra o h1 dentro de cada tela e remove a classe active-title
        const h1 = screen.querySelector('.header h1') || screen.querySelector('.form-container h1');
        if (h1) {
            h1.classList.remove('active-title');
        }
    });

    // Mostra a tela selecionada
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.add('active');
        // Encontra o h1 dentro da tela ATIVA e adiciona a classe 'active-title'
        const h1 = activeScreen.querySelector('.header h1') || activeScreen.querySelector('.form-container h1');
        if (h1) {
            h1.classList.add('active-title');
        }
    }

    // Remove a classe 'active' de todos os botões de navegação
    const buttons = document.querySelectorAll('.screen-selector button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Adiciona a classe 'active' ao botão clicado
    const clickedButton = document.querySelector(`.screen-selector button[onclick*="${screenId}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Chama funções específicas para cada tela, se existirem
    if (screenId === 'tela1') {
        initDashboard();
    } else if (screenId === 'tela2') {
        // Se houver lógica de inicialização específica para a Tela 2
        inicializarEventosTela2(); // Garante que os eventos da tela 2 sejam inicializados
    } else if (screenId === 'tela3') {
        // Se houver lógica de inicialização específica para a Tela 3
        // Você pode adicionar uma função aqui se houver algo específico para tela3.js
        // No seu caso, tela3.js já tem seu próprio DOMContentLoaded, então não precisa de chamada aqui
    }
}

// Inicialização do dashboard
async function initDashboard() {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Define a data atual no datePicker se não estiver definida
  const datePicker = document.getElementById('datePicker');
  if (datePicker && !datePicker.value) { // Adicionado verificação para datePicker
    datePicker.valueAsDate = new Date();
  }

  // Adiciona event listeners para os botões do dashboard
  const applyDateFilterBtn = document.getElementById('applyDateFilter');
  if (applyDateFilterBtn) { // Adicionado verificação
    applyDateFilterBtn.addEventListener('click', updateDashboardData);
  }

  const openReportPanelBtn = document.getElementById('openReportPanel');
  if (openReportPanelBtn) { // Adicionado verificação
    openReportPanelBtn.addEventListener('click', openModal);
  }

  const closeReportPanelBtn = document.getElementById('closeReportPanel');
  if (closeReportPanelBtn) { // Adicionado verificação
    closeReportPanelBtn.addEventListener('click', closeModal);
  }

  // Verifica se os botões de relatório existem antes de adicionar listeners
  const generateReportBtn = document.getElementById('generateReport');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', gerarRelatorio);
  }
  const downloadReportBtn = document.getElementById('downloadReport');
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', downloadRelatorio);
  }

  // Listener para o botão de atualização do dashboard
  const refreshButton = document.querySelector('.refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', refreshDashboard);
  }

  // Atualiza os dados do dashboard na inicialização
  await updateDashboardData();
}

// Inicialização dos eventos da Tela 2
function inicializarEventosTela2() {
    // Estas variáveis devem ser buscadas sempre que a função é chamada,
    // pois os elementos podem ser carregados dinamicamente ou estar em diferentes estados.
    const modal = document.getElementById("projectModal");
    const leaderEl = document.getElementById("project-leader");
    const teamListEl = document.getElementById("team-list");
    // Seletores mais específicos para evitar conflitos se houver outros botões com a mesma classe em outras telas
    const detailsBtns = document.querySelectorAll("#tela2 .details-btn");
    const closeBtn = document.querySelector("#projectModal .close");
    const editModal = document.getElementById("editProjectModal");
    const closeEditModal = document.querySelector("#editProjectModal .close");

    // Verifica se os elementos cruciais da Tela 2 existem antes de prosseguir
    if (!modal || !leaderEl || !teamListEl || !closeBtn || !editModal || !closeEditModal) {
      console.warn("Elementos da Tela 2 não encontrados para inicialização de eventos. Ignorando inicialização de eventos específicos da Tela 2.");
      return;
    }

    // Exemplo de dados de projeto (isso viria do seu backend real)
    const projectData = {
      1: {
        leader: "João Silva",
        team: ["Maria Oliveira", "Carlos Mendes", "Ana Souza"]
      },
      2: {
        leader: "Fernanda Lima",
        team: ["Bruno Costa", "Juliana Rocha", "Tiago Almeida"]
      }
    };

    // Eventos para botões de detalhes
    detailsBtns.forEach(btn => {
      // Remove qualquer listener anterior para evitar duplicação
      btn.removeEventListener("click", handleDetailsClick);
      btn.addEventListener("click", handleDetailsClick);
    });

    function handleDetailsClick() {
        const id = this.getAttribute("data-id"); // 'this' refere-se ao botão clicado
        const data = projectData[id]; // Substitua por uma chamada à API para dados reais

        if (data) {
            leaderEl.innerHTML = `<strong>${data.leader}</strong>`;
            teamListEl.innerHTML = data.team.map(name => `<li>${name}</li>`).join("");
            modal.style.display = "block";
        } else {
            console.warn(`Dados para o projeto ID ${id} não encontrados.`);
        }
    }

    // Eventos para fechar modais
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    closeEditModal.addEventListener("click", () => {
      editModal.style.display = "none";
    });

    // Fechar modais clicando fora deles
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === editModal) {
            editModal.style.display = "none";
        }
    });

    // Funções de edição e exclusão de projetos (Assumindo que são carregadas dinamicamente via tela2.js)
    // Essas funções podem ser definidas globalmente ou em tela2.js e chamadas aqui se necessário.
    // O seu tela2.js já parece lidar com isso via DOMContentLoaded.
    // É importante garantir que não haja duplicação de listeners.
    // Se tela2.js já adiciona esses listeners, não os adicione aqui novamente.
    // Por exemplo, o tela2.js já tem:
    // document.getElementById("editForm").addEventListener("submit", async e => {...});
    // document.querySelectorAll(".delete-btn").forEach(btn => {...});
    // Então não é necessário adicioná-los novamente aqui.

    // Apenas para garantir que o contêiner de projetos esteja carregado
    // Em uma aplicação real, você chamaria uma função de carregamento de projetos aqui
    // loadProjectsForTela2(); // Função que buscaria e renderizaria os projetos
}


// Event listener principal para quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o dashboard quando a página é carregada pela primeira vez
  // ou quando a tela1 está inicialmente ativa
  initDashboard();

  // Garante que a tela inicial esteja ativa e o botão correspondente realçado
  const initialActiveScreen = document.querySelector('.tela.active');
  if (initialActiveScreen) {
    const screenId = initialActiveScreen.id;
    // Chama switchScreen para configurar a tela inicial e seus listeners
    switchScreen(screenId);
  }

  // Listener para o botão de refresh na Tela 2 (Se existir e for uma atualização de conteúdo, não da página toda)
  const refreshBtnTela2 = document.getElementById('refreshProjects'); // Assumindo que este ID exista na tela2.html
  if (refreshBtnTela2) {
      refreshBtnTela2.addEventListener('click', () => {
          console.log('Recarregar projetos na Tela 2 (implementar lógica de recarregamento de projetos)');
          // Aqui você chamaria a função que recarrega os dados dos projetos na Tela 2, não a página inteira
          // Por exemplo, uma função como `loadProjectsForTela2();` que seria definida em tela2.js ou aqui.
      });
  }
});