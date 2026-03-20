import { useState } from "react";
import { tasks } from "../data/Tasks";
import "../styles/home.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Home() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [ordemData, setOrdemData] = useState(null); // "recente" | "antigo"
  const [dataFiltro, setDataFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");

  // ===== Exportar PDF =====
  function exportarPDF() {
  const doc = new jsPDF()

  // ===== TÍTULO =====
  doc.setFontSize(18)
  doc.text("Relatório de Tarefas - Gestoon", 14, 15)

  // ===== DATA =====
  const hoje = new Date().toLocaleDateString()
  doc.setFontSize(10)
  doc.text(`Gerado em: ${hoje}`, 14, 22)

  // ===== PREPARAR DADOS =====
  const dados = lista.map((t) => [
    t.titulo,
    t.status,
    t.prioridade,
    t.setor,
    t.dataCriacao,
    t.descricao || "-"
  ])

  // ===== TABELA =====
  autoTable(doc, {
  startY: 30,
  head: [["Título", "Status", "Prioridade", "Setor", "Data", "Descrição"]],
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
})

  // ===== SALVAR =====
  doc.save("relatorio_tarefas.pdf")
}

  // ===== MAPS =====
  const statusMap = {
    Pendente: "status-pendente",
    "Em andamento": "status-andamento",
    Concluída: "status-concluida",
  };

  const setores = ["TI", "Backend", "Financeiro", "RH"];

  const prioridadeMap = {
    Alta: "prioridade-alta",
    Média: "prioridade-media",
    Baixa: "prioridade-baixa",
  };

  // ===== FILTRO + BUSCA =====
  function processarTasks() {
    let lista = [...tasks];

    // filtro status
    if (filtro !== "Todos") {
      lista = lista.filter((t) => t.status === filtro);
    }

    // busca
    if (busca) {
      lista = lista.filter((t) =>
        t.titulo.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    // filtro por data
    if (dataFiltro) {
      lista = lista.filter((t) => t.dataCriacao === dataFiltro);
    }

    // filtro por setor
    if (setorFiltro) {
      lista = lista.filter((t) => t.setor === setorFiltro);
    }

    // ordenação por data
    if (ordemData) {
      lista.sort((a, b) => {
        const [diaA, mesA, anoA] = a.dataCriacao.split("/");
        const [diaB, mesB, anoB] = b.dataCriacao.split("/");

        const dataA = new Date(`${anoA}-${mesA}-${diaA}`);
        const dataB = new Date(`${anoB}-${mesB}-${diaB}`);

        return ordemData === "recente" ? dataB - dataA : dataA - dataB;
      });
    }

    return lista;
  }

  const lista = processarTasks();

  // ===== RESUMO =====
  const total = tasks.length;

  const pendentes = tasks.filter((t) => t.status === "Pendente").length;
  const andamento = tasks.filter((t) => t.status === "Em andamento").length;
  const concluidas = tasks.filter((t) => t.status === "Concluída").length;

  const dataGrafico = [
    { name: "Pendentes", value: pendentes },
    { name: "Em andamento", value: andamento },
    { name: "Concluídas", value: concluidas },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* ===== RESUMO ===== */}
      <div className="resumo">
        <div>Total: {total}</div>
        <div>Pendentes: {pendentes}</div>
        <div>Em andamento: {andamento}</div>
        <div>Concluídas: {concluidas}</div>
      </div>

      {/* ===== BUSCA ===== */}
      <div className="top-actions">
        <input
          placeholder="Buscar tarefa..."
          className="busca"
          onChange={(e) => setBusca(e.target.value)}
        />

        <button className="export-btn" onClick={exportarPDF}>Exportar PDF</button>
      </div>

      {/* ==== DATA ==== */}
      <div className="filtros-avancados">
        <div>
          <label>Filtrar por data:</label>
          <input
            type="date"
            onChange={(e) => {
              const valor = e.target.value;
              if (valor) {
                const formatada = valor.split("-").reverse().join("/");
                setDataFiltro(formatada);
              } else {
                setDataFiltro("");
              }
            }}
          />
        </div>

        {/* SETOR */}
        <div>
          <label>Setor:</label>
          <select onChange={(e) => setSetorFiltro(e.target.value)}>
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
        <button onClick={() => setFiltro("Todos")}>Todos</button>
        <button onClick={() => setFiltro("Pendente")}>Pendentes</button>
        <button onClick={() => setFiltro("Em andamento")}>Em andamento</button>
        <button onClick={() => setFiltro("Concluída")}>Concluídas</button>
      </div>

      {/* ===== TABELA ===== */}
      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Título</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Setor</th>
              <th
                onClick={() =>
                  setOrdemData((prev) =>
                    prev === "recente" ? "antigo" : "recente",
                  )
                }
              >
                Data {ordemData === "recente" ? "↓" : "↑"}
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

            <p className="descricao">{selectedTask.descricao}</p>

            <button onClick={() => setSelectedTask(null)}>Fechar</button>
          </div>
        </>
      )}

      {/* ==== Gráfico ==== */}
      <div className="grafico">
        <h3>Status das tarefas</h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dataGrafico}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              innerRadius={50} // deixa estilo "donut"
              paddingAngle={3}
            >
              {dataGrafico.map((entry, index) => (
                <Cell
                  key={index}
                  fill={["#ef4444", "#f59e0b", "#22c55e"][index]}
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
                  background: ["#ef4444", "#f59e0b", "#22c55e"][i],
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
