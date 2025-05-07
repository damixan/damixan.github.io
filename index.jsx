import { useEffect, useRef, useState } from "react";

export default function MeteorBackground() {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // --- MODIFIED METEOR CONSTANTS ---
    const METEOR_COLOR = "#9933FF";
    const METEOR_WIDTH = 3;      // Smaller
    const METEOR_LENGTH = 50;    // Smaller
    const METEOR_SPEED = 6;      // Slower
    const METEOR_FIXED_OPACITY = 0.8; // Fixed opacity for all meteors

    // --- STAR CONSTANTS ---
    const STAR_COUNT = 150; // Number of stars
    const MIN_STAR_RADIUS = 0.5;
    const MAX_STAR_RADIUS = 1.2;

    // Meteor class
    class Meteor {
      constructor(initialPosition = false, index = 0) {
        this.index = index;
        this.reset(initialPosition);
      }

      reset(initialPosition = false) {
        if (initialPosition) {
          // For initial positioning, space them evenly
          // Using 3 columns for initial placement if meteorCount allows
          const columns = 3; 
          const gridX = this.index % columns;
          const gridY = Math.floor(this.index / columns);

          this.x = (dimensions.width * 0.25) + (gridX * dimensions.width * 0.25) + (Math.random() * dimensions.width * 0.15);
          this.y = (gridY * dimensions.height * 0.3) - (dimensions.height * 0.5) + (Math.random() * dimensions.height * 0.15);
        } else {
          if (Math.random() > 0.3) {
            this.x = Math.random() * dimensions.width * 1.2;
            this.y = -METEOR_WIDTH * 2;
          } else {
            this.x = -METEOR_WIDTH * 2;
            this.y = Math.random() * dimensions.height * 0.6;
          }
        }

        this.width = METEOR_WIDTH;
        this.length = METEOR_LENGTH;

        const angle = Math.PI * 0.25; // 45 degrees
        this.speedX = Math.cos(angle) * METEOR_SPEED;
        this.speedY = Math.sin(angle) * METEOR_SPEED;

        this.color = METEOR_COLOR;
        this.opacity = METEOR_FIXED_OPACITY; // Use fixed opacity

        this.calculateEndPoints();
      }

      calculateEndPoints() {
        const angle = Math.atan2(this.speedY, this.speedX);
        this.endX = this.x - Math.cos(angle) * this.length;
        this.endY = this.y - Math.sin(angle) * this.length;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.calculateEndPoints();

        if (this.x - this.length > dimensions.width ||
            this.y - this.length > dimensions.height) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';

        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.endX, this.endY
        );

        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(153, 51, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.globalAlpha = this.opacity; // Apply fixed meteor opacity

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        ctx.restore();
      }
    }

    // --- STAR CLASS ---
    class Star {
      constructor() {
        this.x = Math.random() * dimensions.width;
        this.y = Math.random() * dimensions.height;
        this.radius = MIN_STAR_RADIUS + Math.random() * (MAX_STAR_RADIUS - MIN_STAR_RADIUS);
        // Individual star opacity for varied brightness/twinkle
        this.opacity = 0.4 + Math.random() * 0.6; // Random initial opacity (0.4 to 1.0)
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create fewer meteors
    const meteorCount = 3; // Reduced amount
    const meteors = Array.from({ length: meteorCount }, (_, i) => new Meteor(true, i));

    // Create stars
    const stars = Array.from({ length: STAR_COUNT }, () => new Star());

    // Animation function
    function animate() {
      // Fading effect for trails and starry sky background
      // A lower alpha value makes trails longer and stars more persistent
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      // No ctx.save/restore needed here if only fillStyle and path are used per star
      stars.forEach(star => star.draw(ctx));

      // Update and draw meteors
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(ctx);
      });

      requestAnimationFrame(animate);
    }

    // Initial clear to black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw initial set of stars so they are visible from the start
    stars.forEach(star => star.draw(ctx));
    
    animate();

  }, [dimensions]);

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
