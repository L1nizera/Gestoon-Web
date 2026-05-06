import styles from "./style.module.css";

function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className={styles.topActions}>
      <input
        className={styles.busca}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;