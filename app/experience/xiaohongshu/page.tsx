import type { Metadata } from "next";
import BackButton from "./BackButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Xiaohongshu Experience Design — Tang Xinyi",
  description:
    "Xiaohongshu commerce experience design project by Tang Xinyi.",
};

const pages = [
  [1, 1726, 971],
  [2, 1725, 1233],
  [3, 1726, 971],
  [4, 1725, 1034],
  [5, 1725, 1200],
  [6, 1725, 1106],
  [7, 1726, 1017],
  [8, 1725, 1058],
  [9, 1726, 1115],
  [10, 1725, 1920],
  [11, 1725, 1578],
  [12, 1725, 2034],
  [13, 1725, 1622],
  [14, 1726, 971],
  [15, 1726, 971],
  [16, 1726, 1041],
  [17, 1726, 971],
  [18, 1726, 1294],
  [19, 1726, 971],
  [20, 1726, 974],
  [21, 1726, 3787],
  [22, 1726, 1025],
  [23, 1726, 1591],
  [24, 1726, 1519],
] as const;

export default function XiaohongshuExperiencePage() {
  return (
    <main className={styles.page}>
      <BackButton className={styles.backButton} />
      <div className={styles.gallery} aria-label="Xiaohongshu project pages">
        {pages.map(([page, width, height], index) => (
          <img
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
