"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The hero's authored moment.
 *
 * Two things happen here, and both are deliberate:
 *
 * 1. The device sits in a real perspective scene and tilts toward the pointer.
 *    The rotation is driven by a small spring rather than mapped straight from
 *    the cursor, because a direct mapping has no momentum and reads as
 *    computed. The spring keeps velocity through direction changes, which is
 *    what makes it feel like an object.
 *
 * 2. The deal sequence plays once, the first time the device is in view. The
 *    product's whole claim is that a buyer proposes, the proposal is accepted,
 *    and only then does chat open. The device shows that rather than the page
 *    asserting it. The keyframes live in globals.css; this only arms them.
 *
 * The tilt is skipped entirely on touch and coarse pointers, and under reduced
 * motion. The rAF loop starts on pointer entry and stops the moment the device
 * settles back to rest, so nothing runs while the page is idle.
 */
export function DeviceScene({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Arm the deal sequence once, when the device first comes into view.
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-playing");
            observer?.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(scene);
    } else {
      scene.classList.add("is-playing");
    }

    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!scene || !stage) return;
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Spring state. Target, current, velocity, per axis.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let frame = 0;
    let running = false;
    let bounds: DOMRect | null = null;

    const STIFFNESS = 0.1;
    const DAMPING = 0.76;

    const step = () => {
      velocityX = (velocityX + (targetX - currentX) * STIFFNESS) * DAMPING;
      velocityY = (velocityY + (targetY - currentY) * STIFFNESS) * DAMPING;
      currentX += velocityX;
      currentY += velocityY;

      stage.style.transform = `rotateX(${currentY.toFixed(3)}deg) rotateY(${currentX.toFixed(3)}deg)`;

      const atRest =
        Math.abs(velocityX) < 0.002 &&
        Math.abs(velocityY) < 0.002 &&
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01;

      if (atRest && targetX === 0 && targetY === 0) {
        stage.style.transform = "";
        stage.style.willChange = "";
        running = false;
        frame = 0;
        return;
      }

      frame = requestAnimationFrame(step);
    };

    const run = () => {
      if (running) return;
      running = true;
      stage.style.willChange = "transform";
      frame = requestAnimationFrame(step);
    };

    // Measured on entry and on resize, never inside the move handler: reading
    // layout on every pointer event is the usual way this pattern gets slow.
    const measure = () => {
      bounds = scene.getBoundingClientRect();
    };

    const onEnter = () => measure();

    const onMove = (event: PointerEvent) => {
      if (!bounds) measure();
      if (!bounds) return;
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      targetX = x * max * 2;
      targetY = -y * max * 2;
      run();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      run();
    };

    scene.addEventListener("pointerenter", onEnter);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      scene.removeEventListener("pointerenter", onEnter);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  }, [max]);

  return (
    <div ref={sceneRef} className={cn("scene deal-seq", className)}>
      <div
        ref={stageRef}
        className="scene-3d transition-transform duration-500 ease-out"
      >
        {children}
      </div>
    </div>
  );
}
