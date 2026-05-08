import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS = {
    wood: { n: 'Дерево', i: 'wood.png' },
    sheep: { n: 'Овца', i: 'sheep.png' },
    sand: { n: 'Песок', i: 'sand.png' },
    burner: { n: 'Горелка', i: 'burner.png' },
    spinningwheel: { n: 'Прялка', i: 'spinningwheel.png' },
    lathe: { n: 'Станок', i: 'lathe.png' },
    knife: { n: 'Нож', i: 'knife.png' },
    window: { n: 'Окно', i: 'window.png' },
    yurt_wood: { n: 'Остов', i: 'yurt_wood.png' },
    wool: { n: 'Шерсть', i: 'asetwool.png' },
    silk: { n: 'Кииз', i: 'silk.png' },
    final_yurt: { n: 'Юрта', i: 'kuizui(yurt).png' }
};

export default function YurtGame({ onWin }: { onWin: () => void }) {
    const [inv, setInv] = useState(['wood', 'sheep', 'sand']);
    const [crafted, setCrafted] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const combine = (tool: string) => {
        if (!selected || isFinished) return;
        const recipes: Record<string, string> = {
            'sand+burner': 'window',
            'wood+spinningwheel': 'yurt_wood',
            'sheep+knife': 'wool',
            'wool+lathe': 'silk'
        };
        const result = recipes[`${selected}+${tool}`];
        if (result) {
            if (result === 'wool' && !inv.includes('wool')) setInv([...inv, 'wool']);
            if (!crafted.includes(result)) setCrafted([...crafted, result]);
            setSelected(null);
        }
    };

    const canAssemble = crafted.includes('window') && crafted.includes('yurt_wood') && crafted.includes('silk');

    return (

        <div className="flex w-full items-stretch justify-between bg-white gap-4">

            {/* ИНСТРУМЕНТЫ */}
            <div className="flex flex-col gap-3 w-28 items-center py-2">
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Инструменты</span>
                {['burner', 'spinningwheel', 'lathe', 'knife'].map(t => (
                    <button key={t} onClick={() => combine(t)} className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[24px] flex flex-col items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95">
                        <img src={`/${ITEMS[t as keyof typeof ITEMS].i}`} className="w-10 h-10 object-contain" />
                        <span className="text-[8px] mt-1 font-bold text-slate-400 uppercase tracking-tighter">{ITEMS[t as keyof typeof ITEMS].n}</span>
                    </button>
                ))}
            </div>

            {/* ЦЕНТР */}
            <div className="flex-1 flex flex-col items-center justify-around min-h-[500px]">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Мастерская юрты</h2>
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">Создай уют своими руками</p>
                </div>

                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-dashed border-slate-50 rounded-full" />
                    <AnimatePresence mode="wait">
                        {isFinished ? (
                            <motion.img key="yurt" src={`/${ITEMS.final_yurt.i}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} className="w-52 h-52 z-10 drop-shadow-xl" />
                        ) : selected ? (
                            <motion.img key={selected} src={`/${ITEMS[selected as keyof typeof ITEMS].i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-24 h-24 z-10 object-contain" />
                        ) : (
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-4">Начни творить,<br />выбрав ресурс</p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-4 p-2 bg-slate-50/50 rounded-2xl">
                    {['window', 'yurt_wood', 'silk'].map(item => (
                        <div key={item} className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${crafted.includes(item) ? 'bg-white border-blue-100 shadow-sm' : 'bg-transparent border-dashed border-slate-200'}`}>
                            {crafted.includes(item) && <img src={`/${ITEMS[item as keyof typeof ITEMS].i}`} className="w-10 h-10 object-contain" />}
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-[240px]">
                    {isFinished ? (
                        <button onClick={onWin} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Завершить</button>
                    ) : canAssemble ? (
                        <motion.button animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity }} onClick={() => setIsFinished(true)} className="w-full py-4 bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-blue-200 shadow-xl">Собрать всё вместе</motion.button>
                    ) : (
                        <div className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">Собери все детали</div>
                    )}
                </div>
            </div>

            {/* РЕСУРСЫ */}
            <div className="flex flex-col gap-3 w-28 items-center py-2">
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">Материалы</span>
                {inv.map(r => (
                    <button key={r} onClick={() => setSelected(r)} className={`w-20 h-20 border-2 rounded-[24px] flex flex-col items-center justify-center transition-all ${selected === r ? 'border-blue-400 bg-white shadow-lg scale-105' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                        <img src={`/${ITEMS[r as keyof typeof ITEMS].i}`} className="w-10 h-10 object-contain" />
                        <span className="text-[8px] mt-1 font-bold text-slate-400 uppercase tracking-tighter">{ITEMS[r as keyof typeof ITEMS].n}</span>
                    </button>
                ))}
            </div>

        </div>
    );
}