import styles from "./style.module.css";

function DataTable({
  columns,
  data,
  rowKey = "id",
  onRowClick,
  rowClassName,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = "Nenhum resultado encontrado",
  mobile = "scroll", // "scroll" | "hidden"
  variant = "", // "tarefas" | "funcionarios" | "relatorios"
}) {
  function renderSortIcon(column) {
    if (!column.sortable || sortKey !== column.key) return "";

    if (sortDirection === "az" || sortDirection === "antigo") return "↑";
    if (sortDirection === "za" || sortDirection === "recente") return "↓";
    if (sortDirection === "maior") return "↓";

    return "";
  }

  return (
    <div
      className={`${styles.tabelaContainer} ${
        mobile === "hidden" ? styles.hideMobile : ""
      }`}
    >
      <table className={`${styles.tabela} ${variant ? styles[variant] : ""}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${column.align === "center" ? styles.textCenter : ""}
                  ${column.sortable ? styles.thSortable : ""}
                  ${
                    column.sortable && sortKey === column.key
                      ? styles.colunaAtiva
                      : ""
                  }
                `}
                onClick={() => {
                  if (column.sortable && onSort) {
                    onSort(column.key);
                  }
                }}
              >
                {column.label} {renderSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr
                key={row[rowKey]}
                className={rowClassName ? rowClassName(row) : ""}
                onClick={() => {
                  if (onRowClick) onRowClick(row);
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={
                      column.align === "center" ? styles.textCenter : ""
                    }
                    title={
                      typeof row[column.key] === "string"
                        ? row[column.key]
                        : undefined
                    }
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={styles.textCenter}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
