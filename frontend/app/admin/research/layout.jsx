import styles from "./research-responsive.module.css";

export default function AdminResearchLayout({ children }) {
  return <div className={styles.researchRoute}>{children}</div>;
}
