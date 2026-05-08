import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Added onProgress to the props definition
export default function BaiterekGame({ onWin, onProgress }: { onWin: () => void, onProgress?: (p: number) => void }) {
    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPressing && progress < 100) {
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    const next = prev + 1;
                    
                    // Trigger Camel facts at specific progress points
                    if (onProgress) {
                        if (next === 1) onProgress(1);   // Just started
                        if (next === 50) onProgress(2);  // Halfway point
                    }
                    
                    return next;
                });
            }, 30);
        }
        return () => clearInterval(timer);
    }, [isPressing, progress, onProgress]); // Added onProgress to dependency array

    useEffect(() => {
        if (progress === 100) {
            setTimeout(onWin, 1000);
        }
    }, [progress, onWin]);

    return (
        <div className="flex flex-col items-center justify-center w-full py-8">
            <div className="text-center mb-10">
                <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Байтерек</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Приложи руку к золотому отпечатку</p>
            </div>

            <div className="relative flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: isPressing ? [1, 1.2, 1] : 1,
                        opacity: isPressing ? [0.2, 0.5, 0.2] : 0
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute w-80 h-80 bg-yellow-400 rounded-full blur-3xl"
                />

                <motion.button
                    onMouseDown={() => setIsPressing(true)}
                    onMouseUp={() => setIsPressing(false)}
                    onMouseLeave={() => setIsPressing(false)}
                    onTouchStart={() => setIsPressing(true)}
                    onTouchEnd={() => setIsPressing(false)}
                    className={`relative z-10 w-72 h-72 rounded-full border-8 transition-all duration-500 flex items-center justify-center ${progress === 100 ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-slate-900'
                        } shadow-[0_0_50px_rgba(234,179,8,0.3)]`}
                >
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="144" cy="144" r="130"
                            stroke="rgba(234, 179, 8, 0.2)"
                            strokeWidth="12" fill="transparent"
                        />
                        <motion.circle
                            cx="144" cy="144" r="130"
                            stroke="#EAB308"
                            strokeWidth="12" fill="transparent"
                            strokeDasharray="817"
                            strokeDashoffset={817 - (817 * progress) / 100}
                        />
                    </svg>

                    <span className="text-8xl select-none">
                        {progress === 100 ? '🇰🇿' : '✋'}
                    </span>
                </motion.button>
            </div>

            <div className="mt-12 text-center">
                <div className="text-6xl font-black text-slate-800 tabular-nums">
                    {progress}%
                </div>
                <div className="w-64 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <motion.div
                        className="h-full bg-yellow-500"
                        animate={{ width: ${progress}% }}
                    />
                </div>
            </div>
        </div>
    );
}
