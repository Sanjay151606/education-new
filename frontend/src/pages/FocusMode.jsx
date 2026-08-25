import { useEffect, useRef, useState } from "react";

export default function FocusMode() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const restart = (mins) => {
    setMinutes(mins);
    setSecondsLeft(mins * 60);
    setRunning(false);
    setDistractions(0);
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-6">
      <h1 className="text-2xl font-bold">Focus Mode 🎯</h1>
      <div className="bg-white rounded-3xl shadow-sm p-10">
        <p className="text-6xl font-mono font-bold text-brain-600">{mm}:{ss}</p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setRunning((r) => !r)} className="bg-brain-500 text-white px-5 py-2 rounded-lg">
            {running ? "Pause" : "Start"}
          </button>
          <button onClick={() => restart(minutes)} className="bg-slate-100 px-5 py-2 rounded-lg">Reset</button>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {[15, 25, 45].map((m) => (
            <button key={m} onClick={() => restart(m)}
              className={`px-3 py-1 rounded-full text-sm ${minutes === m ? "bg-brain-100 text-brain-600" : "bg-slate-50"}`}>
              {m} min
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDistractions((d) => d + 1)}
        className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm"
      >
        Log a distraction ({distractions})
      </button>
      <p className="text-xs text-slate-400">Body-doubling & ambient-noise integrations can plug in here.</p>
    </div>
  );
}
