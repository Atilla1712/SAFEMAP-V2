import React, { useState, useRef, useEffect } from "react";

interface CalculatorProps {
  onExit: () => void;
  language: "id" | "en";
}

export default function Calculator({ onExit, language }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [prevVal, setPrevVal] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);

  // Press-and-Hold State for '=' Button
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTimeRef = useRef<number>(0);

  const handleDigit = (digit: string) => {
    if (display === "0" || resetOnNext) {
      setDisplay(digit);
      setResetOnNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (resetOnNext) {
      setDisplay("0.");
      setResetOnNext(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setPrevVal(null);
    setOperator(null);
    setResetOnNext(false);
  };

  const handleOperator = (op: string) => {
    if (operator && prevVal && !resetOnNext) {
      const current = parseFloat(display);
      const previous = parseFloat(prevVal);
      let result = 0;

      switch (operator) {
        case "+":
          result = previous + current;
          break;
        case "-":
          result = previous - current;
          break;
        case "×":
          result = previous * current;
          break;
        case "÷":
          result = current !== 0 ? previous / current : 0;
          break;
        default:
          return;
      }

      const formattedResult = Number(result.toFixed(8)).toString();
      setDisplay(formattedResult);
      setPrevVal(formattedResult);
      setEquation(`${formattedResult} ${op}`);
    } else {
      setPrevVal(display);
      setEquation(`${display} ${op}`);
    }
    setOperator(op);
    setResetOnNext(true);
  };

  const calculate = () => {
    if (!operator || prevVal === null) return;

    const current = parseFloat(display);
    const previous = parseFloat(prevVal);
    let result = 0;

    switch (operator) {
      case "+":
        result = previous + current;
        break;
      case "-":
        result = previous - current;
        break;
      case "×":
        result = previous * current;
        break;
      case "÷":
        result = current !== 0 ? previous / current : 0;
        break;
      default:
        return;
    }

    const formattedResult = Number(result.toFixed(8)).toString();
    setDisplay(formattedResult);
    setEquation(`${prevVal} ${operator} ${display} =`);
    setPrevVal(null);
    setOperator(null);
    setResetOnNext(true);
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay((current / 100).toString());
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay((current * -1).toString());
  };

  // PRESS AND HOLD LOGIC FOR "=" EXIT USING UNIFIED POINTER EVENTS
  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Only trigger for main pointer button (left click / touch)
    
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    pointerDownTimeRef.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);

    const duration = 3000; // 3 seconds
    const intervalTime = 50; // Update progress every 50ms
    const step = (intervalTime / duration) * 100;

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
          }
          triggerExit();
          return 100;
        }
        return next;
      });
    }, intervalTime);
  };

  const stopHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const pressDuration = Date.now() - pointerDownTimeRef.current;
    
    setIsHolding(false);
    setHoldProgress(0);
    
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    // Differentiate Tap vs Hold
    if (pressDuration < 500 && pointerDownTimeRef.current > 0) {
      calculate();
    }
    
    pointerDownTimeRef.current = 0;
  };

  const triggerExit = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    onExit();
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0F1512] z-50 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm sm:max-w-[360px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl bg-[#141A17] text-white flex flex-col p-6 shadow-2xl relative overflow-hidden border border-white/5 justify-between">
        
        {/* Secret Overlay during hold */}
        {isHolding && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Circular SVG progress track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-[#2C3D34] fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-[#7FA396] fill-none transition-all duration-75"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - holdProgress / 100)}
                />
              </svg>
              <div className="absolute text-sm font-bold text-[#F0EEE8]">
                {Math.ceil(3 - (holdProgress / 100) * 3)}s
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#F0EEE8] mt-6">
              {language === "en" ? "Unlocking SafeMap..." : "Membuka Kunci SafeMap..."}
            </h3>
            <p className="text-xs text-[#8A9590] mt-2 max-w-[280px]">
              {language === "en"
                ? "Keep holding down the button to exit the disguise panel."
                : "Terus tahan tombol untuk menutup penyamaran."}
            </p>
          </div>
        )}

        {/* Display Header */}
        <div className="flex-1 flex flex-col justify-end text-right px-2 pb-4 min-h-[80px]">
          <div className="text-xs text-[#8A9590] h-6 overflow-hidden tracking-wider font-mono">
            {equation}
          </div>
          <div className="text-4xl sm:text-5xl font-light tracking-tight truncate mt-1">
            {display}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#1C2420] rounded-xl p-3 mb-4 border border-white/5">
          <p className="text-[10px] sm:text-[11px] text-[#B8C2BC] leading-relaxed text-center">
            💡 {language === "en" 
              ? "Hold down the '=' button for 3 seconds to return to SafeMap." 
              : "Tahan tombol '=' selama 3 detik untuk kembali ke SafeMap."}
          </p>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 pb-2">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="w-full aspect-square rounded-2xl bg-[#202C26] hover:bg-[#2C3D34] active:scale-95 transition-all text-[#7FA396] font-bold text-base sm:text-lg"
          >
            AC
          </button>
          <button
            onClick={handleToggleSign}
            className="w-full aspect-square rounded-2xl bg-[#202C26] hover:bg-[#2C3D34] active:scale-95 transition-all text-[#7FA396] font-bold text-base sm:text-lg"
          >
            +/-
          </button>
          <button
            onClick={handlePercent}
            className="w-full aspect-square rounded-2xl bg-[#202C26] hover:bg-[#2C3D34] active:scale-95 transition-all text-[#7FA396] font-bold text-base sm:text-lg"
          >
            %
          </button>
          <button
            onClick={() => handleOperator("÷")}
            className="w-full aspect-square rounded-2xl bg-[#5C7A6E] hover:bg-[#7FA396] active:scale-95 transition-all text-[#F0EEE8] font-bold text-lg sm:text-xl"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit("7")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            7
          </button>
          <button
            onClick={() => handleDigit("8")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            8
          </button>
          <button
            onClick={() => handleDigit("9")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            9
          </button>
          <button
            onClick={() => handleOperator("×")}
            className="w-full aspect-square rounded-2xl bg-[#5C7A6E] hover:bg-[#7FA396] active:scale-95 transition-all text-[#F0EEE8] font-bold text-lg sm:text-xl"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit("4")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            4
          </button>
          <button
            onClick={() => handleDigit("5")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            5
          </button>
          <button
            onClick={() => handleDigit("6")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            6
          </button>
          <button
            onClick={() => handleOperator("-")}
            className="w-full aspect-square rounded-2xl bg-[#5C7A6E] hover:bg-[#7FA396] active:scale-95 transition-all text-[#F0EEE8] font-bold text-xl sm:text-2xl"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit("1")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            1
          </button>
          <button
            onClick={() => handleDigit("2")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            2
          </button>
          <button
            onClick={() => handleDigit("3")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            3
          </button>
          <button
            onClick={() => handleOperator("+")}
            className="w-full aspect-square rounded-2xl bg-[#5C7A6E] hover:bg-[#7FA396] active:scale-95 transition-all text-[#F0EEE8] font-bold text-lg sm:text-xl"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit("0")}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="w-full aspect-square rounded-2xl bg-[#1A231F] hover:bg-[#202C26] active:scale-95 transition-all text-[#F0EEE8] text-base sm:text-lg font-medium"
          >
            .
          </button>
          
          {/* Secret "=" Trigger Button with unified Pointer events */}
          <button
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
            className="w-full aspect-square col-span-2 rounded-2xl bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold text-xl sm:text-2xl transition-all shadow-lg shadow-[#7FA396]/10 flex items-center justify-center select-none"
            style={{ touchAction: "none" }}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
