/* eslint-disable react/no-unknown-property */
"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Canvas,
  extend,
  useFrame,
  type ThreeElement,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

const CARD_MODEL = "/assets/lanyard/card.glb";
const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

type ContactLanyardProps = {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class LanyardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function createCardTexture(side: "front" | "back") {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1510;
  const context = canvas.getContext("2d");
  if (!context) return BLANK_PIXEL;

  const acid = "#d4ff3c";
  const black = "#080908";
  const paper = "#f2ede4";
  const muted = "#777367";

  context.fillStyle = side === "front" ? acid : black;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle =
    side === "front" ? "rgba(8, 9, 8, 0.12)" : "rgba(212, 255, 60, 0.12)";
  context.lineWidth = 2;
  for (let x = 0; x <= canvas.width; x += 84) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 84) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  if (side === "front") {
    context.fillStyle = black;
    context.font = '900 150px Georgia, "Times New Roman", serif';
    context.fillText("TXY.", 92, 250);

    context.font = "600 32px monospace";
    context.letterSpacing = "8px";
    context.fillText("IDENTITY / 2026", 96, 355);

    context.fillStyle = black;
    context.font = '900 112px Georgia, "Times New Roman", serif';
    context.letterSpacing = "0px";
    context.fillText("Tang", 92, 850);
    context.fillText("Xinyi", 92, 970);

    context.font = "600 34px monospace";
    context.letterSpacing = "3px";
    context.fillText("UX & INTERACTION", 96, 1090);
    context.fillText("DESIGNER", 96, 1142);

    context.fillStyle = "rgba(8, 9, 8, 0.62)";
    context.font = "500 27px sans-serif";
    context.letterSpacing = "1px";
    context.fillText("WUXI / BEIJING", 96, 1350);

    context.fillStyle = black;
    context.beginPath();
    context.arc(860, 1350, 17, 0, Math.PI * 2);
    context.fill();
  } else {
    context.fillStyle = acid;
    context.font = "600 30px monospace";
    context.letterSpacing = "8px";
    context.fillText("CONTACT", 94, 225);

    context.fillStyle = paper;
    context.font = '900 88px Georgia, "Times New Roman", serif';
    context.letterSpacing = "0px";
    context.fillText("Let’s create", 92, 520);
    context.fillText("together.", 92, 620);

    const rows = [
      ["EMAIL", "1225933286@qq.com"],
      ["WECHAT", "txy15173126120"],
      ["PHONE", "151 7312 6120"],
    ];
    rows.forEach(([label, value], index) => {
      const y = 850 + index * 145;
      context.fillStyle = muted;
      context.font = "600 24px monospace";
      context.letterSpacing = "5px";
      context.fillText(label, 96, y);
      context.fillStyle = paper;
      context.font = "500 31px sans-serif";
      context.letterSpacing = "0px";
      context.fillText(value, 96, y + 49);
    });

    context.fillStyle = acid;
    context.beginPath();
    context.arc(860, 1350, 17, 0, Math.PI * 2);
    context.fill();
  }

  return canvas.toDataURL("image/png");
}

function createLanyardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 250;
  const context = canvas.getContext("2d");
  if (!context) return BLANK_PIXEL;

  context.fillStyle = "#070807";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#d4ff3c";
  context.font = "700 54px monospace";
  context.textBaseline = "middle";
  context.letterSpacing = "4px";
  context.fillText("TXY · INTERACTION DESIGN · TXY ·", 24, 125);
  return canvas.toDataURL("image/png");
}

function StaticLanyard() {
  return (
    <div className="contact-lanyard-static" aria-hidden="true">
      <div className="contact-lanyard-static-card">
        <b>TXY.</b>
        <span>IDENTITY / 2026</span>
        <strong>
          Tang
          <br />
          Xinyi
        </strong>
        <small>UX &amp; INTERACTION DESIGNER</small>
        <em>WUXI / BEIJING</em>
      </div>
    </div>
  );
}

