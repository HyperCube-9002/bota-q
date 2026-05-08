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

// --- Historical Facts Database ---
const HISTORICAL_FACTS = {
  shymkent: {
    ru: [
      "Орнамент 'Ою-өрнек' — это не просто декор, а тайный шифр предков!",
      "Каждый узор имеет смысл: рога барана означают силу и достаток.",
      "Мастера создавали узоры симметрично, веря, что это приносит гармонию в дом."
    ],
    kk: [
      "Ою-өрнек — жай ғана әшекей емес, бабалардың құпия коды!",
      "Әр өрнектің мәні бар: қошқар мүйіз күш пен байлықты білдіреді.",
      "Шеберлер үйге үйлесім әкеледі деп сеніп, өрнектерді симметриялы жасаған."
    ]
  },
  astana: {
    ru: [
      "Киіз үй (юрта) строится без единого гвоздя! Это чудо инженерной мысли.",
      "Стены 'Кереге' легко складываются, позволяя кочевникам переезжать за 1 час.",
      "Шанырак — верхний круг юрты — передавался от отца к сыну как семейная реликвия."
    ],
    kk: [
      "Киіз үй бірде-бір шегесіз тұрғызылады! Бұл — инженерлік ойдың кереметі.",
      "Кереге оңай жиналады, бұл көшпенділерге 1 сағатта көшуге мүмкіндік берген.",
      "Шаңырақ — киіз үйдің жоғарғы шеңбері — әкеден балаға мұра болып қалған."
    ]
  },
  baiterek: {
    ru: [
      "Байтерек — это Древо Жизни. Его корни в земле, а крона подпирает небо.",
      "Золотой шар наверху символизирует яйцо волшебной птицы Самрук.",
      "Каждый год птица откладывает яйцо, принося надежду и обновление миру."
    ],
    kk: [
      "Бәйтерек — бұл Өмір ағашы. Оның тамыры жерде, ал басы көкте.",
      "Төбесіндегі алтын шар киелі Самұрық құстың жұмыртқасын білдіреді.",
      "Жыл сайын бұл құс жұмыртқа салып, әлемге үміт пен жаңару әкеледі."
    ]
  }
};

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

