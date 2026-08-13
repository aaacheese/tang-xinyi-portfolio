import type { Metadata } from "next";
import BackButton from "../xiaohongshu/BackButton";
import styles from "../xiaohongshu/page.module.css";

export const metadata: Metadata = {
  title: "Tencent Experience Design — Tang Xinyi",
  description: "Tencent CSIG interaction design project by Tang Xinyi.",
};

const pages = [
  [62, 1728, 1859], [63, 1728, 1422], [64, 1727, 972], [65, 1727, 972],
  [66, 1727, 972], [67, 1727, 1518], [68, 1727, 1014], [69, 1728, 1118],
  [70, 1728, 972], [71, 1728, 1316], [72, 1727, 1715], [73, 1728, 972],
  [74, 1728, 1424], [75, 1728, 972], [76, 1728, 972], [77, 1728, 972],
  [78, 1728, 972], [79, 1728, 972], [80, 1728, 972], [81, 1728, 1212],
  [82, 1728, 1280], [83, 1728, 972], [84, 1725, 1014], [85, 1725, 1014],
  [86, 1725, 1805], [87, 1725, 1014], [88, 1725, 1101], [89, 1728, 2349],
  [90, 1728, 1718], [91, 1728, 1718], [92, 1728, 972],
] as const;

export default function TencentExperiencePage() {
  return (
    <main className={styles.page}>
      <BackButton className={styles.backButton} />
      <div className={styles.gallery} aria-label="Tencent project pages">
        {pages.map(([page, width, height], index) => (
          <img
            key={page}
            className={styles.image}
            src={`/assets/tencent/${page}.png`}
            alt={`Tencent experience design project, page ${index + 1} of ${pages.length}`}
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
