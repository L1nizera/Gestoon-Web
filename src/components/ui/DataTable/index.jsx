import styles from "./style.module.css";

function DataTable({
  columns,
  data,
  rowKey = "id",
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = "Nenhum resultado encontrado",
  mobile = "scroll", // "scroll" | "hidden"
}) {
  function renderSortIcon(column) {
    if (!column.sortable || sortKey !== column.key) return "";

    if (sortDirection === "az" || sortDirection === "antigo") return "↑";
    if (sortDirection === "za" || sortDirection === "recente") return "↓";

    return "";
  }

  return (
    <div
      className={`${styles.tabelaContainer} ${
        mobile === "hidden" ? styles.hideMobile : ""
      }`}
    >
      <table className={styles.tabela}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${column.align === "center" ? styles.textCenter : ""}
                  ${column.sortable && sortKey === column.key ? styles.colunaAtiva : ""}
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
                onClick={() => {
                  if (onRowClick) onRowClick(row);
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === "center" ? styles.textCenter : ""}
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