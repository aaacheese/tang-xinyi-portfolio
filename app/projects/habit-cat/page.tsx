import type { Metadata } from "next";
import BackButton from "../../experience/xiaohongshu/BackButton";
import styles from "../../experience/xiaohongshu/page.module.css";

export const metadata: Metadata = {
  title: "Habit Cat Product Design — Tang Xinyi",
  description:
    "Habit Cat children's behavior and habit development platform design by Tang Xinyi.",
};

const pages = Array.from({ length: 16 }, (_, index) => index + 62);

export default function HabitCatProjectPage() {
  return (
    <main className={styles.page}>
      <BackButton
        className={styles.backButton}
        fallbackHref="/#projects"
      />
      <div className={styles.gallery} aria-label="Habit Cat project pages">
        {pages.map((page, index) => (
          <img
            key={page}
            className={styles.image}
            src={`/assets/projects/habit-cat/${page}.png`}
            alt={`Habit Cat product design project, page ${index + 1} of ${pages.length}`}
            width={1728}
            height={972}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding={index === 0 ? "sync" : "async"}
          />
        ))}
      </div>
    </main>
  );
}
