import React, { useEffect, useRef } from 'react';
import { AppTheme } from '../types';

interface GlowingOrbProps {
  theme: AppTheme;
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: number;
  interactive?: boolean;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  theme,
  isListening = false,
  isSpeaking = false,
  size = 220,
  interactive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    const count = 180;
    const radius = size * 0.36;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;

      // Pulse multiplier based on audio activity
      const pulseSpeed = isListening ? 0.08 : isSpeaking ? 0.06 : 0.02;
      rotation += pulseSpeed;

      const dynamicRadius =
        radius + (isListening ? Math.sin(rotation * 3) * 8 : isSpeaking ? Math.sin(rotation * 2) * 5 : 0);

      // Central ambient diffuse glow
      const radial = ctx.createRadialGradient(
        centerX,
        centerY,
        dynamicRadius * 0.2,
        centerX,
        centerY,
        dynamicRadius * 1.5
      );
      radial.addColorStop(0, theme.glowColor);
      radial.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw mathematical particle ring / torus inspired by reference image
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rotation;
        // Torus modulation
        const distortion = Math.sin(angle * 4 + rotation * 2) * (isListening ? 14 : 7);
        const r = dynamicRadius + distortion;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * (r * 0.72); // Elliptical 3D tilt

        const depthFactor = (Math.sin(angle) + 1) / 2; // 0 to 1
        const particleSize = Math.max(1, depthFactor * (isListening ? 3.5 : 2.4));
        const alpha = Math.max(0.15, depthFactor * 0.95);

        ctx.fillStyle = theme.primaryColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isListening, isSpeaking, size]);

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
};
