import styles from "./style.module.css";

function SearchInput({
  value,
  onChange,
  placeholder = "Buscar..."
}) {
  return (
    <input
      className={styles.busca}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchInput;