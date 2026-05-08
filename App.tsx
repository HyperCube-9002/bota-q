/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map as MapIcon,
  BookOpen,
  Settings,
  Users,
  Coins,
  X,
  ChevronRight,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import YurtGame from './yurtgame';
import BaiterekGame from './BaiterekGame';

// --- Types ---
type Interest = '🚀 Техника' | '🎨 Арт' | '🐾 Природа' | '📜 История';
type Lang = 'ru' | 'kz';

interface UserState {
  name: string;
  age: string;
  interests: Interest[];
  coins: number;
  completedNodes: string[];
  avatar: string;
  lang: Lang;
}

interface Node {
  id: string;
  icon: string;
  name: { ru: string, kk: string };
  top: string;
  left: string;
  description: string;
}

// --- Constants ---
const TRANSLATIONS = {
  ru: {
    title: 'Bota Quest',
    subtitle: 'Твое приключение начинается здесь!',
    namePlaceholder: 'Твое имя',
    agePlaceholder: 'Твой возраст',
    goBtn: 'ПОЕХАЛИ!',
    hero: 'Герой',
    momBtn: 'Маме',
    bookBtn: 'КНИГА ОТКРЫТИЙ',
    parentTitle: 'Вход для родителей',
    parentConfirm: 'Подтвердите, что вы взрослый:',
    parentLogin: 'ВОЙТИ',
    heroTitle: 'Твой Герой',
    save: 'СОХРАНИТЬ',
    quest: 'Квест',
    questStart: 'ПРОЙТИ КВЕСТ 🚀',
    collection: 'Твоя Коллекция',
    amazing: 'Керемет!',
    reward: 'коинов и стикер',
    unlockedFirst: 'Сначала пройди предыдущий уровень!',
    alreadyDone: 'Ты уже получил награду за этот уровень!',
    fillAll: 'Заполни все поля, Герой!',
    botWelcome: 'Давай исследуем Казахстан!',
    almaty_desc: 'Город яблок и высоких гор. Здесь находится самый большой каток — Медеу!',
    shymkent_desc: 'Город-сад с древней историей и самыми гостеприимными людьми!',
    astana_desc: 'Современная столица в самом сердце степи. Город будущего!',
    baiterek_desc: 'Золотое гнездо птицы Самрук. Здесь исполняются самые заветные желания!'
  },
  kk: {
    title: 'Bota Quest',
    subtitle: 'Сенің шытырман оқиғаң осы жерден басталады!',
    namePlaceholder: 'Сенің есімің',
    agePlaceholder: 'Сенің жасың',
    goBtn: 'КЕТТІК!',
    hero: 'Батыр',
    momBtn: 'Анаға',
    bookBtn: 'АШЫЛУЛАР КІТАБЫ',
    parentTitle: 'Ата-аналарға арналған',
    parentConfirm: 'Ересек екеніңізді растаңыз:',
    parentLogin: 'КІРУ',
    heroTitle: 'Сенің Батырың',
    save: 'САҚТАУ',
    quest: 'Тапсырма',
    questStart: 'ТАПСЫРМАНЫ БАСТАУ 🚀',
    collection: 'Сенің Жинағың',
    amazing: 'Керемет!',
    reward: 'тиын мен стикер',
    unlockedFirst: 'Алдымен алдыңғы деңгейді өт!',
    alreadyDone: 'Сен бұл деңгейдің сыйлығын алдың!',
    fillAll: 'Барлық өрістерді толтыр, Батыр!',
    botWelcome: 'Қазақстанды бірге зерттейік!',
    almaty_desc: 'Алмалар мен биік таулар қаласы. Мұнда әлемдегі ең үлкен Медеу мұз айдыны бар!',
    shymkent_desc: 'Ежелгі тарихы бар бау-бақша қала және ең қонақжай адамдар!',
    astana_desc: 'Даланың қақ ортасындағы заманауи елорда. Болашақ қаласы!',
    baiterek_desc: 'Самұрық құс алтын жұмыртқа салған жер. Мұнда ең асыл армандар орындалады!'
  }
};

const NODES: Node[] = [
  { id: 'almaty', icon: '🍎', name: { ru: 'Алматы', kk: 'Алматы' }, top: '75%', left: '20%', description: 'almaty_desc' },
  { id: 'shymkent', icon: '🏰', name: { ru: 'Шымкент', kk: 'Шымкент' }, top: '55%', left: '65%', description: 'shymkent_desc' },
  { id: 'astana', icon: '🏙️', name: { ru: 'Астана', kk: 'Астана' }, top: '35%', left: '25%', description: 'astana_desc' },
  { id: 'baiterek', icon: '🌟', name: { ru: 'Байтерек', kk: 'Бәйтерек' }, top: '15%', left: '70%', description: 'baiterek_desc' },
];

const AVATARS = ['🐪', '🦁', '🦅', '🐺', '🐎'];

// --- Complex Oyu Puzzle Component (3x2 Grid) ---
const ComplexOyuPuzzle = ({ lang, onComplete, setBotMessage }: { lang: Lang, onComplete: () => void, setBotMessage: (m: string) => void }) => {
  const ROWS = 2;
  const COLS = 3;
  const PIECE_SIZE = 100;
  const GRID_WIDTH = COLS * PIECE_SIZE;
  const GRID_HEIGHT = ROWS * PIECE_SIZE;

  // Pattern image from the public folder (User needs to add pattern.png)
  const OYU_IMG = "/pattern.png";

  const [pieces, setPieces] = useState<{ id: number, targetIdx: number, startX: number, startY: number, x: number, y: number, isSolved: boolean, rotation: number }[]>([]);

  useEffect(() => {
    const indices = [0, 1, 2, 3, 4, 5];
    const shuffled = [...indices].sort(() => Math.random() - 0.5);

    setPieces(shuffled.map((targetIdx, i) => {
      const trayRow = Math.floor(i / 3);
      const trayCol = i % 3;
      const startX = (trayCol - 1) * 110;
      const startY = 40 + trayRow * 110;

      return {
        id: i,
        targetIdx,
        startX,
        startY,
        x: startX,
        y: startY,
        isSolved: false,
        rotation: Math.random() * 16 - 8 // -8 to 8 degrees
      };
    }));
  }, []);

  const handleDragEnd = (id: number, info: any) => {
    setPieces(prev => {
      const piece = prev.find(p => p.id === id);
      if (!piece || piece.isSolved) return prev;

      const targetRow = Math.floor(piece.targetIdx / COLS);
      const targetCol = piece.targetIdx % COLS;

      const slotX = (targetCol - 1) * PIECE_SIZE;
      const slotY = -117 + (targetRow - 0.5) * PIECE_SIZE;

      const finalX = piece.x + info.offset.x;
      const finalY = piece.y + info.offset.y;

      const dx = finalX - slotX;
      const dy = finalY - slotY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PIECE_SIZE / 1.5) {
        setBotMessage(lang === 'ru' ? 'Отлично! Кубик встал на место!' : 'Керемет! Текше орнына түсті!');

        const next = prev.map(p =>
          p.id === id
            ? { ...p, x: slotX, y: slotY, isSolved: true, rotation: 0 }
            : p
        );

        if (next.every(p => p.isSolved)) {
          setBotMessage(lang === 'ru' ? 'Ура! Шымкент открыт!' : 'Алақай! Шымкент ашылды!');
          setTimeout(onComplete, 1500);
        }
        return next;
      }

      return prev.map(p => p.id === id ? { ...p, x: finalX, y: finalY } : p);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-[460px] relative w-full overflow-hidden mt-4">
      {/* Target Board Ghost Container */}
      <div
        className="absolute bg-white/40 rounded-[24px] border-[8px] border-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] overflow-hidden"
        style={{
          width: GRID_WIDTH + 16,
          height: GRID_HEIGHT + 16,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div
          className="w-full h-full opacity-15 grayscale"
          style={{
            backgroundImage: `url(${OYU_IMG})`,
            backgroundSize: `${GRID_WIDTH}px ${GRID_HEIGHT}px`,
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-20 pointer-events-none">
          {[...Array(6)].map((_, i) => <div key={i} className="border border-blue-900" />)}
        </div>
      </div>

      {/* Interactive Pieces Container */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        {pieces.map((p) => {
          const targetRow = Math.floor(p.targetIdx / COLS);
          const targetCol = p.targetIdx % COLS;

          return (
            <motion.div
              key={p.id}
              drag={!p.isSolved}
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(p.id, info)}
              animate={{
                x: p.x,
                y: p.y,
                rotate: p.rotation,
                scale: p.isSolved ? 1 : 1.05,
                zIndex: p.isSolved ? 10 : 50
              }}
              whileHover={!p.isSolved ? { scale: 1.12, zIndex: 60 } : {}}
              whileDrag={{ scale: 1.2, zIndex: 100, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`absolute flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto ${p.isSolved
                ? 'border border-blue-200 shadow-sm'
                : 'border-t-[3px] border-l-[3px] border-b-[6px] border-r-[4px] border-white shadow-xl rounded-xl bg-white/80 backdrop-blur-sm'
                }`}
              style={{
                width: PIECE_SIZE,
                height: PIECE_SIZE,
              }}
            >
              <div
                className={`w-full h-full ${!p.isSolved && 'rounded-lg'} overflow-hidden pointer-events-none`}
                style={{
                  backgroundImage: `url(${OYU_IMG})`,
                  backgroundSize: `${GRID_WIDTH}px ${GRID_HEIGHT}px`,
                  backgroundPosition: `-${targetCol * PIECE_SIZE}px -${targetRow * PIECE_SIZE}px`,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="absolute bottom-0 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-amber-100 shadow-xl pointer-events-none">
        <p className="text-xs font-black text-quest-primary uppercase text-center tracking-widest opacity-90">
          {lang === 'ru' ? 'Перетащи кубики на доску!' : 'Текшелерді тақтаға апар!'}
        </p>
      </div>
    </div>
  );
};



const Toast = ({ message, onHide }: { message: string, onHide: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <motion.div
      initial={{ y: -100, x: '-50%', opacity: 0 }}
      animate={{ y: 30, x: '-50%', opacity: 1 }}
      exit={{ y: -100, x: '-50%', opacity: 0 }}
      className="fixed left-1/2 z-[5000] bg-quest-text text-white px-8 py-4 rounded-3xl font-extrabold shadow-xl text-center min-w-[300px]"
    >
      {message}
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'map'>('auth');
  const [user, setUser] = useState<UserState>({
    name: '',
    age: '',
    interests: [],
    coins: 0,
    completedNodes: [],
    avatar: '🐪',
    lang: 'ru',
  });
  const [toast, setToast] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [botMessage, setBotMessage] = useState<string | null>(null);
  const [parentMath, setParentMath] = useState<{ q: string, a: number } | null>(null);
  const [parentInput, setParentInput] = useState('');
  const [questQuestions, setQuestQuestions] = useState<{ q: string, a: number }[]>([]);
  const [currentQuestIdx, setCurrentQuestIdx] = useState(0);
  const [questInput, setQuestInput] = useState('');

  const t = TRANSLATIONS[user.lang];
  const showToast = (m: string) => setToast(m);

  const switchLang = () => {
    setUser(prev => ({ ...prev, lang: prev.lang === 'ru' ? 'kk' : 'ru' }));
  };

  const getGrade = (ageValue: string) => {
    const age = parseInt(ageValue) || 7;
    return Math.max(1, Math.min(12, age - 6));
  };

  const generateMathQuestions = (ageValue: string) => {
    const grade = getGrade(ageValue);
    const questions: { q: string, a: number }[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < 3; i++) {
      if (grade <= 2) {
        // Grades 1-2: Add/Sub within 30
        const n1 = Math.floor(Math.random() * 20) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        questions.push({
          q: `${n1} ${op} ${n2} = ?`,
          a: op === '+' ? n1 + n2 : n1 - n2
        });
      } else if (grade <= 5) {
        // Grades 3-5: Mult/Div
        const n1 = Math.floor(Math.random() * 9) + 2;
        const n2 = Math.floor(Math.random() * 9) + 2;
        const op = Math.random() > 0.5 ? '×' : '÷';
        if (op === '÷') {
          questions.push({ q: `${n1 * n2} ÷ ${n2} = ?`, a: n1 });
        } else {
          questions.push({ q: `${n1} × ${n2} = ?`, a: n1 * n2 });
        }
      } else if (grade <= 8) {
        // Grades 6-8: Simple Algebra e.g. 2x = 10
        const x = Math.floor(Math.random() * 10) + 2;
        const coef = Math.floor(Math.random() * 5) + 2;
        questions.push({ q: `${coef}x = ${coef * x}, x = ?`, a: x });
      } else if (grade <= 11) {
        // Grades 9-11: Squares, Roots, Equations
        const x = Math.floor(Math.random() * 12) + 2;
        const type = Math.floor(Math.random() * 2);
        if (type === 0) {
          questions.push({ q: `${x}² = ?`, a: x * x });
        } else {
          const x2 = Math.floor(Math.random() * 10) + 1;
          questions.push({ q: `3x + ${x2} = ${3 * x + x2}, x = ?`, a: x });
        }
      } else {
        // Grade 12: SAT Medium style
        const satPool = [
          { q: "f(x) = 3x - 5. Find f(7)", a: 16 },
          { q: "x² - 9 = 0. Find positive x", a: 3 },
          { q: "If 2x + 3 = 11, find 4x", a: 16 },
          { q: "3(x-2) = 12. Find x", a: 6 },
          { q: "Slope of y = 4x + 7?", a: 4 },
          { q: "If a=3 and b=4, find √(a²+b²)", a: 5 },
          { q: "If 5/x = 10, find x*10", a: 5 },
          { q: "x + y = 10, x - y = 10. Find x", a: 10 },
          { q: "Find x: 2^(x+1) = 8", a: 2 },
          { q: "Average of 10, 20, 30?", a: 20 },
          { q: "If 1/x + 1/x = 1, find x", a: 2 },
          { q: "Area of circle with radius 3? (Round to int)", a: 28 },
          { q: "If x% of 200 is 40, find x", a: 20 },
          { q: "3x + 7 = 2x + 10. Find x", a: 3 },
          { q: "Find median of 1, 5, 8, 10, 20", a: 8 }
        ];
        let randIdx;
        do {
          randIdx = Math.floor(Math.random() * satPool.length);
        } while (usedIndices.has(randIdx));
        usedIndices.add(randIdx);
        questions.push(satPool[randIdx]);
      }
    }
    return questions;
  };

  // Bot logic
  useEffect(() => {
    if (screen === 'map') {
      const phrases = [
        user.lang === 'ru' ? "Хочешь открыть новый город?" : "Жаңа қаланы ашқың келе ме?",
        user.lang === 'ru' ? "В Астане много интересного!" : "Астанада қызықты нәрселер көп!",
        user.lang === 'ru' ? "Ты отличный исследователь!" : "Сен керемет зерттеушісің!",
        user.lang === 'ru' ? "Там — Алматы!" : "Анау — Алматы!",
      ];
      setBotMessage(user.lang === 'ru' ? `Салам, ${user.name}! ${t.botWelcome}` : `Сәлем, ${user.name}! ${t.botWelcome}`);
      const interval = setInterval(() => {
        setBotMessage(phrases[Math.floor(Math.random() * phrases.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [screen, user.name, user.lang, t.botWelcome]);

  const handleStart = () => {
    if (!user.name || !user.age) {
      showToast(t.fillAll);
      return;
    }
    setScreen('map');
  };

  const toggleInterest = (i: Interest) => {
    setUser(prev => ({
      ...prev,
      interests: prev.interests.includes(i)
        ? prev.interests.filter(item => item !== i)
        : [...prev.interests, i]
    }));
  };

  const isUnlocked = (nodeId: string) => {
    const index = NODES.findIndex(n => n.id === nodeId);
    if (index === 0) return true;
    const prevNodeId = NODES[index - 1].id;
    return user.completedNodes.includes(prevNodeId);
  };

  const handleNodeClick = (node: Node) => {
    if (!isUnlocked(node.id)) {
      showToast(t.unlockedFirst);
      return;
    }
    if (user.completedNodes.includes(node.id)) {
      showToast(t.alreadyDone);
      return;
    }

    // Every node click
    const isPuzzle = node.id === 'shymkent';

    if (!isPuzzle) {
      setQuestQuestions(generateMathQuestions(user.age));
      setCurrentQuestIdx(0);
      setQuestInput('');
    }
    setActiveModal(`quest-${node.id}`);
  };

  const verifyQuest = (nodeId: string) => {
    const currentQ = questQuestions[currentQuestIdx];
    if (parseInt(questInput) === currentQ.a) {
      if (currentQuestIdx < 2) {
        // Next question
        setCurrentQuestIdx(currentQuestIdx + 1);
        setQuestInput('');
        showToast(user.lang === 'ru' ? "Правильно! Еще один!" : "Дұрыс! Тағы біреу!");
      } else {
        // Quest complete
        completeQuest(nodeId);
      }
    } else {
      showToast(user.lang === 'ru' ? "Ой! Попробуй еще раз." : "Қате! Қайтадан байқап көр.");
    }
  };

  const completeQuest = (nodeId: string) => {
    setUser(prev => ({
      ...prev,
      completedNodes: [...prev.completedNodes, nodeId],
      coins: prev.coins + 50
    }));
    const node = NODES.find(n => n.id === nodeId);
    showToast(`${t.amazing} +50 ${t.reward} ${node?.icon}`);
    setActiveModal(null);
  };

  const openParent = () => {
    const num1 = Math.floor(Math.random() * 20) + 10;
    const num2 = Math.floor(Math.random() * 10) + 5;
    setParentMath({ q: `${num1} + ${num2} = ?`, a: num1 + num2 });
    setActiveModal('parent');
  };

  const checkParent = () => {
    if (parseInt(parentInput) === parentMath?.a) {
      setActiveModal(null);
      showToast(user.lang === 'ru' ? "Режим родителя активирован!" : "Ата-ана режимі қосылды!");
    } else {
      showToast(user.lang === 'ru' ? "Ошибка! Попробуй снова." : "Қате! Қайтадан байқап көріңіз.");
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence>
        {toast && <Toast message={toast} onHide={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screen === 'auth' ? (
          <motion.section
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-6 min-h-screen mt-[-20px]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[50px] w-full max-w-md shadow-2xl text-center border-b-8 border-gray-100 relative"
            >
              <button
                onClick={switchLang}
                className="absolute top-6 right-6 font-black text-quest-primary bg-quest-bg px-4 py-2 rounded-xl text-sm"
              >
                {user.lang === 'ru' ? 'RU/KK' : 'KK/RU'}
              </button>
              <div className="text-8xl mb-4">🐪</div>
              <h1 className="text-4xl font-black text-quest-primary mb-2 tracking-tight">{t.title}</h1>
              <p className="font-bold opacity-60 mb-8">{t.subtitle}</p>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  className="w-full px-6 py-4 rounded-2xl border-4 border-quest-bg outline-none focus:border-quest-primary transition-all text-lg font-bold"
                  value={user.name}
                  onChange={e => setUser({ ...user, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder={t.agePlaceholder}
                  className="w-full px-6 py-4 rounded-2xl border-4 border-quest-bg outline-none focus:border-quest-primary transition-all text-lg font-bold"
                  value={user.age}
                  onChange={e => setUser({ ...user, age: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {(['🚀 Техника', '🎨 Арт', '🐾 Природа', '📜 История'] as Interest[]).map(i => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`p-3 rounded-2xl text-sm font-black transition-all ${user.interests.includes(i)
                      ? 'bg-quest-secondary text-white shadow-[0_4px_0_#7A965D]'
                      : 'bg-quest-bg opacity-70'
                      }`}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStart}
                className="w-full bg-quest-primary text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#B57A36] active:translate-y-1 active:shadow-[0_5px_0_#B57A36] transition-all flex items-center justify-center gap-2 group"
              >
                {t.goBtn} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.section>
        ) : (
          <motion.section
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-screen bg-quest-bg overflow-hidden flex flex-col"
          >
            {/* Header */}
            <header className="p-6 flex justify-between items-center z-50">
              <div
                className="bg-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setActiveModal('profile')}
              >
                <div className="w-10 h-10 bg-quest-primary rounded-xl flex items-center justify-center text-2xl shadow-inner">
                  {user.avatar}
                </div>
                <div>
                  <div className="font-black leading-tight text-quest-text">{user.name || t.hero}</div>
                  <div className="text-xs font-bold flex items-center gap-1 opacity-70">
                    <Coins size={12} className="text-amber-500" /> {user.coins}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={switchLang}
                  className="bg-white text-quest-primary px-3 py-2 rounded-2xl font-black text-xs shadow-lg"
                >
                  {user.lang === 'ru' ? 'RU/KK' : 'KK/RU'}
                </button>
                <button
                  onClick={openParent}
                  className="bg-quest-primary text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-[0_5px_0_#B57A36] active:translate-y-0.5 active:shadow-[0_2px_0_#B57A36] transition-all flex items-center gap-2"
                >
                  <Users size={16} /> {t.momBtn}
                </button>
              </div>
            </header>

            {/* Map Area */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="w-full max-w-5xl h-[75vh] bg-white/40 rounded-[60px] shadow-2xl relative overflow-hidden border-8 border-white">
                <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                  <div className="relative w-full h-full p-10">
                    {/* Simplified Decorative Path */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 2 }}
                        d="M 20 75 C 40 70, 50 60, 65 55 S 40 40, 25 35 S 50 20, 70 15"
                        fill="none"
                        stroke="#D99A4E"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Nodes */}
                    {NODES.map((node) => {
                      const completed = user.completedNodes.includes(node.id);
                      const locked = !isUnlocked(node.id);
                      return (
                        <motion.button
                          key={node.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={!locked ? { scale: 1.1 } : {}}
                          whileTap={!locked ? { scale: 0.95 } : {}}
                          style={{ top: node.top, left: node.left }}
                          onClick={() => handleNodeClick(node)}
                          className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-[25px] flex items-center justify-center text-3xl shadow-xl transition-all z-10 ${completed
                            ? 'bg-quest-secondary text-white ring-6 ring-green-100'
                            : locked
                              ? 'bg-gray-200 grayscale opacity-50'
                              : 'bg-white hover:ring-6 hover:ring-amber-100'
                            }`}
                        >
                          {locked ? <Lock size={24} className="text-gray-400" /> : node.icon}
                          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-black text-quest-text whitespace-nowrap opacity-60">
                            {node.name[user.lang]}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="p-6 flex gap-4 justify-center items-center">
              <button
                onClick={() => setActiveModal('book')}
                className="flex-1 max-w-xs bg-quest-secondary text-white py-5 rounded-3xl font-black text-lg shadow-[0_10px_0_#7A965D] flex items-center justify-center gap-3"
              >
                <BookOpen /> {t.bookBtn}
              </button>
            </div>

            {/* KamBot */}
            <AnimatePresence>
              {botMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="fixed bottom-32 right-10 bg-quest-text text-white p-5 rounded-3xl rounded-br-none max-w-[250px] font-bold z-[1000] shadow-2xl"
                >
                  {botMessage}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="fixed bottom-10 right-10 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-5xl cursor-pointer z-[1000] border-4 border-quest-primary"
              onClick={() => {
                const phrases = ["Я Камелот!", "Исследуй карту!", "Кликни на город!"];
                setBotMessage(phrases[Math.floor(Math.random() * phrases.length)]);
              }}
            >
              🐪
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-quest-text/30 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white rounded-[50px] p-10 w-full shadow-2xl relative transition-all duration-500 ${activeModal === 'quest-astana' ? 'max-w-4xl' : 'max-w-md'
                }`}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X />
              </button>

              {/* Quest Modal */}
              {activeModal.startsWith('quest-') && (
                <div className="text-center">
                  <div className="text-7xl mb-6">{NODES.find(n => n.id === activeModal.replace('quest-', ''))?.icon}</div>
                  <h2 className="text-3xl font-black mb-4">{t.quest}: {NODES.find(n => n.id === activeModal.replace('quest-', ''))?.name[user.lang]}</h2>
                  <p className="font-bold opacity-70 mb-8 leading-relaxed">
                    {t[NODES.find(n => n.id === activeModal.replace('quest-', ''))?.description as keyof typeof t]}
                  </p>

                  {activeModal === 'quest-shymkent' ? (
                    <div className="mb-8">
                      <ComplexOyuPuzzle
                        lang={user.lang}
                        onComplete={() => completeQuest('shymkent')}
                        setBotMessage={setBotMessage}
                      />
                    </div>
                  ) : activeModal === 'quest-astana' ? (
                    <div className="w-full flex justify-center py-2">
                      <div className="w-full max-w-[450px] bg-white rounded-[32px] shadow-inner overflow-hidden">
                        <YurtGame onWin={() => {
                          completeQuest('astana');
                          setBotMessage(user.lang === 'ru' ? "Керемет! Юрта построена!" : "Керемет! Киіз үй дайын!");
                        }} />
                      </div>
                    </div>
                  ) : activeModal === 'quest-baiterek' ? (
                    <div className="w-full mt-4">
                      <BaiterekGame onWin={() => {
                        completeQuest('baiterek');
                        setBotMessage(user.lang === 'ru' ? "Желание исполнено! Байтерек сияет!" : "Тілек орындалды! Бәйтерек жарқырап тұр!");
                      }} />
                    </div>
                  ) : questQuestions.length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-center gap-2 mb-4">
                        {[0, 1, 2].map(idx => (
                          <div
                            key={idx}
                            className={`h-3 w-12 rounded-full transition-all duration-500 ${idx < currentQuestIdx ? 'bg-quest-secondary' : idx === currentQuestIdx ? 'bg-quest-primary animate-pulse' : 'bg-gray-100'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-black text-quest-primary mb-2 uppercase tracking-widest opacity-60">
                        {user.lang === 'ru' ? `Вопрос ${currentQuestIdx + 1} из 3` : `Сұрақ ${currentQuestIdx + 1} / 3`}
                      </p>
                      <p className="text-3xl font-black mb-4 bg-quest-bg py-6 rounded-[30px] shadow-inner">{questQuestions[currentQuestIdx].q}</p>
                      <input
                        type="number"
                        className="w-full px-6 py-5 rounded-3xl border-4 border-quest-bg text-center text-3xl font-black outline-none focus:border-quest-primary transition-all shadow-lg"
                        value={questInput}
                        onChange={e => setQuestInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && verifyQuest(activeModal.replace('quest-', ''))}
                        autoFocus
                      />
                    </div>
                  )}

                  {activeModal !== 'quest-shymkent' && (
                    <button
                      onClick={() => verifyQuest(activeModal.replace('quest-', ''))}
                      className="w-full bg-quest-secondary text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#7A965D] active:translate-y-1 active:shadow-[0_5px_0_#7A965D] transition-all"
                    >
                      {currentQuestIdx === 2 ? t.questStart : (user.lang === 'ru' ? 'ОТВЕТИТЬ' : 'ЖАУАП БЕРУ')}
                    </button>
                  )}
                </div>
              )}

              {/* Book Modal */}
              {activeModal === 'book' && (
                <div className="text-center">
                  <h2 className="text-3xl font-black mb-8 flex items-center justify-center gap-3">
                    <Trophy className="text-amber-500" /> {t.collection}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8 max-h-[40vh] overflow-y-auto p-2">
                    {NODES.map(node => {
                      const collected = user.completedNodes.includes(node.id);
                      return (
                        <div
                          key={node.id}
                          className={`aspect-square rounded-3xl border-4 flex flex-col items-center justify-center p-3 transition-all ${collected
                            ? 'bg-white border-quest-primary shadow-lg'
                            : 'bg-gray-50 border-dashed border-gray-200 opacity-40'
                            }`}
                        >
                          <div className="text-4xl mb-1">{collected ? node.icon : '?'}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest">{collected ? node.name[user.lang] : '???'}</div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-quest-primary text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#B57A36]"
                  >
                    {t.amazing}
                  </button>
                </div>
              )}

              {/* Profile Modal */}
              {activeModal === 'profile' && (
                <div className="text-center">
                  <h2 className="text-3xl font-black mb-8">{t.heroTitle}</h2>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {AVATARS.map(ava => (
                      <button
                        key={ava}
                        onClick={() => setUser({ ...user, avatar: ava })}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all ${user.avatar === ava
                          ? 'bg-quest-secondary/20 ring-4 ring-quest-secondary scale-110 shadow-lg'
                          : 'bg-quest-bg hover:bg-gray-100'
                          }`}
                      >
                        {ava}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-quest-primary text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#B57A36]"
                  >
                    {t.save}
                  </button>
                </div>
              )}

              {/* Parent Modal */}
              {activeModal === 'parent' && (
                <div className="text-center">
                  <h2 className="text-2xl font-black mb-4">{t.parentTitle}</h2>
                  <p className="font-bold opacity-60 mb-6 italic">{t.parentConfirm}</p>
                  <p className="text-3xl font-black mb-6 bg-quest-bg py-4 rounded-2xl">{parentMath?.q}</p>
                  <input
                    type="number"
                    className="w-full px-6 py-4 rounded-2xl border-4 border-quest-bg text-center text-2xl font-black mb-6 outline-none focus:border-quest-primary"
                    value={parentInput}
                    onChange={e => setParentInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={checkParent}
                    className="w-full bg-quest-text text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#222]"
                  >
                    {t.parentLogin}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
