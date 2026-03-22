import { useState, useMemo } from "react";
import { tasks } from "../data/Tasks";
import "../styles/home.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Home() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [ordemData, setOrdemData] = useState("recente"); // "recente" | "antigo"
  const [setorFiltro, setSetorFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [ordemTitulo, setOrdemTitulo] = useState(null); // "az" | "za"
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // ===== Botão Limpar Filtro =====

  function limparFiltros() {
    setFiltro("Todos");
    setBusca("");
    setDataInicio("");
    setDataFim("");
    setSetorFiltro("");
    setMesFiltro("");
    setOrdemData(null);
    setOrdemTitulo(null);
  }

  // ===== Exportar PDF =====
  function exportarPDF() {
    const doc = new jsPDF();
    const dadosExport = lista; // usa exatamente o que está filtrado

    // ===== TÍTULO =====
    doc.setFontSize(18);
    doc.text("Relatório de Tarefas - Gestoon", 14, 15);

    // ===== DATA =====
    const hoje = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Gerado em: ${hoje}`, 14, 22);

    // ===== PREPARAR DADOS =====
    const dados = dadosExport.map((t) => [
      t.titulo,
      t.status,
      t.prioridade,
      t.setor,
      t.dataCriacao,
      t.horaCriacao,
      t.criadoPor,
      t.descricao || "-",
    ]);
    // ===== TABELA =====
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Título",
          "Status",
          "Prioridade",
          "Setor",
          "Data",
          "Hora",
          "Criado por",
          "Descrição",
        ],
      ],
      body: dados,

      styles: {
        fontSize: 8,
        lineColor: [200, 200, 200], // cor da linha
        lineWidth: 0.1, // espessura
      },

      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        lineWidth: 0.2,
      },

      theme: "grid",
    });

    // ===== SALVAR =====
    doc.save("relatorio_tarefas.pdf");
  }

  // ===== MAPS =====
  const statusMap = {
    Pendente: "status-pendente",
    "Em andamento": "status-andamento",
    Concluída: "status-concluida",
    Cancelada: "status-cancelada",
  };

  const setores = [
    "Caixa",
    "Estoque",
    "HortiFruti",
    "Açougue",
    "Padaria",
    "Limpeza",
    "Administração",
  ];

  const prioridadeMap = {
    Alta: "prioridade-alta",
    Média: "prioridade-media",
    Baixa: "prioridade-baixa",
  };

  // ===== FILTRO + BUSCA =====
  
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const lista = useMemo(() => {
  let lista = [...tasks];

  // filtro status
  if (filtro !== "Todos") {
    lista = lista.filter((t) => t.status === filtro);
  }

  // busca
  if (busca) {
    lista = lista.filter((t) =>
      t.titulo.toLowerCase().includes(busca.toLowerCase())
    );
  }

  // data
  if (dataInicio || dataFim) {
    lista = lista.filter((t) => {
      const [dia, mes, ano] = t.dataCriacao.split("/");
      const dataTask = new Date(`${ano}-${mes}-${dia}`);

      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim) : null;

      if (inicio && fim) return dataTask >= inicio && dataTask <= fim;
      if (inicio && !fim) return dataTask.getTime() === inicio.getTime();
      if (!inicio && fim) return dataTask <= fim;

      return true;
    });
  }

  // setor
  if (setorFiltro) {
    lista = lista.filter((t) => t.setor === setorFiltro);
  }

  // mês
  if (mesFiltro) {
    lista = lista.filter((t) => {
      const [, mes] = t.dataCriacao.split("/");
      return mes === mesFiltro;
    });
  }

  // ordenação
  lista.sort((a, b) => {
    let resultado = 0;

    if (ordemData) {
      const [dA, mA, yA] = a.dataCriacao.split("/");
      const [dB, mB, yB] = b.dataCriacao.split("/");

      const dataA = new Date(`${yA}-${mA}-${dA}`);
      const dataB = new Date(`${yB}-${mB}-${dB}`);

      resultado =
        ordemData === "recente" ? dataB - dataA : dataA - dataB;
    }

    if (resultado === 0 && ordemTitulo) {
      resultado =
        ordemTitulo === "az"
          ? a.titulo.localeCompare(b.titulo)
          : b.titulo.localeCompare(a.titulo);
    }

    return resultado;
  });

  return lista;
}, [filtro, busca, dataInicio, dataFim, setorFiltro, mesFiltro, ordemData, ordemTitulo]);

  // ===== RESUMO =====
  const total = tasks.length;

  const pendentes = tasks.filter((t) => t.status === "Pendente").length;
  const andamento = tasks.filter((t) => t.status === "Em andamento").length;
  const concluidas = tasks.filter((t) => t.status === "Concluída").length;
  const canceladas = tasks.filter((t) => t.status === "Cancelada").length;

  const dataGrafico = useMemo(() => [
  { name: "Pendentes", value: pendentes },
  { name: "Em andamento", value: andamento },
  { name: "Concluídas", value: concluidas },
  { name: "Canceladas", value: canceladas },
], [pendentes, andamento, concluidas, canceladas]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* ===== RESUMO ===== */}
      <div className="resumo">
        <div>Total: {total}</div>
        <div>Pendentes: {pendentes}</div>
        <div>Em andamento: {andamento}</div>
        <div>Concluídas: {concluidas}</div>
        <div>Canceladas: {canceladas}</div>
      </div>

      {/* ===== BUSCA ===== */}
      <div className="top-actions">
        <input
          placeholder="Buscar tarefa..."
          className="busca"
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* ==== DATA ==== */}
      <div className="filtros-avancados">
        <div>
          <div>
            <label>Período: </label>

            <div className="periodo-inputs">
              <div>
                <small>De: </small>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div>
                <small>Até: </small>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          </div>

          <small className="meses">Meses: </small>
          <select
            className="filtro-select"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
          >
            <option value="">Todos os meses</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>

        {/* SETOR */}
        <div>
          <label>Setor:</label>
          <select
            value={setorFiltro}
            onChange={(e) => setSetorFiltro(e.target.value)}
          >
            <option value="">Todos</option>

            {setores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="filtros">
        <button
          className={filtro === "Todos" ? "ativo" : ""}
          onClick={() => setFiltro("Todos")}
        >
          Todos
        </button>

        <button
          className={filtro === "Pendente" ? "ativo" : ""}
          onClick={() => setFiltro("Pendente")}
        >
          Pendentes
        </button>

        <button
          className={filtro === "Em andamento" ? "ativo" : ""}
          onClick={() => setFiltro("Em andamento")}
        >
          Em andamento
        </button>

        <button
          className={filtro === "Concluída" ? "ativo" : ""}
          onClick={() => setFiltro("Concluída")}
        >
          Concluídas
        </button>

        <button
          className={filtro === "Cancelada" ? "ativo" : ""}
          onClick={() => setFiltro("Cancelada")}
        >
          Canceladas
        </button>
      </div>

      <button className="limpar-btn" onClick={limparFiltros}>
        Limpar Filtros
      </button>

      {/* ===== TABELA ===== */}
      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th
                className={ordemTitulo ? "coluna-ativa" : ""}
                onClick={() =>
                  setOrdemTitulo((prev) => {
                    if (prev === null) return "az";
                    if (prev === "az") return "za";
                    return null;
                  })
                }
              >
                Título{" "}
                {ordemTitulo === "az" ? "↑" : ordemTitulo === "za" ? "↓" : ""}
              </th>

              <th>Status</th>
              <th>Prioridade</th>
              <th>Setor</th>
              <th>Criado por</th>
              <th>Hora</th>

              <th
                className={ordemData ? "coluna-ativa" : ""}
                onClick={() =>
                  setOrdemData((prev) => {
                    if (prev === null) return "recente";
                    if (prev === "recente") return "antigo";
                    return null;
                  })
                }
              >
                Data{" "}
                {ordemData === "recente"
                  ? "↓"
                  : ordemData === "antigo"
                    ? "↑"
                    : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {lista.map((task) => (
              <tr key={task.id} onClick={() => setSelectedTask(task)}>
                <td>{task.titulo}</td>

                <td>
                  <span className={`badge ${statusMap[task.status]}`}>
                    {task.status}
                  </span>
                </td>

                <td>
                  <span className={`badge ${prioridadeMap[task.prioridade]}`}>
                    {task.prioridade}
                  </span>
                </td>

                <td>{task.setor}</td>
                <td>{task.criadoPor}</td>
                <td>{task.horaCriacao}</td>
                <td>{task.dataCriacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL ===== */}
      {selectedTask && (
        <>
          <div className="overlay"></div>

          <div className="task-modal">
            <h2>{selectedTask.titulo}</h2>

            <p>Status: {selectedTask.status}</p>
            <p>Prioridade: {selectedTask.prioridade}</p>
            <p>Setor: {selectedTask.setor}</p>
            <p>Data: {selectedTask.dataCriacao}</p>
            <p>Criado por: {selectedTask.criadoPor}</p>
            <p>Horário: {selectedTask.horaCriacao}</p>

            <p className="descricao">{selectedTask.descricao}</p>

            <button onClick={() => setSelectedTask(null)}>Fechar</button>
          </div>
        </>
      )}

      <div className="footer-actions">
        <button className="export-btn" onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {/* ==== Gráfico ==== */}
      <div className="grafico">
        <h3>Status das tarefas</h3>

        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dataGrafico}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              innerRadius={50}
              activeShape={null}
              isAnimationActive={false}
              stroke="none"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={20}
            >
              {dataGrafico.map((entry, index) => (
                <Cell
                  key={index}
                  fill={["#ef4444", "#f59e0b", "#22c55e", "#6b7280"][index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* legenda manual */}
        <div className="legenda">
          {dataGrafico.map((item, i) => (
            <div key={i}>
              <span
                className="cor"
                style={{
                  background: ["#ef4444", "#f59e0b", "#22c55e", "#6b7280"][i],
                }}
              ></span>
              {item.name} ({item.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
