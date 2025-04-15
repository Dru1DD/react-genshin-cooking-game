import { useRef, useEffect, useState } from 'react'

const MAX_TRY_COUNT = 3;
const SPEED = 3;


const ZONES = [
  {
    start: Math.PI * 0,
    end: Math.PI * 0.5,
    color: 'rgba(0, 255, 0, 0.3)',
    strokeColor: 'rgba(0, 200, 0, 0.8)',
    msg: "ZONE_TYPE.GREEN",
  },
  {
    start: Math.PI * 0.5,
    end: Math.PI * 0.7,
    color: 'rgba(38, 0, 255, 0.3)',
    strokeColor: 'rgba(38, 0, 255, 0.8)',
    msg:" ZONE_TYPE.BLUE",
  },
  {
    start: Math.PI * 0.7,
    end: Math.PI * 1,
    color: 'rgba(0, 255, 0, 0.3)',
    strokeColor: 'rgba(0, 200, 0, 0.8)',
    msg: "ZONE_TYPE.GREEN",
  },
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameCountRef = useRef<number>(0);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const [tryCount, setTryCount] = useState<number>(MAX_TRY_COUNT);
  const [resultMsg, setResultMsg] = useState<string>("");
  
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setCtx(ctx);
  }
  }, [canvasRef]);

  useEffect(() => {
    let animationFrameId = 0;

    if(ctx && isAnimating && tryCount > 0) {
      const render = () => {
        frameCountRef.current++;
        draw(frameCountRef.current);
        animationFrameId = window.requestAnimationFrame(render);
      }

      render();
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [ctx, isAnimating])

  useEffect(() => {
    if(canvasRef.current && ctx) {
      init();
    }
  }, [canvasRef.current, ctx]);

  const init = () => {
    try {
      if(!canvasRef.current || !ctx) return
      drawCircle(canvasRef.current, ctx);
      drawPointer(canvasRef.current, ctx, 0);
    } catch (e) {
      console.log("Error in init(): ", e);
    }
  }
  const draw = (frameCount: number) => {
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    drawCircle(canvasRef.current, ctx);
    drawZones(canvasRef.current, ctx);
    
    const progress = (frameCount * 0.01 * SPEED) % (Math.PI * 2);
    const currentAngle = progress <= Math.PI ? progress : Math.PI * 2 - progress;
    
    drawPointer(canvasRef.current, ctx, -currentAngle);
  }

  const drawCircle = (canvas:HTMLCanvasElement, ctx: CanvasRenderingContext2D ) => {
    try {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const radius = 150;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI, true);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3366FF';
      ctx.stroke();
    } catch (e) {
      console.log("Error in DrawCircle", e);
    }
  }

  const drawPointer = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, currentAngle: number) => {
    try {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;

      const pointerX = centerX + radius * Math.sin(currentAngle);
      const pointerY = centerY + radius * -Math.cos(currentAngle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#3366FF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pointerY, pointerX, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3366FF';
      ctx.fill();
    } catch (e) {
      console.log("Error in DrawPointer", e);
    }
  }

  const drawZones = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    try {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;

      ZONES.forEach(zone => {
        const startAngle = zone.start;
        const endAngle = zone.end;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -startAngle, -endAngle, true);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        ctx.fillStyle = zone.color;
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = zone.strokeColor;
        ctx.stroke();
      });
    } catch (e) {
      console.log("Error in drawZones", e);
    }
  }

  const handleStart = () => {
    frameCountRef.current = 0;
    setIsAnimating(true);
  }


  const getZoneMsg = (currentAngle: number): string => {
    for (const zone of ZONES) {
      console.table({
        Zone: zone.msg,
        Start: zone.start,
        End: zone.end,
        CurrentAngle: currentAngle,
      });
      if (currentAngle >= zone.start && currentAngle <= zone.end) {
        return zone.msg;
      }
    }
    
    return "Green";
  }


  const checkZones = () => {

    const progress = (frameCountRef.current * 0.01 * SPEED) % (Math.PI * 2);
    const currentAngle = progress <= Math.PI ? progress : Math.PI * 2 - progress;
     
    console.table({progress, currentAngle});
    const msg = getZoneMsg(Math.abs(currentAngle));
    setResultMsg(msg);
  }

  const handleStop = () => {
    if(!isAnimating) return;

    void checkZones();
    setIsAnimating(false);

    setTryCount((prev) => {
      if(prev === 0) {
        return prev
      } 
      return prev - 1;
    });

    void openDialog();
  }

  const resetGame = () => {
    setTryCount(MAX_TRY_COUNT);

    tryAgain();
  }

  const tryAgain = () => {
    if(!dialogRef.current) return;

    dialogRef.current.close();
  }

  const openDialog = () => {
    if(!dialogRef.current) return;

    dialogRef.current.showModal();
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center">
        <h1>Tries {tryCount} / {MAX_TRY_COUNT}</h1>
        <canvas 
          ref={canvasRef}
          className='border border-red'
          width={600}
          height={600}
        />
          <div className='mt-5 w-full flex justify-evenly items-center'>
          <button 
            onClick={handleStart}
            className='px-4 py-2 font-semibold border-2 border-primary rounded-lg bg-primary text-white w-full'
          >
            Start
          </button>
          <button 
            onClick={handleStop}
            className='px-4 py-2 font-semibold border-2 border-accent rounded-lg bg-accent text-white w-full mr-5'
          >
            Stop
          </button>
        </div>
      </div>

      <dialog ref={dialogRef}>
        <p>Your color is {resultMsg}</p>
        <div className="">
        <button 
          onClick={tryAgain}
          className='px-4 py-2 font-semibold border-2 border-primary rounded-lg bg-primary text-white w-full mt-4'
        >
          Try Again
        </button>
        <button 
          onClick={resetGame}
          className='px-4 py-2 font-semibold border-2 border-black rounded-lg bg-transparent text-white w-full mt-4'
        >
          Reset game
        </button>
        </div>
      </dialog>
    </div>
  )
}

export default App
