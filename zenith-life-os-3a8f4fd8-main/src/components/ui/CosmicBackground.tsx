import { useEffect, useRef } from "react";

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; z: number }[] = [];
    const numStars = 800;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width * 2 - width,
        y: Math.random() * height * 2 - height,
        z: Math.random() * width,
      });
    }

    let animationFrameId: number;

      let mouseX = width / 2;
      let mouseY = height / 2;
      let targetX = mouseX;
      let targetY = mouseY;

      const handleMouseMove = (e: MouseEvent) => {
        targetX = e.clientX;
        targetY = e.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove);

      const draw = () => {
        ctx.fillStyle = "#000000"; // Deep black background
        ctx.fillRect(0, 0, width, height);

        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        const centerX = width / 2;
        const centerY = height / 2;

        const offsetX = (mouseX - centerX) * 0.05;
        const offsetY = (mouseY - centerY) * 0.05;

        for (let i = 0; i < numStars; i++) {
          const star = stars[i];

          star.z -= 0.8; // Faster speed for better 3D effect

          if (star.z <= 0) {
            star.x = Math.random() * width * 2 - width;
            star.y = Math.random() * height * 2 - height;
            star.z = width;
          }

          const x = centerX + (star.x / star.z) * width - offsetX * (width / star.z);
          const y = centerY + (star.y / star.z) * width - offsetY * (width / star.z);
          const radius = Math.max(0.1, (1 - star.z / width) * 2.5);
          const opacity = Math.max(0, 1 - star.z / width);

          if (x >= 0 && x <= width && y >= 0 && y <= height) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        animationFrameId = requestAnimationFrame(draw);
      };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "#000" }}
    />
  );
}
