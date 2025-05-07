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
    
    // Updated constants for meteor properties
    const METEOR_COLOR = "#9933FF";
    const METEOR_WIDTH = 6; // Smaller meteors (was 11)
    const METEOR_LENGTH = 80;
    const METEOR_SPEED = 8; // Slower speed (was 10)
    
    // Generate stars for a starry background
    const starCount = 150;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: 1 + Math.random() * 2,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
    
    // Meteor class with consistent opacity
    class Meteor {
      constructor(initialPosition = false, index = 0) {
        this.index = index;
        this.reset(initialPosition);
      }
      
      reset(initialPosition = false) {
        if (initialPosition) {
          const gridX = this.index % 3;
          const gridY = Math.floor(this.index / 3);
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
        
        const angle = Math.PI * 0.25;
        this.speedX = Math.cos(angle) * METEOR_SPEED;
        this.speedY = Math.sin(angle) * METEOR_SPEED;
        
        this.color = METEOR_COLOR;
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
        gradient.addColorStop(0, this.color); // Consistent full opacity at head
        gradient.addColorStop(1, 'rgba(153, 51, 255, 0)'); // Fades to transparent
        
        ctx.strokeStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Fewer meteors
    const meteorCount = 4; // Reduced from 5
    const meteors = Array.from({ length: meteorCount }, (_, i) => new Meteor(true, i));
    
    // Animation function with starry background
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars every frame to maintain visibility
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    }
    
    // Initial setup
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
