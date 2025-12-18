
import React, { useState, useEffect, useRef } from 'react';
import { Session, Segment } from '../types.ts';
import { TimerDisplay } from './TimerDisplay.tsx';
import { audioService } from '../services/audioService.ts';
import { Play, Pause, SkipForward, Square, ChevronRight, Activity } from 'lucide-react';

interface WorkoutRunnerProps {
  session: Session;
  onFinish: () => void;
  onCancel: () => void;
}

const TrainingProfile = ({ segments, currentIndex }: { segments: Segment[], currentIndex: number }) => {
  const maxVal = 15;
  const height = 40;
  const width = 100;
  const step = width / segments.length;

  return (
    <div className="h-24 mt-8 bg-slate-800/30 rounded-xl overflow-hidden relative border border-slate-700/50">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <path
          d={`M 0 ${height} ${segments.map((s, i) => `L ${i * step} ${height - (s.speed / maxVal) * height} L ${(i + 1) * step} ${height - (s.speed / maxVal) * height}`).join(' ')} L ${width} ${height} Z`}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />
        <path
          d={`M 0 ${height} ${segments.map((s, i) => `L ${i * step} ${height - (s.incline / maxVal) * height} L ${(i + 1) * step} ${height - (s.incline / maxVal) * height}`).join(' ')} L ${width} ${height} Z`}
          fill="rgba(249, 115, 22, 0.1)"
          stroke="#f97316"
          strokeWidth="0.5"
          strokeDasharray="1,1"
        />
        <rect 
          x={currentIndex * step} 
          y="0" 
          width={step} 
          height={height} 
          fill="rgba(255,255,255,0.15)"
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ session, onFinish, onCancel }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentSecondsLeft, setSegmentSecondsLeft] = useState(session.segments[0].duration);
  const [isActive, setIsActive] = useState(true);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  
  const lastTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const totalDuration = session.segments.reduce((acc, s) => acc + s.duration, 0);
  const totalSecondsLeft = Math.max(0, totalDuration - totalSecondsElapsed);
  
  const currentSegment = session.segments[currentSegmentIndex];
  const nextSegment = session.segments[currentSegmentIndex + 1];

  const isAlarming = segmentSecondsLeft <= 5 && segmentSecondsLeft > 0;

  useEffect(() => {
    if (isActive) {
      lastTickRef.current = Date.now();
      const tick = () => {
        const now = Date.now();
        const delta = now - lastTickRef.current;

        if (delta >= 1000) {
          lastTickRef.current = now - (delta % 1000);
          
          setSegmentSecondsLeft((prev) => {
            const newVal = prev - 1;
            
            // Sonidos de cuenta regresiva
            if (newVal <= 5 && newVal > 0) {
              audioService.playCountdownBeep();
            }

            if (newVal <= 0) {
              if (currentSegmentIndex < session.segments.length - 1) {
                audioService.playSegmentEndBeep();
                setCurrentSegmentIndex(idx => idx + 1);
                return session.segments[currentSegmentIndex + 1].duration;
              } else {
                setIsActive(false);
                onFinish();
                return 0;
              }
            }
            return newVal;
          });

          setTotalSecondsElapsed(prev => prev + 1);
        }
        timerRef.current = requestAnimationFrame(tick);
      };
      timerRef.current = requestAnimationFrame(tick);
    } else if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isActive, currentSegmentIndex, session.segments, onFinish]);

  const togglePause = () => setIsActive(!isActive);

  const skipSegment = () => {
    if (currentSegmentIndex < session.segments.length - 1) {
      const skippedTime = segmentSecondsLeft;
      setTotalSecondsElapsed(prev => prev + skippedTime);
      const nextIdx = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIdx);
      setSegmentSecondsLeft(session.segments[nextIdx].duration);
    } else {
      onFinish();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-700 ${isAlarming ? 'bg-red-950/80' : 'bg-slate-900'}`}>
      <div className="flex flex-col h-full max-w-md mx-auto p-6">
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-500 animate-pulse" size={20} />
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{session.name}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tramo {currentSegmentIndex + 1} / {session.segments.length}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 bg-slate-800/80 rounded-full text-slate-400 active:scale-90 transition-transform">
            <Square size={18} fill="currentColor" />
          </button>
        </div>

        <div className="mb-10 text-center">
          <TimerDisplay seconds={totalSecondsLeft} label="Tiempo total para meta" size="sm" color="text-emerald-400" />
        </div>

        <div className={`relative flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-4 transition-all duration-300 ${isAlarming ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-red-500/10 scale-105' : 'border-slate-800 bg-slate-800/40 shadow-xl'}`}>
           <TimerDisplay seconds={segmentSecondsLeft} label="Siguiente cambio en" />
           {isAlarming && (
             <div className="absolute -top-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-bounce">
               ¡PREPÁRATE!
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="bg-slate-800/60 p-5 rounded-3xl border border-slate-700/50 flex flex-col items-center shadow-lg">
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Velocidad</span>
             <span className="text-4xl font-black text-blue-400 tracking-tighter">
               {currentSegment.speed}
               <span className="text-xs font-bold text-slate-600 ml-1">km/h</span>
             </span>
          </div>
          <div className="bg-slate-800/60 p-5 rounded-3xl border border-slate-700/50 flex flex-col items-center shadow-lg">
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Inclinación</span>
             <span className="text-4xl font-black text-orange-500 tracking-tighter">
               {currentSegment.incline}
               <span className="text-xs font-bold text-slate-600 ml-1">%</span>
             </span>
          </div>
        </div>

        <TrainingProfile segments={session.segments} currentIndex={currentSegmentIndex} />

        <div className="mt-6 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black mb-0.5">A continuación</span>
              <span className="text-xs font-bold text-slate-300">
                {nextSegment ? `${nextSegment.speed} km/h • ${nextSegment.incline}% inclinación` : '¡Último tramo! Finalización inminente'}
              </span>
           </div>
           <ChevronRight className="text-slate-700" size={16} />
        </div>

        <div className="mt-auto flex justify-center gap-10 py-8">
          <button 
            onClick={togglePause}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 ${isActive ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-500 text-slate-900 shadow-2xl shadow-emerald-500/40'}`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={skipSegment}
            className="w-20 h-20 rounded-full bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700/50 active:scale-90 transition-all"
          >
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};
