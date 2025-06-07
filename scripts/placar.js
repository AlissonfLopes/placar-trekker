const sheetID = "1mvsl0G1BpcroK-AvZSPBrjGb2XpWO1L8eGR_llfg5Qk";
const sheetName = "Agrícola 2500"; // <- Pode trocar para qualquer categoria fixa

const placarBody = document.querySelector('#placar');

function fetchData(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`;
  fetch(url)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const resultados = rows
        .map(r => r.c.map(cell => (cell ? cell.v : "")))
        .filter(row => row.length && row[0] && row[0] !== 'Trator');

      const calculados = resultados.map(r => {
        const puxada1 = r[1];
        const puxada2 = r[2];
        const puxada3 = r[3];

        // Normalizar puxadas
        const nPuxada2 = normalizaPuxada(puxada2);
        const nPuxada3 = normalizaPuxada(puxada3);

        // Cálculo do score (desconsiderando puxada1)
        const validos = [nPuxada2, nPuxada3].filter(n => n >= 0);
        const score = validos.length ? Math.max(...validos) : -1;

        return { 
          nome: r[0], 
          puxada1, 
          puxada2, 
          puxada3, 
          score 
        };
      });

      // Ordenar do maior para o menor score
      calculados.sort((a, b) => b.score - a.score);

      renderTable(calculados);
    });
}

function normalizaPuxada(value) {
  if (!value) return -1;
  if (typeof value === 'string' && value.trim().toUpperCase() === 'FP') return 100;
  const n = parseFloat(value.toString().replace(',', '.'));
  return isNaN(n) ? -1 : n;
}

function renderTable(data) {
  placarBody.innerHTML = "";

  data.forEach((item, index) => {
    const tr = document.createElement('tr');

    let medalha = "";
    if (index === 0) {
      tr.classList.add('top1');
      medalha = "🥇 ";
    } else if (index === 1) {
      tr.classList.add('top2');
      medalha = "🥈 ";
    } else if (index === 2) {
      tr.classList.add('top3');
      medalha = "🥉 ";
    }

    tr.innerHTML = `
      <td>${medalha}${item.nome}</td>
      <td>${formatarPuxada(item.puxada1)}</td>
      <td>${formatarPuxada(item.puxada2)}</td>
      <td>${formatarPuxada(item.puxada3)}</td>
    `;
    placarBody.appendChild(tr);
  });
}

function formatarPuxada(valor) {
  if (!valor) return "";
  if (valor.toString().trim().toUpperCase() === "FP") return "Full Pull";

  const n = parseFloat(valor.toString().replace(',', '.'));
  return n >= 100 ? "Full Pull" : valor;
}

// Carregar a categoria fixa
fetchData(sheetName);