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
    
    // Set constants for meteor properties
    const METEOR_COLOR = "#9933FF";
    const METEOR_WIDTH = 11; // Slightly thicker
    const METEOR_LENGTH = 80; // Even longer streaks
    const METEOR_SPEED = 10; // Consistent speed
    
    // Calculate optimal spacing based on screen size
    const screenDiagonal = Math.sqrt(dimensions.width * dimensions.width + dimensions.height * dimensions.height);
    const idealSpacing = screenDiagonal / 5; // Ensure good spacing
    
    // Meteor class
    class Meteor {
      constructor(initialPosition = false, index = 0) {
        this.index = index;
        this.reset(initialPosition);
      }
      
      reset(initialPosition = false) {
        if (initialPosition) {
          // For initial positioning, space them evenly
          const totalMeteors = 5; // Match the number in the array below
          
          // Use the meteor's index to calculate its position in a grid
          const gridX = this.index % 3; // 3 columns
          const gridY = Math.floor(this.index / 3); // Multiple rows
          
          // Create a grid spacing with some randomness
          this.x = (dimensions.width * 0.25) + (gridX * dimensions.width * 0.25) + (Math.random() * dimensions.width * 0.15);
          this.y = (gridY * dimensions.height * 0.3) - (dimensions.height * 0.5) + (Math.random() * dimensions.height * 0.15);
        } else {
          // When resetting, maintain good spacing from other meteors
          if (Math.random() > 0.3) {
            // Enter from top
            this.x = Math.random() * dimensions.width * 1.2;
            this.y = -METEOR_WIDTH * 2;
          } else {
            // Enter from left
            this.x = -METEOR_WIDTH * 2;
            this.y = Math.random() * dimensions.height * 0.6;
          }
        }
        
        this.width = METEOR_WIDTH;
        this.length = METEOR_LENGTH;
        
        // Consistent diagonal direction
        const angle = Math.PI * 0.25; // 45 degrees
        
        // Set speed based on angle
        this.speedX = Math.cos(angle) * METEOR_SPEED;
        this.speedY = Math.sin(angle) * METEOR_SPEED;
        
        this.color = METEOR_COLOR;
        
        // Reduced opacity for darker look
        this.opacity = 0.7 + Math.random() * 0.2;
        
        // Calculate end points for the streak
        this.calculateEndPoints();
      }
      
      calculateEndPoints() {
        // The visible streak runs behind the current position
        const angle = Math.atan2(this.speedY, this.speedX);
        this.endX = this.x - Math.cos(angle) * this.length;
        this.endY = this.y - Math.sin(angle) * this.length;
      }
      
      update() {
        // Move diagonally in a straight line
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Update the end points
        this.calculateEndPoints();
        
        // Reset when out of screen
        if (this.x - this.length > dimensions.width || 
            this.y - this.length > dimensions.height) {
          this.reset();
        }
      }
      
      draw(ctx) {
        ctx.save();
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        
        // Simple fade out effect for the streak
        const gradient = ctx.createLinearGradient(
          this.x, this.y, 
          this.endX, this.endY
        );
        
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(153, 51, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = this.opacity;
        
        // Draw a single streak
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Create fewer meteors with index for positioning
    const meteorCount = 5; // Reduced for more spaced out look
    const meteors = Array.from({ length: meteorCount }, (_, i) => new Meteor(true, i));
    
    // Animation function
    function animate() {
      // Darker fade effect for a more dramatic look
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // More opaque for darker effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    }
    
    // First clear fully, then start animation
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
