const sheetID = "1mvsl0G1BpcroK-AvZSPBrjGb2XpWO1L8eGR_llfg5Qk";
const sheetNames = [
  "Agrícola 2500", "Agrícola 3500", "Agrícola 4500", "Agrícola 5500",
  "Agrícola 6500", "Agrícola 7500", "Super Agrícola 3000", "Super Agrícola 3500",
  "Super Agrícola 4500", "Super Agrícola 5500", "Super Agrícola 6500", "Super Agrícola 7500",
  "Pro Stock 4500", "Pro Stock 5500", "Super Diesel 4500",
  "Livre 2600", "Livre 2800", "Livre 3600", "Livre 4400"
];

const categoriaSelect = document.getElementById('categoria');
const placarBody = document.querySelector('#placar tbody');

sheetNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  categoriaSelect.appendChild(option);
});

categoriaSelect.addEventListener('change', () => {
  fetchData(categoriaSelect.value);
});

function fetchData(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
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
        
        // Score principal pela Puxada 2
        let score = nPuxada2;
        
        // Se houve empate em Full Pull na puxada 2, usar puxada 3 como desempate
        if (nPuxada2 === 100) {
          score += nPuxada3 / 1000; // Pequeno desempate com puxada 3
        }
        
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

// Carregar a primeira categoria automaticamente
fetchData(sheetNames[0]);
categoriaSelect.value = sheetNames[0];