import type { Metadata } from "next";
import BackButton from "./BackButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Xiaohongshu Experience Design — Tang Xinyi",
  description:
    "Xiaohongshu commerce experience design project by Tang Xinyi.",
};

const pages = [
  [3, 2301, 1294],
  [4, 2300, 1644],
  [5, 2301, 1294],
  [6, 2300, 1378],
  [7, 2300, 1416],
  [8, 2300, 1474],
  [9, 2301, 1355],
  [10, 2300, 1354],
  [11, 2300, 1382],
  [12, 2300, 2560],
  [13, 2300, 1354],
  [14, 2300, 2514],
  [15, 2300, 2712],
  [16, 2300, 1644],
  [17, 2300, 1354],
  [18, 2301, 1294],
  [19, 2301, 1294],
  [20, 2301, 1388],
  [21, 2301, 1294],
  [22, 2301, 1726],
  [23, 2301, 1294],
  [24, 2301, 1299],
  [25, 2301, 5049],
  [26, 2301, 1366],
  [27, 2301, 2121],
  [28, 2301, 2025],
] as const;

export default function XiaohongshuExperiencePage() {
  return (
    <main className={styles.page}>
      <BackButton className={styles.backButton} />
      <div className={styles.gallery} aria-label="Xiaohongshu project pages">
        {pages.map(([page, width, height], index) => (
          <img
            key={page}
            className={styles.image}
            src={`/assets/xiaohongshu/${page}.png`}
            alt={`Xiaohongshu experience design project, page ${page} of ${pages.length}`}
            width={width}
            height={height}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding={index === 0 ? "sync" : "async"}
          />
        ))}
      </div>
    </main>
  );
}