// --- Complex Oyu Puzzle Component ---
const ComplexOyuPuzzle = ({ lang, onComplete, setBotMessage }: { lang: Lang, onComplete: () => void, setBotMessage: (m: string) => void }) => {
  const ROWS = 2;
  const COLS = 3;
  const PIECE_SIZE = 100;
  const GRID_WIDTH = COLS * PIECE_SIZE;
  const GRID_HEIGHT = ROWS * PIECE_SIZE;
  const OYU_IMG = "/pattern.png";

  const [pieces, setPieces] = useState<{ id: number, targetIdx: number, x: number, y: number, isSolved: boolean, rotation: number }[]>([]);

  useEffect(() => {
    const indices = [0, 1, 2, 3, 4, 5];
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    setPieces(shuffled.map((targetIdx, i) => ({
      id: i,
      targetIdx,
      x: (i % 3 - 1) * 110,
      y: 40 + Math.floor(i / 3) * 110,
      isSolved: false,
      rotation: Math.random() * 16 - 8
    })));
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
      const distance = Math.sqrt(Math.pow(finalX - slotX, 2) + Math.pow(finalY - slotY, 2));

      if (distance < PIECE_SIZE / 1.5) {
        const next = prev.map(p => p.id === id ? { ...p, x: slotX, y: slotY, isSolved: true, rotation: 0 } : p);
        const solvedCount = next.filter(p => p.isSolved).length;

        // Camel facts based on progress
        if (solvedCount === 2) setBotMessage(HISTORICAL_FACTS.shymkent[lang][0]);
        if (solvedCount === 4) setBotMessage(HISTORICAL_FACTS.shymkent[lang][1]);

        if (next.every(p => p.isSolved)) {
          setBotMessage(HISTORICAL_FACTS.shymkent[lang][2]);
          setTimeout(onComplete, 2000);
        }
        return next;
      }
      return prev.map(p => p.id === id ? { ...p, x: finalX, y: finalY } : p);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-[460px] relative w-full overflow-hidden mt-4">
      <div className="absolute bg-white/40 rounded-[24px] border-[8px] border-white shadow-inner overflow-hidden" style={{ width: GRID_WIDTH + 16, height: GRID_HEIGHT + 16, top: 0, left: '50%', transform: 'translateX(-50%)' }}>
        <div className="w-full h-full opacity-15 grayscale" style={{ backgroundImage: url(${OYU_IMG}), backgroundSize: ${GRID_WIDTH}px ${GRID_HEIGHT}px, backgroundPosition: 'center' }} />
      </div>
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            drag={!p.isSolved}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(p.id, info)}
            animate={{ x: p.x, y: p.y, rotate: p.rotation, scale: p.isSolved ? 1 : 1.05, zIndex: p.isSolved ? 10 : 50 }}
            className={absolute flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto ${p.isSolved ? 'border border-blue-200' : 'border-4 border-white shadow-xl rounded-xl bg-white/80'}}
            style={{ width: PIECE_SIZE, height: PIECE_SIZE }}
          >
            <div className="w-full h-full overflow-hidden pointer-events-none" style={{ backgroundImage: url(${OYU_IMG}), backgroundSize: ${GRID_WIDTH}px ${GRID_HEIGHT}px, backgroundPosition: -${(p.targetIdx % COLS) * PIECE_SIZE}px -${Math.floor(p.targetIdx / COLS) * PIECE_SIZE}px }} />
          </motion.div>
        ))}
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
    <motion.div initial={{ y: -100, x: '-50%', opacity: 0 }} animate={{ y: 30, x: '-50%', opacity: 1 }} exit={{ y: -100, x: '-50%', opacity: 0 }} className="fixed left-1/2 z-[5000] bg-quest-text text-white px-8 py-4 rounded-3xl font-extrabold shadow-xl text-center min-w-[300px]">
      {message}
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'map'>('auth');
  const [user, setUser] = useState<UserState>({
    name: '', age: '', interests: [], coins: 0, completedNodes: [], avatar: '🐪', lang: 'ru',
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

  const switchLang = () => setUser(prev => ({ ...prev, lang: prev.lang === 'ru' ? 'kk' : 'ru' }));

  const generateMathQuestions = (ageValue: string) => {
    const grade = Math.max(1, Math.min(12, (parseInt(ageValue) || 7) - 6));
    const questions: { q: string, a: number }[] = [];
    for (let i = 0; i < 3; i++) {
        const n1 = Math.floor(Math.random() * 20) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        questions.push({ q: ${n1} + ${n2} = ?, a: n1 + n2 });
    }
    return questions;
  };

  useEffect(() => {
    if (screen === 'map' && !activeModal) {
      const phrases = [
        user.lang === 'ru' ? "Хочешь открыть новый город?" : "Жаңа қаланы ашқың келе ме?",
        user.lang === 'ru' ? "Ты отличный исследователь!" : "Сен керемет зерттеушісің!",
      ];
      setBotMessage(user.lang === 'ru' ? Салам, ${user.name}! Исследуем Казахстан? : Сәлем, ${user.name}! Қазақстанды зерттейміз бе?);
      const interval = setInterval(() => setBotMessage(phrases[Math.floor(Math.random() * phrases.length)]), 15000);
      return () => clearInterval(interval);
    }
  }, [screen, user.name, user.lang, activeModal]);

  const handleNodeClick = (node: Node) => {
    if (!isUnlocked(node.id)) return showToast(t.unlockedFirst);
    if (user.completedNodes.includes(node.id)) return showToast(t.alreadyDone);
    
    if (node.id !== 'shymkent' && node.id !== 'astana' && node.id !== 'baiterek') {
      setQuestQuestions(generateMathQuestions(user.age));
      setCurrentQuestIdx(0);
      setQuestInput('');
    }
    setActiveModal(quest-${node.id});
  };

  const isUnlocked = (nodeId: string) => {
    const index = NODES.findIndex(n => n.id === nodeId);
    return index === 0 || user.completedNodes.includes(NODES[index - 1].id);
  };

  const completeQuest = (nodeId: string) => {
    setUser(prev => ({ ...prev, completedNodes: [...prev.completedNodes, nodeId], coins: prev.coins + 50 }));
    showToast(${t.amazing} +50 ${t.reward});
    setActiveModal(null);
  };

  const verifyQuest = (nodeId: string) => {
    if (parseInt(questInput) === questQuestions[currentQuestIdx].a) {
      if (currentQuestIdx < 2) {
        setCurrentQuestIdx(currentQuestIdx + 1);
        setQuestInput('');
      } else {
        completeQuest(nodeId);
      }
    } else {
      showToast(user.lang === 'ru' ? "Попробуй еще раз!" : "Қайтадан байқап көр!");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-quest-bg">
      <AnimatePresence>{toast && <Toast message={toast} onHide={() => setToast(null)} />}</AnimatePresence>

      {screen === 'auth' ? (
        <section className="flex flex-col items-center justify-center p-6 min-h-screen">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[50px] w-full max-w-md shadow-2xl text-center">
            <h1 className="text-4xl font-black text-quest-primary mb-8">{t.title}</h1>
            <input type="text" placeholder={t.namePlaceholder} className="w-full px-6 py-4 rounded-2xl border-4 mb-4 font-bold" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
            <input type="number" placeholder={t.agePlaceholder} className="w-full px-6 py-4 rounded-2xl border-4 mb-8 font-bold" value={user.age} onChange={e => setUser({ ...user, age: e.target.value })} />
            <button onClick={() => { if(user.name && user.age) setScreen('map') }} className="w-full bg-quest-primary text-white py-5 rounded-3xl font-black text-xl shadow-[0_10px_0_#B57A36]">
              {t.goBtn}
            </button>
          </motion.div>
        </section>
      ) : (
        <section className="relative h-screen overflow-hidden flex flex-col">
          <header className="p-6 flex justify-between items-center z-50">
            <div className="bg-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
                <div className="text-2xl">{user.avatar}</div>
                <div className="font-black text-quest-text">{user.name} | {user.coins} 🪙</div>
            </div>
          </header>

          <div className="flex-1 relative flex items-center justify-center">
            {NODES.map((node) => (
              <button
                key={node.id}
                style={{ top: node.top, left: node.left }}
                onClick={() => handleNodeClick(node)}
                className={absolute w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl transition-all ${user.completedNodes.includes(node.id) ? 'bg-quest-secondary text-white' : !isUnlocked(node.id) ? 'bg-gray-200 grayscale' : 'bg-white'}}
              >
                {!isUnlocked(node.id) ? <Lock size={24} /> : node.icon}
              </button>
            ))}
          </div>

          {/* Camel Bot with Tooltip */}
          <AnimatePresence>
            {botMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="fixed bottom-32 right-10 bg-quest-text text-white p-5 rounded-3xl rounded-br-none max-w-[280px] font-bold z-[1000] shadow-2xl border-2 border-white/20"
              >
                {botMessage}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="fixed bottom-10 right-10 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-5xl cursor-pointer z-[1000] border-4 border-quest-primary">
            🐪
          </div>
        </section>
      )}

      {/* Modals with Game Progression Logic */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[50px] p-10 w-full max-w-4xl shadow-2xl relative">
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2"><X /></button>
              
              {activeModal === 'quest-shymkent' && (
                <ComplexOyuPuzzle lang={user.lang} onComplete={() => completeQuest('shymkent')} setBotMessage={setBotMessage} />
              )}

              {activeModal === 'quest-astana' && (
                <YurtGame onWin={() => {
                   setBotMessage(HISTORICAL_FACTS.astana[user.lang][2]);
                   setTimeout(() => completeQuest('astana'), 2000);
                }} onProgress={(p) => {
                   if (p === 3) setBotMessage(HISTORICAL_FACTS.astana[user.lang][0]);
                   if (p === 6) setBotMessage(HISTORICAL_FACTS.astana[user.lang][1]);
                }} />
              )}

              {activeModal === 'quest-baiterek' && (
                <BaiterekGame onWin={() => {
                   setBotMessage(HISTORICAL_FACTS.baiterek[user.lang][2]);
                   setTimeout(() => completeQuest('baiterek'), 2000);
                }} onProgress={(p) => {
                   if (p === 1) setBotMessage(HISTORICAL_FACTS.baiterek[user.lang][0]);
                   if (p === 2) setBotMessage(HISTORICAL_FACTS.baiterek[user.lang][1]);
                }} />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
