import type { Metadata } from "next";
import CountUp from "./CountUp";
import ContactLanyard from "./ContactLanyard";
import ExperienceStack from "./ExperienceStack";
import StoryMotion from "./StoryMotion";

export const metadata: Metadata = {
  title: "Tang Xinyi — UX & Interaction Designer",
  description:
    "Portfolio of Tang Xinyi, an interaction designer based in Wuxi, China.",
};

const contents = [
  ["01", "About Me", "#about"],
  ["02", "Experience", "#experience"],
  ["03", "Projects", "#skills"],
  ["04", "More", "#contact"],
];

const experience = [
  {
    id: "tencent",
    imageSrc: "/assets/experience-tencent.png",
    alt: "Tencent — UI Design, CSIG Interaction Designer",
    width: 1592,
    height: 1086,
  },
  {
    id: "meituan",
    imageSrc: "/assets/experience-meituan.png",
    alt: "Meituan (Dianping) — UI and UX Design, Dianping UX Experience Designer",
    width: 1606,
    height: 1090,
  },
  {
    id: "xiaohongshu",
    imageSrc: "/assets/experience-xiaohongshu.png",
    alt: "Xiaohongshu (RED) — Experience Design, Commerce Experience Designer",
    width: 1606,
    height: 1086,
  },
];

