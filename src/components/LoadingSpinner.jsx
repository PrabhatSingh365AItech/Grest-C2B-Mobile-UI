import styles from "../styles/LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.lds_dual_ring}></div>
  );
};

export default LoadingSpinner;
