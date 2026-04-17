import { useState, useMemo } from "react";
import styles from "./style.module.css";
import { tasks } from "../../data/Tasks";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../components/Modal/Modal";


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
  const [tasksState, setTasksState] = useState(tasks);
  const [editTask, setEditTask] = useState(null);
  const [menuAtivo, setMenuAtivo] = useState("tarefas");

  // ===== MODAL CRIAR =====
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const [novaTask, setNovaTask] = useState({
    titulo: "",
    setor: "Caixa",
    prioridade: "Média",
    status: "Pendente",
    descricao: "",
  });

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

  function excluirTask(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    const novaLista = tasksState.filter((t) => t.id !== id);
    setTasksState(novaLista);
    setSelectedTask(null);
  }

  function abrirEdicao(task) {
    setSelectedTask(null); // fecha o modal atual
    setEditTask({ ...task });
  }

  function salvarEdicao() {
    setTasksState((prev) =>
      prev.map((t) => (t.id === editTask.id ? editTask : t)),
    );

    setEditTask(null);
  }

  function criarTask() {
    if (!novaTask.titulo.trim()) return;

    const agora = new Date();

    const dataCriacao = agora.toLocaleDateString("pt-BR");
    const horaCriacao = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const taskCompleta = {
      ...novaTask,
      id: Date.now(),
      criadoPor: "Admin", // temporário
      dataCriacao,
      horaCriacao,
    };

    setTasksState((prev) => [...prev, taskCompleta]);

    // resetar
    setNovaTask({
      titulo: "",
      setor: "Caixa",
      prioridade: "Média",
      status: "Pendente",
      descricao: "",
    });

    setCreateTaskOpen(false);
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
    Pendente: "statusPendente",
    "Em andamento": "statusAndamento",
    Concluída: "statusConcluida",
    Cancelada: "statusCancelada",
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
    Alta: "prioridadeAlta",
    Média: "prioridadeMedia",
    Baixa: "prioridadeBaixa",
  };

  // ===== FILTRO + BUSCA =====

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const lista = useMemo(() => {
    let lista = [...tasksState];

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

        resultado = ordemData === "recente" ? dataB - dataA : dataA - dataB;
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
  }, [
    tasksState,
    filtro,
    busca,
    dataInicio,
    dataFim,
    setorFiltro,
    mesFiltro,
    ordemData,
    ordemTitulo,
  ]);

  // ===== RESUMO =====
  const total = tasksState.length;

  const pendentes = tasksState.filter((t) => t.status === "Pendente").length;
  const andamento = tasksState.filter(
    (t) => t.status === "Em andamento",
  ).length;
  const concluidas = tasksState.filter((t) => t.status === "Concluída").length;
  const canceladas = tasksState.filter((t) => t.status === "Cancelada").length;

  const dataGrafico = useMemo(
    () => [
      { name: "Pendentes", value: pendentes },
      { name: "Em andamento", value: andamento },
      { name: "Concluídas", value: concluidas },
      { name: "Canceladas", value: canceladas },
    ],
    [pendentes, andamento, concluidas, canceladas],
  );

  return (
    <div className={styles.dashboard}>
      {/* ===== MENU TOPO ===== */}

      <h1>Tarefas</h1>

      {/* ===== RESUMO ===== */}
      <div className={styles.resumo}>
        <div>Total: {total}</div>
        <div>Pendentes: {pendentes}</div>
        <div>Em andamento: {andamento}</div>
        <div>Concluídas: {concluidas}</div>
        <div>Canceladas: {canceladas}</div>
      </div>

      {/* ===== BUSCA ===== */}
      <div className={styles.topActions}>
        <input
          placeholder="Buscar tarefa..."
          className={styles.busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* ==== DATA ==== */}
      <div className={styles.filtrosAvancados}>
        <div>
          <div>
            <label>Período: </label>

            <div className={styles.periodoInputs}>
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

          <small className={styles.meses}>Meses: </small>
          <select
            className={styles.filtroSelect}
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
          <small>Setor:</small>
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
      <div className={styles.filtros}>
        <button
          className={filtro === "Todos" ? styles.ativo : ""}
          onClick={() => setFiltro("Todos")}
        >
          Todos
        </button>

        <button
          className={filtro === "Pendente" ? styles.ativo : ""}
          onClick={() => setFiltro("Pendente")}
        >
          Pendentes
        </button>

        <button
          className={filtro === "Em andamento" ? styles.ativo : ""}
          onClick={() => setFiltro("Em andamento")}
        >
          Em andamento
        </button>

        <button
          className={filtro === "Concluída" ? styles.ativo : ""}
          onClick={() => setFiltro("Concluída")}
        >
          Concluídas
        </button>

        <button
          className={filtro === "Cancelada" ? styles.ativo : ""}
          onClick={() => setFiltro("Cancelada")}
        >
          Canceladas
        </button>
      </div>


      <div className={styles.acoes}>
        <button className={styles.limparBtn} onClick={limparFiltros}>
          Limpar Filtros
        </button>

        <button
          className={styles.criarBtn}
          onClick={() => setCreateTaskOpen(true)}
        >
          Criar Tarefa
        </button>
      </div>

      {/* ===== TABELA ===== */}
      <div className={styles.tabelascroll}>
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th
                  className={ordemTitulo ? styles.colunaAtiva : ""}
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
                  className={ordemData ? styles.colunaAtiva : ""}
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
                <tr
                  key={task.id}
                  onClick={(e) => {
                    if (e.target.tagName === "BUTTON") return;
                    setSelectedTask(task);
                  }}
                >
                  <td>{task.titulo}</td>

                  <td>
                    <span className={`${styles.badge} ${styles[statusMap[task.status]]}`}>
                      {task.status}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${styles[prioridadeMap[task.prioridade]]}`}>
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
      </div>

      {/* ===== MODAL ===== */}
      {selectedTask && (
        <Modal
          title={selectedTask.titulo}
          variant="between"

          onClose={() => setSelectedTask(null)}
          actions={
            <>
              <button
                className={styles.btnClose}
                onClick={() => setSelectedTask(null)}
              >
                Fechar
              </button>

              <button
                className={styles.btnPrimary}
                onClick={() => abrirEdicao(selectedTask)}
              >
                Editar
              </button>

              <button
                className={styles.btnDanger}
                onClick={() => excluirTask(selectedTask.id)}
              >
                Excluir
              </button>
            </>
          }
        >
          <div className={styles.modalGrid}>
            <div>
              <strong>Prioridade:</strong>
              <span className={`${styles.badge} ${styles[prioridadeMap[selectedTask.prioridade]]}`}>
                {selectedTask.prioridade}
              </span>
            </div>

            <div>
              <strong>Setor</strong>
              <p>{selectedTask.setor}</p>
            </div>

            <div>
              <strong>Criado por</strong>
              <p>{selectedTask.criadoPor}</p>
            </div>

            <div>
              <strong>Data</strong>
              <p>{selectedTask.dataCriacao}</p>
            </div>

            <div>
              <strong>Hora</strong>
              <p>{selectedTask.horaCriacao}</p>
            </div>
          </div>

          <div className={styles.descricaoBox}>
            <strong>Descrição</strong>
            <p>{selectedTask.descricao || "Sem descrição"}</p>
          </div>
        </Modal>
      )}

      {/* ===== MODAL EDITAR ===== */}
      {editTask && (
        <Modal
          title="Editar Tarefa"
          onClose={() => setEditTask(null)}
          variant="between"
          actions={
            <>
              <button
                className={styles.btnSecondary}
                onClick={() => setEditTask(null)}
              >
                Cancelar
              </button>

              <button
                className={styles.btnPrimary}
                onClick={salvarEdicao}
                disabled={!editTask.titulo}
              >
                Salvar
              </button>
            </>
          }
        >
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Título</label>
              <input
                type="text"
                value={editTask.titulo}
                onChange={(e) =>
                  setEditTask({ ...editTask, titulo: e.target.value })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Setor</label>
              <select
                value={editTask.setor}
                onChange={(e) =>
                  setEditTask({ ...editTask, setor: e.target.value })
                }
              >
                {setores.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={editTask.status}
                onChange={(e) =>
                  setEditTask({ ...editTask, status: e.target.value })
                }
              >
                <option>Pendente</option>
                <option>Em andamento</option>
                <option>Concluída</option>
                <option>Cancelada</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Prioridade</label>
              <select
                value={editTask.prioridade}
                onChange={(e) =>
                  setEditTask({ ...editTask, prioridade: e.target.value })
                }
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Criado por</label>
              <input type="text" value={editTask.criadoPor} disabled />
            </div>

            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Descrição</label>
              <textarea
                rows={4}
                value={editTask.descricao}
                onChange={(e) =>
                  setEditTask({ ...editTask, descricao: e.target.value })
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ===== MODAL CRIAR ===== */}
      {createTaskOpen && (
        <Modal
          title="Criar Tarefa"
          onClose={() => setCreateTaskOpen(false)}
          variant="between"
          actions={
            <>
              <button className={styles.btnDanger} onClick={() => {
                setCreateTaskOpen(false);
                setNovaTask({
                  titulo: "",
                  setor: "Caixa",
                  prioridade: "Média",
                  status: "Pendente",
                  descricao: "",
                });
              }}>Fechar
              </button>


              <button className={styles.btnSecondary} onClick={() =>
                setNovaTask({
                  titulo: "",
                  setor: "Caixa",
                  prioridade: "Média",
                  status: "Pendente",
                  descricao: "",
                })
              }
              >Limpar
              </button>


              <button className={styles.btnPrimary}
                onClick={criarTask}
                disabled={!novaTask.titulo}
              >
                Criar
              </button>
            </>
          }
        >

          <div className={styles.formGrid}>
            {/* TÍTULO */}
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Título</label>
              <input
                type="text"
                value={novaTask.titulo}
                onChange={(e) =>
                  setNovaTask({ ...novaTask, titulo: e.target.value })
                }
                placeholder="Digite o título..."
              />
            </div>

            {/* SETOR */}
            <div className={styles.formGroup}>
              <label>Setor</label>
              <select
                value={novaTask.setor}
                onChange={(e) =>
                  setNovaTask({ ...novaTask, setor: e.target.value })
                }
              >
                {setores.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={novaTask.status}
                onChange={(e) =>
                  setNovaTask({ ...novaTask, status: e.target.value })
                }
              >
                <option>Pendente</option>
                <option>Em andamento</option>
                <option>Concluída</option>
                <option>Cancelada</option>
              </select>
            </div>

            {/* PRIORIDADE */}
            <div className={styles.formGroup}>
              <label>Prioridade</label>
              <select
                value={novaTask.prioridade}
                onChange={(e) =>
                  setNovaTask({ ...novaTask, prioridade: e.target.value })
                }
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>

            {/* DESCRIÇÃO */}
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Descrição</label>
              <textarea
                rows={4}
                value={novaTask.descricao}
                onChange={(e) =>
                  setNovaTask({ ...novaTask, descricao: e.target.value })
                }
              />
            </div>
          </div>
        </Modal>
      )}

      <div className={styles.footerActions}>
        <button className={styles.exportBtn} onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {/* ==== Gráfico ==== */}
      <div className={styles.grafico}>
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