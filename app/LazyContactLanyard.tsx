"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ContactLanyard = dynamic(() => import("./ContactLanyard"), {
  ssr: false,
  loading: () => <div className="contact-lanyard" aria-hidden="true" />,
});

export default function LazyContactLanyard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px", threshold: 0 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="contact-lanyard-loader">
      {shouldLoad ? (
        <ContactLanyard frontImage="/assets/lanyard/frame-8.png" />
      ) : (
        <div className="contact-lanyard" aria-hidden="true" />
      )}
    </div>
  );
}