export default function ContactLanyard({
  position = [0, 0, 22],
  gravity = [0, -40, 0],
  fov = 20,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
}: ContactLanyardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [useStatic, setUseStatic] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateMode = () => {
      const probe = document.createElement("canvas");
      const hasWebGL = Boolean(
        probe.getContext("webgl2") || probe.getContext("webgl"),
      );
      setIsMobile(window.innerWidth < 768);
      setIsCompact(window.innerWidth < 1025);
      setUseStatic(reducedMotion.matches || !hasWebGL);
      setMounted(true);
    };

    updateMode();
    reducedMotion.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);

    return () => {
      reducedMotion.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasDropped) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.32) {
          setHasDropped(true);
          observer.disconnect();
        }
      },
      { threshold: [0.32] },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasDropped]);

  const generatedFront = useMemo(
    () => (mounted ? createCardTexture("front") : BLANK_PIXEL),
    [mounted],
  );
  const generatedBack = useMemo(
    () => (mounted ? createCardTexture("back") : BLANK_PIXEL),
    [mounted],
  );
  const generatedLanyard = useMemo(
    () => (mounted ? createLanyardTexture() : BLANK_PIXEL),
    [mounted],
  );

  const fallback = <StaticLanyard />;

  return (
    <div
      ref={containerRef}
      className="contact-lanyard"
      role="img"
      aria-label="Interactive identity badge. Drag the badge and release it to watch it swing back."
    >
      {!mounted || useStatic ? (
        fallback
      ) : (
        <LanyardErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Canvas
              camera={{
                position: isMobile
                  ? [position[0], position[1], position[2] * 1.25]
                  : position,
                fov,
              }}
              dpr={[1, isMobile ? 1.5 : 2]}
              gl={{ alpha: true, antialias: !isMobile }}
              onCreated={({ gl }) =>
                gl.setClearColor(new THREE.Color(0x000000), 0)
              }
            >
              <ambientLight intensity={Math.PI} />
              <Physics
                gravity={gravity}
                paused={!hasDropped}
                timeStep={isMobile ? 1 / 30 : 1 / 60}
              >
                <Band
                  isMobile={isMobile}
                  horizontalOffset={isCompact ? 0 : 2.2}
                  frontImage={frontImage || generatedFront}
                  backImage={backImage || generatedBack}
                  imageFit={imageFit}
                  lanyardImage={lanyardImage || generatedLanyard}
                  lanyardWidth={lanyardWidth}
                />
              </Physics>
              <Environment blur={0.75}>
                <Lightformer
                  intensity={2}
                  color="white"
                  position={[0, -1, 5]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={3}
                  color="white"
                  position={[-1, -1, 1]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={3}
                  color="#d4ff3c"
                  position={[1, 1, 1]}
                  rotation={[0, 0, Math.PI / 3]}
                  scale={[100, 0.1, 1]}
                />
                <Lightformer
                  intensity={10}
                  color="white"
                  position={[-10, 0, 14]}
                  rotation={[0, Math.PI / 2, Math.PI / 3]}
                  scale={[100, 10, 1]}
                />
              </Environment>
            </Canvas>
          </Suspense>
        </LanyardErrorBoundary>
      )}
      <span className="contact-lanyard-hint" aria-hidden="true">
        Drag &amp; release
      </span>
    </div>
  );
}

type BandProps = {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  horizontalOffset?: number;
  frontImage: string;
  backImage: string;
  imageFit: "cover" | "contain";
  lanyardImage: string;
  lanyardWidth: number;
};

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  horizontalOffset = 0,
  frontImage,
  backImage,
  imageFit,
  lanyardImage,
  lanyardWidth,
}: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<RapierRigidBody>(null!);
  const joint1 = useRef<LanyardRigidBody>(null!);
  const joint2 = useRef<LanyardRigidBody>(null!);
  const joint3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);

  const vectors = useMemo(
    () => ({
      vec: new THREE.Vector3(),
      ang: new THREE.Vector3(),
      rot: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    }),
    [],
  );
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_MODEL) as any;
  const lanyardTexture = useTexture(lanyardImage);
  const frontTexture = useTexture(frontImage || BLANK_PIXEL);
  const backTexture = useTexture(backImage || BLANK_PIXEL);

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;
    const baseImage = baseMap.image as CanvasImageSource & {
      width: number;
      height: number;
    };
    const canvas = document.createElement("canvas");
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    const context = canvas.getContext("2d");
    if (!context) return baseMap;

    context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    const drawFitted = (
      image: CanvasImageSource & { width: number; height: number },
      rect: typeof FRONT_UV_RECT,
    ) => {
      const x = rect.x * canvas.width;
      const y = rect.y * canvas.height;
      const width = rect.w * canvas.width;
      const height = rect.h * canvas.height;
      const fit = imageFit === "contain" ? Math.min : Math.max;
      const scale = fit(width / image.width, height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;

      context.save();
      context.beginPath();
      context.rect(x, y, width, height);
      context.clip();
      context.drawImage(
        image,
        x + (width - drawWidth) / 2,
        y + (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      context.restore();
    };

    drawFitted(frontTexture.image as any, FRONT_UV_RECT);
    drawFitted(backTexture.image as any, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [
    backTexture.image,
    frontTexture.image,
    imageFit,
    materials.base.map,
  ]);

  const getLerped = (body: LanyardRigidBody) => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }
    return body.lerped;
  };

  useRopeJoint(fixed, joint1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(joint1, joint2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(joint2, joint3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(joint3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vectors.vec
        .set(state.pointer.x, state.pointer.y, 0.5)
        .unproject(state.camera);
      vectors.dir
        .copy(vectors.vec)
        .sub(state.camera.position)
        .normalize();
      vectors.vec.add(
        vectors.dir.multiplyScalar(state.camera.position.length()),
      );

      [card, joint1, joint2, joint3, fixed].forEach((body) =>
        body.current?.wakeUp(),
      );
      card.current?.setNextKinematicTranslation({
        x: vectors.vec.x - dragged.x,
        y: vectors.vec.y - dragged.y,
        z: vectors.vec.z - dragged.z,
      });
    }

    if (!fixed.current) return;

    [joint1, joint2].forEach((body) => {
      const lerped = getLerped(body.current);
      const distance = Math.max(
        0.1,
        Math.min(1, lerped.distanceTo(body.current.translation())),
      );
      lerped.lerp(
        body.current.translation(),
        delta * (minSpeed + distance * (maxSpeed - minSpeed)),
      );
    });

    curve.points[0].copy(joint3.current.translation());
    curve.points[1].copy(getLerped(joint2.current));
    curve.points[2].copy(getLerped(joint1.current));
    curve.points[3].copy(fixed.current.translation());
    band.current?.geometry.setPoints(
      curve.getPoints(isMobile ? 16 : 32),
    );

    vectors.ang.copy(card.current.angvel());
    vectors.rot.copy(card.current.rotation());
    card.current.setAngvel(
      {
        x: vectors.ang.x,
        y: vectors.ang.y - vectors.rot.y * 0.25,
        z: vectors.ang.z,
      },
      true,
    );
  });

  curve.curveType = "chordal";
  lanyardTexture.wrapS = lanyardTexture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[horizontalOffset, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={joint1}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={joint2}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={joint3}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(event: ThreeEvent<PointerEvent>) => {
              (event.target as Element).releasePointerCapture(
                event.pointerId,
              );
              setDragged(false);
              setHovered(false);
            }}
            onPointerCancel={() => {
              setDragged(false);
              setHovered(false);
            }}
            onPointerDown={(event: ThreeEvent<PointerEvent>) => {
              (event.target as Element).setPointerCapture(event.pointerId);
              setDragged(
                new THREE.Vector3()
                  .copy(event.point)
                  .sub(vectors.vec.copy(card.current.translation())),
              );
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh
              geometry={nodes.clamp.geometry}
              material={materials.metal}
            />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[
            {
              resolution: new THREE.Vector2(
                1000,
                isMobile ? 2000 : 1000,
              ),
            },
          ]}
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={lanyardTexture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_MODEL);
