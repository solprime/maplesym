import React, { useState, useEffect, useRef } from "react";

// window.webkitAudioContext 타입 안전하게 선언
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export default function RepeatTimerWithSoftBeep() {
  // 시작 타이머
  const [startMin, setStartMin] = useState<number>(0);
  const [startSec, setStartSec] = useState<number>(10);

  // 반복 총 시간
  const [repeatHour, setRepeatHour] = useState<number>(0);
  const [repeatMin, setRepeatMin] = useState<number>(1);

  // 정지 시간
  const [pauseSec, setPauseSec] = useState<number>(5);

  // 상태
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalElapsed, setTotalElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseLeft, setPauseLeft] = useState<number>(0);

  const startTimerSeconds = startMin * 60 + startSec;
  const repeatTotalSeconds = repeatHour * 3600 + repeatMin * 60;

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio API 초기화
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
  }, []);

  // 부드러운 알림음 재생
  const playSoftBell = (duration = 1, frequency = 440, volume = 0.5) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc: OscillatorNode = ctx.createOscillator();
    const gain: GainNode = ctx.createGain();

    osc.type = "sine"; // 부드러운 사인파
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  // 타이머 로직
  useEffect(() => {
    if (!isRunning) return;

    const interval: number = window.setInterval(() => {
      if (totalElapsed >= repeatTotalSeconds) {
        setIsRunning(false);
        setTimeLeft(0);
        setIsPaused(false);
        return;
      }

      if (isPaused) {
        setPauseLeft((prev) => {
          if (prev <= 1) {
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
        return;
      }

      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 알림음 재생 (정지시간과 무관하게)
          playSoftBell();

          if (pauseSec > 0) {
            setIsPaused(true);
            setPauseLeft(pauseSec);
          }

          return startTimerSeconds;
        }
        return prev - 1;
      });

      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    isPaused,
    startTimerSeconds,
    pauseSec,
    totalElapsed,
    repeatTotalSeconds,
  ]);

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  const start = (): void => {
    if (startTimerSeconds <= 0 || repeatTotalSeconds <= 0) return;
    setTimeLeft(startTimerSeconds);
    setTotalElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  const stop = (): void => setIsRunning(false);
  const reset = (): void => {
    setIsRunning(false);
    setTimeLeft(0);
    setTotalElapsed(0);
    setIsPaused(false);
    setPauseLeft(0);
  };

  // 인풋 이벤트 타입 안전하게 처리
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setter(Number(e.target.value));
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">심타이머</h1>

      {/* 시작 타이머 */}
      <div className="flex gap-4 mb-4">
        <span className="self-center">심 지속시간은</span>
        <input
          type="number"
          min="0"
          placeholder="분"
          value={startMin}
          onChange={handleInputChange(setStartMin)}
          className="w-13 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-1 self-center">분</span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="초"
          value={startSec}
          onChange={handleInputChange(setStartSec)}
          className="w-13 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-2 self-center">초 에요</span>
      </div>

      {/* 반복 총 시간 */}
      <div className="flex gap-4 mb-4">
        <span className="self-center">사냥 한 타임은</span>
        <input
          type="number"
          min="0"
          placeholder="시간"
          value={repeatHour}
          onChange={handleInputChange(setRepeatHour)}
          className="w-13 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="ml-1 self-center">시간 </span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="분"
          value={repeatMin}
          onChange={handleInputChange(setRepeatMin)}
          className="w-13 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="ml-1 self-center">분 이에요</span>
      </div>

      {/* 정지 시간 */}
      <div className="flex gap-4 mb-6">
        <span className="self-center">버프교환 시간은</span>
        <input
          type="number"
          min="0"
          placeholder="정지 시간(초)"
          value={pauseSec}
          onChange={handleInputChange(setPauseSec)}
          className="w-13 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <span className="ml-2 self-center">초에요</span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={start}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          시작
        </button>
        <button
          onClick={stop}
          disabled={!isRunning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
        >
          정지
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          초기화
        </button>
      </div>

      {/* 타이머 표시 */}
      <h2 className="text-5xl font-mono">
        {displayMinutes.toString().padStart(2, "0")}:
        {displaySeconds.toString().padStart(2, "0")}
      </h2>

      <p className="mt-2 text-gray-600">
        남은 시간:{" "}
        {`${Math.floor(Math.max(repeatTotalSeconds - totalElapsed, 0) / 60 / 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(
          (Math.max(repeatTotalSeconds - totalElapsed, 0) / 60) % 60
        )
          .toString()
          .padStart(2, "0")}`}
      </p>

      {isPaused && <p className="mt-2 text-red-600">버프교환 시간! 🔔</p>}
    </div>
  );
}