const skills = [
  {
    glyph: "◎",
    name: "Interaction Design",
    text: "End-to-end flow design with meticulous attention to micro-interactions, feedback loops, and system consistency across platforms.",
    tags: ["Figma", "Axure", "ProtoPie"],
  },
  {
    glyph: "◈",
    name: "User Research",
    text: "Mixed-methods research — qualitative interviews, usability testing, and quantitative analysis — to surface actionable insights that drive design decisions.",
    tags: ["User Interviews", "A/B Testing", "Surveys"],
  },
  {
    glyph: "▣",
    name: "Information Architecture",
    text: "Structuring complex product ecosystems into clear navigational hierarchies and logical content models that users find intuitive.",
    tags: ["Card Sorting", "Sitemap", "Flow Mapping"],
  },
  {
    glyph: "⬡",
    name: "Data-Driven Design",
    text: "Translating product metrics (CVR, PV, retention) into design hypotheses; closing the loop between design decisions and measurable outcomes.",
    tags: ["Mixpanel", "Excel", "SQL basics"],
  },
  {
    glyph: "Aa",
    name: "Visual & UI Design",
    text: "Crafting high-fidelity interfaces with rigorous typography, spacing systems, and component libraries that scale across entire products.",
    tags: ["Figma", "Mastergo", "PS / AI"],
  },
  {
    glyph: "◇",
    name: "AI Integration",
    text: "Researching and prototyping AI-native experiences — from generative image pipelines to conversational UI — with a grounded design perspective.",
    tags: ["Stable Diffusion", "LLM UX", "Vibe Coding"],
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{children}</span>
      <i />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <input className="menu-toggle" id="menu-toggle" type="checkbox" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Back to top">
          TXY<span>.</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#contents">Contents</a>
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <label className="menu-button" htmlFor="menu-toggle">
          <span className="open-copy">Menu</span>
          <span className="close-copy">Close</span>
        </label>
      </header>

      <aside className="mobile-menu" aria-label="Mobile navigation">
        {["Contents", "About", "Experience", "Projects", "Skills", "Contact"].map(
          (item) => (
            <a
              href={`#${item === "Projects" ? "skills" : item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ),
        )}
      </aside>

      <div className="story-sequence">
        <StoryMotion />
        <div className="story-visual">
          <div className="story-card">
            <div className="story-face story-hero">
              <img src="/assets/hero.jpg" alt="Tang Xinyi" />
            </div>
            <div className="story-face story-contents" aria-hidden="true">
              <img src="/assets/contents.jpg" alt="" />
            </div>
            <div className="story-face story-about" aria-hidden="true">
              <img src="/assets/about.png" alt="" />
            </div>
          </div>
          <span className="story-about-label">Interaction Designer</span>
        </div>

      <section className="hero" id="top">
        <div className="grid-noise" />
        <div className="story-anchor story-anchor-hero" aria-hidden="true" />
        <div className="hero-name hero-first">Tang</div>
        <div className="hero-name hero-last">Xinyi</div>
        <div className="role-sticker">Interaction Designer</div>
        <p className="hero-role">UX & Interaction Designer</p>
        <div className="availability">
          <span>Based in Wuxi, China</span>
          <i />
          <span>Open to opportunities</span>
          <b />
        </div>
      </section>

      <section className="contents section" id="contents">
        <div className="contents-copy">
          <p className="eyebrow">Index / Contents</p>
          <h2>
            What&apos;s <em>inside.</em>
          </h2>
          <div className="content-links">
            {contents.map(([number, label, href]) => (
              <a href={href} key={number}>
                <span>{number}</span>
                <strong>{label}</strong>
                <img src="/assets/arrow.svg" alt="" />
              </a>
            ))}
          </div>
        </div>
        <div className="story-anchor story-anchor-contents" aria-hidden="true" />
      </section>

      <section className="about section" id="about">
        <SectionLabel>01 · About</SectionLabel>
        <div className="about-layout">
          <div className="about-copy">
            <h2>Hello, I am</h2>
            <p className="signature">Tangxinyi</p>
            <p className="intro">
              I&apos;m genuinely excited about the chance to meet you soon. Let
              me share a little more about myself to give you a better sense of
              who I am.
            </p>
            <div className="stats">
              {[
                [4, "", "实习次数"],
                [10, "+", "校企合作项目"],
                [40, "+", "设计竞赛获奖"],
                [10, "+", "落地项目"],
              ].map(([value, suffix, label], index) => (
                <div key={label}>
                  <strong>
                    <CountUp
                      to={Number(value)}
                      delay={index * 0.08}
                      duration={1.15}
                    />
                    {suffix}
                  </strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="quick-contact">
              <span>↗&nbsp;&nbsp; WeChat: txy15173126120</span>
              <span>↗&nbsp;&nbsp; 151 7312 6120</span>
            </div>
          </div>
          <div className="about-photo">
            <div className="story-anchor story-anchor-about" aria-hidden="true" />
            <div
              className="story-anchor story-anchor-about-label"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
      </div>

      <div className="marquee" aria-hidden="true">
        <div>
          Interaction Design · &nbsp; User Research · &nbsp; Information
          Architecture · &nbsp; Prototyping · &nbsp; Data-Driven Design ·
          &nbsp; AI Integration · &nbsp; Figma · &nbsp; Service Design · &nbsp;
          Interaction Design · &nbsp; User Research · &nbsp;
        </div>
      </div>

      <section className="experience section" id="experience">
        <SectionLabel>02 · Experience</SectionLabel>
        <ExperienceStack items={experience} />
      </section>

      <section className="skills section" id="skills">
        <SectionLabel>04 · Skills & Strengths</SectionLabel>
        <div className="skills-heading">
          <h2>
            Core <em>Capabilities</em>
          </h2>
          <p>
            Developed through 3 internships at China&apos;s top product
            companies and ongoing academic research.
          </p>
        </div>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <article key={skill.name}>
              <div className="skill-top">
                <span>{skill.glyph}</span>
                <b>0{index + 1}</b>
              </div>
              <h3>{skill.name}</h3>
              <p>{skill.text}</p>
              <div className="tags">
                {skill.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <i className="card-line" />
            </article>
          ))}
        </div>
      </section>

      <footer className="contact section" id="contact">
        <div className="contact-top">
          <SectionLabel>05 · Contact</SectionLabel>
          <span>© 2024 Tang Xinyi</span>
        </div>
        <div className="contact-hero">
          <h2>Let&apos;s</h2>
          <h2 className="outline">create</h2>
          <h2 className="acid">together.</h2>
          <p>
            Open to full-time roles, internships, and collaborations. I&apos;m
            always excited about meaningful work and new conversations.
          </p>
          <div className="contact-actions">
            <a href="mailto:1225933286@qq.com">
              1225933286@qq.com <span>↗</span>
            </a>
            <a className="secondary" href="#">
              Download CV
            </a>
          </div>
        </div>
        <ContactLanyard frontImage="/assets/lanyard/frame-8.png" />
        <div className="contact-bottom">
          <div className="contact-data">
            <span>
              <b>Email</b>
              1225933286@qq.com
            </span>
            <span>
              <b>WeChat</b>
              txy15173126120
            </span>
            <span>
              <b>Phone</b>
              151 7312 6120
            </span>
            <span>
              <b>Location</b>
              Wuxi / Beijing
            </span>
          </div>
          <div className="socials">
            <a href="#">Behance</a>
            <a href="#">LinkedIn</a>
            <a href="#">Figma Community</a>
            <a href="#">微博</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
