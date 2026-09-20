'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PlinkoGameProps {
  targetSlotIndices: number[];
  onComplete: (multiplier: number) => void;
}

const SLOT_MULTIPLIERS = [10, 5, 2, 1.5, 1, 1.5, 2, 5, 10];
const ROWS = 8;
const COLS = 9;
const BALL_RADIUS = 6; // slightly smaller for multi-ball density
const PEG_RADIUS = 4;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 480;

function getSlotColor(multiplier: number): string {
  if (multiplier >= 10) return '#22c55e';
  if (multiplier >= 5) return '#84cc16';
  if (multiplier >= 2) return 'var(--accent-gold)';
  if (multiplier >= 1.5) return '#f59e0b';
  return '#6b7280';
}

interface Peg {
  x: number;
  y: number;
}

interface BallState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetSlotIndex: number;
  hasLanded: boolean;
  spawnDelayFrames: number;
}

export default function PlinkoGame({ targetSlotIndices, onComplete }: PlinkoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [runningAverage, setRunningAverage] = useState<number>(0);
  const [landedCount, setLandedCount] = useState<number>(0);
  const animationRef = useRef<number>(0);

  const getPegs = useCallback((): Peg[] => {
    const pegs: Peg[] = [];
    const startY = 80;
    const rowSpacing = (CANVAS_HEIGHT - 140) / ROWS;
    const pegAreaWidth = CANVAS_WIDTH - 80;

    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row % 2 === 0 ? COLS : COLS - 1;
      const offset = row % 2 === 0 ? 0 : pegAreaWidth / (COLS) / 2;
      for (let col = 0; col < pegsInRow; col++) {
        const x = 40 + offset + (col * pegAreaWidth) / (pegsInRow - 1 || 1);
        const y = startY + row * rowSpacing;
        pegs.push({ x, y });
      }
    }
    return pegs;
  }, []);

  const getSlotPositions = useCallback(() => {
    const slots: { x: number; width: number }[] = [];
    const slotWidth = (CANVAS_WIDTH - 40) / COLS;
    for (let i = 0; i < COLS; i++) {
      slots.push({
        x: 20 + i * slotWidth,
        width: slotWidth,
      });
    }
    return slots;
  }, []);

  const drawBoard = useCallback(
    (ctx: CanvasRenderingContext2D, balls: BallState[], activePegs: Set<number>) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, '#0a0a0a');
      bgGrad.addColorStop(1, '#111111');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pegs
      const pegs = getPegs();
      pegs.forEach((peg, i) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        if (activePegs.has(i)) {
          ctx.fillStyle = '#60a5fa';
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#333333';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Slots
      const slots = getSlotPositions();
      slots.forEach((slot, i) => {
        const mult = SLOT_MULTIPLIERS[i];
        const color = getSlotColor(mult);

        ctx.fillStyle = `${color}15`;
        ctx.fillRect(slot.x + 2, CANVAS_HEIGHT - 40, slot.width - 4, 36);

        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth = 1;
        ctx.strokeRect(slot.x + 2, CANVAS_HEIGHT - 40, slot.width - 4, 36);

        ctx.fillStyle = color;
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mult}×`, slot.x + slot.width / 2, CANVAS_HEIGHT - 22);
      });

      // Active Balls
      balls.forEach((ball) => {
        if (ball.hasLanded || ball.spawnDelayFrames > 0) return;

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(
          ball.x - 2,
          ball.y - 2,
          1,
          ball.x,
          ball.y,
          BALL_RADIUS
        );
        ballGrad.addColorStop(0, '#fff');
        ballGrad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = ballGrad;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fill();
      });
    },
    [getPegs, getSlotPositions]
  );

  const dropBalls = useCallback(() => {
    if (started) return;
    setStarted(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pegs = getPegs();
    const slots = getSlotPositions();

    // Prepare ball list with staggered delays (spawn in small batches)
    const initialBalls: BallState[] = targetSlotIndices.map((targetIdx, index) => {
      const targetSlot = slots[targetIdx];
      const targetX = targetSlot.x + targetSlot.width / 2;
      const startX = CANVAS_WIDTH / 2 + (targetX - CANVAS_WIDTH / 2) * 0.3 + (Math.random() - 0.5) * 30;

      return {
        id: index,
        x: startX,
        y: 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0,
        targetSlotIndex: targetIdx,
        hasLanded: false,
        // Stagger spawning in small batches of 3-5 balls
        spawnDelayFrames: Math.floor(index / 3) * 20,
      };
    });

    const gravity = 0.28;
    const damping = 0.65;
    const activePegs = new Set<number>();
    const balls = [...initialBalls];
    let landedMultipliers: number[] = [];

    const animate = () => {
      let allLanded = true;

      balls.forEach((ball) => {
        if (ball.hasLanded) return;

        if (ball.spawnDelayFrames > 0) {
          ball.spawnDelayFrames--;
          allLanded = false;
          return;
        }

        allLanded = false;

        // Physics
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Soft guide force to target
        const targetSlot = slots[ball.targetSlotIndex];
        const targetX = targetSlot.x + targetSlot.width / 2;
        const bias = (targetX - ball.x) * 0.009;
        ball.vx += bias;

        // Wall collisions
        if (ball.x < BALL_RADIUS + 20) {
          ball.x = BALL_RADIUS + 20;
          ball.vx = Math.abs(ball.vx) * damping;
        }
        if (ball.x > CANVAS_WIDTH - BALL_RADIUS - 20) {
          ball.x = CANVAS_WIDTH - BALL_RADIUS - 20;
          ball.vx = -Math.abs(ball.vx) * damping;
        }

        // Peg bounces
        pegs.forEach((peg, pi) => {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = BALL_RADIUS + PEG_RADIUS;

          if (dist < minDist) {
            activePegs.add(pi);
            setTimeout(() => activePegs.delete(pi), 150);

            const nx = dx / dist;
            const ny = dy / dist;
            ball.x = peg.x + nx * minDist;
            ball.y = peg.y + ny * minDist;

            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;

            ball.vx *= damping;
            ball.vy *= damping;
            ball.vx += (Math.random() - 0.5) * 0.6;
          }
        });

        // Landing check
        if (ball.y >= CANVAS_HEIGHT - 50) {
          ball.hasLanded = true;
          const mult = SLOT_MULTIPLIERS[ball.targetSlotIndex];
          landedMultipliers.push(mult);

          // Update live running stats
          const avg = landedMultipliers.reduce((sum, val) => sum + val, 0) / landedMultipliers.length;
          setRunningAverage(Math.round(avg * 100) / 100);
          setLandedCount(landedMultipliers.length);
        }
      });

      drawBoard(ctx, balls, activePegs);

      if (allLanded) {
        const finalAvg = landedMultipliers.reduce((sum, val) => sum + val, 0) / landedMultipliers.length;
        const roundedFinal = Math.round(finalAvg * 100) / 100;
        setFinished(true);
        onComplete(roundedFinal);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [started, targetSlotIndices, onComplete, getPegs, getSlotPositions, drawBoard]);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBoard(ctx, [], new Set());
  }, [drawBoard]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Running average stats */}
      {started && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            Balls Landed: <strong style={{ color: '#fff' }}>{landedCount} / {targetSlotIndices.length}</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Running Average: <strong style={{ color: 'var(--accent-gold)' }}>{runningAverage}×</strong>
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="plinko-canvas"
        style={{
          border: '1px solid var(--border)',
          maxWidth: '100%',
        }}
      />

      {!started && (
        <button
          className="btn-primary"
          onClick={dropBalls}
          style={{
            fontSize: '1.05rem',
            padding: '12px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span></span> Drop {targetSlotIndices.length} Balls!
        </button>
      )}

      {finished && (
        <div
          className="animate-slide-up"
          style={{
            textAlign: 'center',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(245, 166, 35, 0.1)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
             PLINKO COMPLETE
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--accent-gold)',
            }}
          >
            {runningAverage}× Average Multiplier
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Calculated across {targetSlotIndices.length} balls
          </div>
        </div>
      )}
    </div>
  );
}
