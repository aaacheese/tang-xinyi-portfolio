import type { Metadata } from "next";
import BackButton from "../xiaohongshu/BackButton";
import styles from "../xiaohongshu/page.module.css";

export const metadata: Metadata = {
  title: "Meituan Experience Design — Tang Xinyi",
  description: "Meituan and Dianping UX experience design project by Tang Xinyi.",
};

const pages = [
  [27, 2300, 4584], [28, 2300, 1291], [29, 2300, 1291], [30, 2300, 1291],
  [31, 2300, 1966], [32, 2302, 1295], [33, 2300, 1291], [34, 2300, 3714],
  [35, 2300, 1210], [36, 2300, 1291], [37, 2300, 1772], [38, 2300, 1164],
  [39, 2300, 1588], [40, 2300, 1291], [41, 2304, 1296], [42, 2304, 1296],
  [43, 2304, 1152], [44, 2300, 1291], [45, 2304, 1690], [46, 2304, 1296],
  [47, 2304, 1296], [48, 2304, 1296], [49, 2300, 1291], [50, 2304, 1524],
  [51, 2304, 2334], [52, 2304, 3160], [53, 2304, 1750], [54, 2300, 1291],
  [55, 2304, 1296], [56, 2304, 1446], [57, 2304, 1446], [58, 2304, 2974],
  [59, 2304, 2056], [60, 2304, 1296], [61, 2304, 1728],
] as const;

export default function MeituanExperiencePage() {
  return (
    <main className={styles.page}>
      <BackButton className={styles.backButton} />
      <div className={styles.gallery} aria-label="Meituan project pages">
        {pages.map(([page, width, height], index) => (
          <img
            key={page}
            className={styles.image}
            src={`/assets/meituan/${page}.png`}
            alt={`Meituan experience design project, page ${index + 1} of ${pages.length}`}
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
