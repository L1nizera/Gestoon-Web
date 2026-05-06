import styles from "./style.module.css";

const statusMap = {
  Pendente: "danger",
  "Em andamento": "warning",
  Concluída: "success",
  Cancelada: "neutral",
  Ativo: "success",
  Inativo: "neutral",
};

const prioridadeMap = {
  Alta: "danger",
  Média: "warning",
  Baixa: "success",
};

function Badge({ value, type = "status" }) {
  const map = type === "prioridade" ? prioridadeMap : statusMap;
  const variant = map[value] || "neutral";

  return <span className={`${styles.badge} ${styles[variant]}`}>{value}</span>;
}

export default Badge;