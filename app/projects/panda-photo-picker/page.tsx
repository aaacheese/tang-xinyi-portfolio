import type { Metadata } from "next";
import BackButton from "../../experience/xiaohongshu/BackButton";
import styles from "../../experience/xiaohongshu/page.module.css";

export const metadata: Metadata = {
  title: "Panda Photo Picker Product Design — Tang Xinyi",
  description:
    "Panda Photo Picker AI-assisted children's photo selection product design by Tang Xinyi.",
};

const pages = [
  [41, 1728, 972],
  [42, 1728, 972],
  [44, 1728, 2139],
  [45, 1728, 972],
  [46, 1728, 972],
  [47, 1728, 1701],
  [48, 1728, 972],
  [49, 1728, 972],
  [50, 1728, 972],
  [51, 1728, 972],
  [52, 1728, 972],
  [53, 1728, 972],
  [54, 1728, 972],
] as const;

export default function PandaPhotoPickerProjectPage() {
  return (
    <main className={styles.page}>
      <BackButton
        className={styles.backButton}
        fallbackHref="/#projects"
      />
      <div
        className={styles.gallery}
        aria-label="Panda Photo Picker project pages"
      >
        {pages.map(([page, width, height], index) => (
          <img
            key={page}
            className={styles.image}
            src={`/assets/projects/panda-photo-picker/${page}.png`}
            alt={`Panda Photo Picker product design project, source page ${page}, page ${index + 1} of ${pages.length}`}
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
