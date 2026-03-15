import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  User as UserIcon, 
  Home, 
  Settings, 
  Search, 
  Coins, 
  Trophy,
  LogOut,
  Gamepad2,
  ChevronRight,
  Shirt,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  updateDoc,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { GAMES, Game, UserProfile, Score, Avatar, MARKETPLACE_ITEMS, MarketplaceItem } from './types';
import { AvatarDisplay } from './components/AvatarDisplay';
import { Marketplace } from './components/Marketplace';
import { handleFirestoreError, OperationType } from './utils/errorHandling';
import { cn } from './utils/cn';

// --- Connection Test ---
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// --- Mini Games Implementation ---

const SpeedRun = ({ onGameOver, avatar }: { onGameOver: (score: number) => void, avatar?: Avatar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let player = { x: 50, y: 200, width: 30, height: 30, dy: 0, jumpForce: -12, gravity: 0.6 };
    let obstacles: { x: number, y: number, width: number, height: number }[] = [];
    let frame = 0;
    let currentScore = 0;

    const gameLoop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Player physics
      player.dy += player.gravity;
      player.y += player.dy;

      if (player.y + player.height > canvas.height - 20) {
        player.y = canvas.height - 20 - player.height;
        player.dy = 0;
      }

      // Spawn obstacles
      if (frame % 100 === 0) {
        obstacles.push({ x: canvas.width, y: canvas.height - 50, width: 30, height: 30 });
      }

      // Update obstacles
      obstacles = obstacles.filter(obs => {
        obs.x -= 5;
        
        // Collision
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          onGameOver(currentScore);
          return false;
        }

        if (obs.x + obs.width < 0) {
          currentScore += 10;
          setScore(currentScore);
          return false;
        }
        return true;
      });

      // Draw Player
      ctx.fillStyle = avatar?.skinColor || '#FFDBAC';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      // Shirt
      ctx.fillStyle = avatar?.shirtColor || '#3b82f6';
      ctx.fillRect(player.x, player.y + 10, player.width, 10);
      
      // Pants
      ctx.fillStyle = avatar?.pantsColor || '#1f2937';
      ctx.fillRect(player.x, player.y + 20, player.width, 10);

      // Obstacles
      ctx.fillStyle = '#ef4444';
      obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));

      // Ground
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && player.dy === 0) {
        player.dy = player.jumpForce;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl overflow-hidden">
      <div className="absolute top-4 left-4 text-white font-bold text-2xl">Score: {score}</div>
      <canvas ref={canvasRef} width={800} height={400} className="bg-gray-800 rounded-lg shadow-2xl" />
      <div className="mt-4 text-gray-400">Press SPACE to jump</div>
    </div>
  );
};

const ClickerTycoon = ({ onGameOver, avatar }: { onGameOver: (score: number) => void, avatar?: Avatar }) => {
  const [coins, setCoins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const handleClick = () => {
    setCoins(prev => prev + multiplier);
  };

  const buyUpgrade = () => {
    if (coins >= 50) {
      setCoins(prev => prev - 50);
      setMultiplier(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-green-900 rounded-xl p-8">
      <div className="text-6xl font-black text-white mb-4 tracking-tighter">{coins} COINS</div>
      <div className="text-xl text-green-300 mb-8 font-mono">Multiplier: x{multiplier}</div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="w-48 h-48 bg-yellow-400 rounded-full shadow-[0_10px_0_#b45309] flex items-center justify-center mb-8 active:translate-y-2 active:shadow-none transition-all relative"
      >
        <div className="absolute -top-24">
          <AvatarDisplay avatar={avatar} size="md" />
        </div>
        <Coins size={80} className="text-yellow-800" />
      </motion.button>

      <div className="flex gap-4">
        <button 
          onClick={buyUpgrade}
          disabled={coins < 50}
          className="px-6 py-3 bg-white text-green-900 rounded-lg font-bold disabled:opacity-50 hover:bg-green-50 transition-colors"
        >
          Upgrade (50 Coins)
        </button>
        <button 
          onClick={() => onGameOver(coins)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
        >
          Save & Exit
        </button>
      </div>
    </div>
  );
};

// --- Avatar Editor Component ---

const AvatarEditor = ({ currentAvatar, inventory, onSave }: { currentAvatar?: Avatar, inventory: string[], onSave: (avatar: Avatar) => void }) => {
  const [avatar, setAvatar] = useState<Avatar>(currentAvatar || {
    skinColor: '#FFDBAC',
    shirtColor: '#3B82F6',
    pantsColor: '#1F2937',
    hatType: 'none'
  });

  const skinColors = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'];
  const shirtColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#000000', '#FFFFFF'];
  const pantsColors = ['#1F2937', '#374151', '#4B5563', '#111827', '#3B82F6', '#92400E'];
  const hatTypes: Avatar['hatType'][] = ['none', 'cap', 'crown', 'headphones'];

  const hasHeadless = inventory.includes('headless-horseman');
  const hasKorblox = inventory.includes('korblox-deathspeaker');

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="bg-[#111] rounded-[40px] p-12 border border-white/5 flex flex-col items-center justify-center min-h-[500px]">
        <AvatarDisplay avatar={avatar} size="xl" />
        <h3 className="text-2xl font-black mt-12 tracking-tight uppercase italic">Avatar Preview</h3>
      </div>

      <div className="space-y-8">
        {(hasHeadless || hasKorblox) && (
          <div className="bg-[#111] rounded-[40px] p-8 border border-white/5">
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Special Bundles</h4>
            <div className="flex flex-wrap gap-4">
              {hasHeadless && (
                <button
                  onClick={() => setAvatar(prev => ({ ...prev, isHeadless: !prev.isHeadless }))}
                  className={cn(
                    "px-6 py-3 rounded-xl border-2 font-bold transition-all",
                    avatar.isHeadless ? "border-purple-500 bg-purple-500 text-white" : "border-white/10 text-white hover:border-white/30"
                  )}
                >
                  Headless
                </button>
              )}
              {hasKorblox && (
                <button
                  onClick={() => setAvatar(prev => ({ ...prev, isKorblox: !prev.isKorblox }))}
                  className={cn(
                    "px-6 py-3 rounded-xl border-2 font-bold transition-all",
                    avatar.isKorblox ? "border-purple-500 bg-purple-500 text-white" : "border-white/10 text-white hover:border-white/30"
                  )}
                >
                  Korblox
                </button>
              )}
            </div>
          </div>
        )}
        <div className="bg-[#111] rounded-[40px] p-8 border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Skin Tone</h4>
          <div className="flex flex-wrap gap-4">
            {skinColors.map(color => (
              <button
                key={color}
                onClick={() => setAvatar(prev => ({ ...prev, skinColor: color }))}
                className={cn(
                  "w-12 h-12 rounded-full border-4 transition-all",
                  avatar.skinColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#111] rounded-[40px] p-8 border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Shirt Color</h4>
          <div className="flex flex-wrap gap-4">
            {shirtColors.map(color => (
              <button
                key={color}
                onClick={() => setAvatar(prev => ({ ...prev, shirtColor: color }))}
                className={cn(
                  "w-12 h-12 rounded-lg border-4 transition-all",
                  avatar.shirtColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#111] rounded-[40px] p-8 border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Pants Color</h4>
          <div className="flex flex-wrap gap-4">
            {pantsColors.map(color => (
              <button
                key={color}
                onClick={() => setAvatar(prev => ({ ...prev, pantsColor: color }))}
                className={cn(
                  "w-12 h-12 rounded-lg border-4 transition-all",
                  avatar.pantsColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#111] rounded-[40px] p-8 border border-white/5">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Headwear</h4>
          <div className="flex flex-wrap gap-4">
            {hatTypes.map(type => (
              <button
                key={type}
                onClick={() => setAvatar(prev => ({ ...prev, hatType: type }))}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-bold capitalize transition-all",
                  avatar.hatType === type ? "border-white bg-white text-black" : "border-white/10 text-white hover:border-white/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave(avatar)}
          className="w-full py-6 bg-white text-black rounded-[20px] font-black text-xl uppercase tracking-tighter hover:scale-[1.02] transition-all"
        >
          Save Avatar
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'home' | 'game' | 'profile' | 'leaderboard' | 'avatar' | 'marketplace'>('home');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const path = `users/${u.uid}`;
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.robux === undefined) {
              const updatedData = { ...data, robux: 1000000, inventory: [] };
              await updateDoc(docRef, { robux: 1000000, inventory: [] });
              setProfile(updatedData);
            } else {
              setProfile(data);
            }
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Player',
              photoURL: u.photoURL || '',
              totalCoins: 0,
              robux: 1000000,
              inventory: [],
              avatar: {
                skinColor: '#FFDBAC',
                shirtColor: '#3B82F6',
                pantsColor: '#1F2937',
                hatType: 'none'
              }
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGameOver = async (score: number) => {
    if (user && activeGame) {
      const scoreId = `${user.uid}_${activeGame.id}`;
      const scorePath = `scores/${scoreId}`;
      const userPath = `users/${user.uid}`;

      try {
        // Update score
        const scoreRef = doc(db, 'scores', scoreId);
        const scoreSnap = await getDoc(scoreRef);
        
        if (!scoreSnap.exists() || scoreSnap.data().score < score) {
          await setDoc(scoreRef, {
            userId: user.uid,
            gameId: activeGame.id,
            score,
            updatedAt: new Date().toISOString()
          });
        }

        // Update coins
        if (profile) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            totalCoins: increment(score)
          });
          setProfile(prev => prev ? { ...prev, totalCoins: prev.totalCoins + score } : null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, scorePath);
      }
    }
    setActiveGame(null);
    setView('home');
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    if (user && profile && profile.robux >= item.price) {
      const userRef = doc(db, 'users', user.uid);
      const newInventory = [...profile.inventory, item.id];
      const newRobux = profile.robux - item.price;
      
      try {
        await updateDoc(userRef, {
          inventory: newInventory,
          robux: newRobux
        });
        setProfile(prev => prev ? { ...prev, inventory: newInventory, robux: newRobux } : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center rotate-12 shadow-2xl">
              <Gamepad2 size={60} className="text-black" />
            </div>
          </div>
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter uppercase italic">OpenBlox</h1>
          <p className="text-gray-400 mb-12 text-xl max-w-md mx-auto">
            The ultimate community-driven gaming platform. Build, play, and compete.
          </p>
          <button 
            onClick={handleLogin}
            className="px-12 py-5 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
          >
            GET STARTED <ChevronRight />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      {/* Sidebar */}
      <nav className="w-20 md:w-64 bg-[#111] border-r border-white/5 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
            <Gamepad2 size={24} className="text-black" />
          </div>
          <span className="font-black text-xl hidden md:block tracking-tighter uppercase italic">OpenBlox</span>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'profile', icon: UserIcon, label: 'Profile' },
            { id: 'avatar', icon: Shirt, label: 'Avatar' },
            { id: 'marketplace', icon: ShoppingCart, label: 'Marketplace' },
            { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
                view === item.id ? "bg-white text-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={24} />
              <span className="font-bold hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl hidden md:block">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Coins size={16} />
              <span className="font-bold">{(profile?.robux || 0).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500">Robux</div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={24} />
            <span className="font-bold hidden md:block">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {view === 'home' && !activeGame && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                  <h2 className="text-4xl font-black mb-2 tracking-tight">Welcome back, {profile?.displayName}!</h2>
                  <p className="text-gray-500">What are we playing today?</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {GAMES.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ y: -8 }}
                    className="group bg-[#111] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => setActiveGame(game)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl">
                          <Play size={32} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider", game.color)}>
                          {game.genre}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{game.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeGame && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <Home size={24} />
                  </button>
                  <h2 className="text-2xl font-black tracking-tight uppercase italic">{activeGame.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <Coins size={20} />
                  {profile?.robux.toLocaleString()}
                </div>
              </div>

              <div className="flex-1 min-h-[500px]">
                {activeGame.id === 'speed-run' && <SpeedRun onGameOver={handleGameOver} avatar={profile?.avatar} />}
                {activeGame.id === 'clicker-tycoon' && <ClickerTycoon onGameOver={handleGameOver} avatar={profile?.avatar} />}
                {activeGame.id === 'dodge-ball' && (
                  <div className="w-full h-full flex items-center justify-center bg-red-900/20 rounded-3xl border-2 border-dashed border-red-500/20">
                    <div className="text-center">
                      <Gamepad2 size={80} className="mx-auto mb-4 text-red-500 opacity-50" />
                      <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
                      <p className="text-gray-500 mb-6">We're still building this game world.</p>
                      <button 
                        onClick={() => setActiveGame(null)}
                        className="px-8 py-3 bg-white text-black rounded-full font-bold"
                      >
                        Back to Home
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[#111] rounded-[40px] p-12 border border-white/5">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                  <div className="w-48 h-48 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                    <AvatarDisplay avatar={profile?.avatar} size="lg" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-5xl font-black mb-2 tracking-tighter">{profile?.displayName}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Coins size={18} className="text-yellow-400" />
                        <span className="font-bold text-white">{profile?.robux.toLocaleString()} Robux</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-700 rounded-full" />
                      <span>Joined March 2026</span>
                    </div>
                    <button 
                      onClick={() => setView('avatar')}
                      className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-all"
                    >
                      Edit Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Games Played', value: '12', icon: Gamepad2 },
                    { label: 'Achievements', value: '4', icon: Trophy },
                    { label: 'Friends', value: '156', icon: UserIcon },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <stat.icon className="text-gray-500 mb-4" size={24} />
                      <div className="text-3xl font-black mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'avatar' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-black tracking-tight uppercase italic">Avatar Editor</h2>
                <button 
                  onClick={() => setView('home')}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold transition-all"
                >
                  Back to Home
                </button>
              </div>
              <AvatarEditor 
                currentAvatar={profile?.avatar} 
                inventory={profile?.inventory || []}
                onSave={async (newAvatar) => {
                  if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { avatar: newAvatar });
                    setProfile(prev => prev ? { ...prev, avatar: newAvatar } : null);
                    setView('profile');
                  }
                }} 
              />
            </motion.div>
          )}

          {view === 'marketplace' && profile && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Marketplace profile={profile} onPurchase={handlePurchase} />
            </motion.div>
          )}

          {view === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl font-black mb-8 tracking-tight uppercase italic">Global Leaderboards</h2>
              <div className="grid grid-cols-1 gap-8">
                {GAMES.map(game => (
                  <LeaderboardSection key={game.id} game={game} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface LeaderboardProps {
  game: Game;
  key?: string;
}

const LeaderboardSection: React.FC<LeaderboardProps> = ({ game }) => {
  const [topScores, setTopScores] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      where('gameId', '==', game.id),
      orderBy('score', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map(doc => doc.data());
      setTopScores(scores);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `scores/${game.id}`);
    });

    return unsubscribe;
  }, [game.id]);

  return (
    <div className="bg-[#111] rounded-3xl p-8 border border-white/5">
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", game.color)}>
          <Gamepad2 size={24} />
        </div>
        <h3 className="text-xl font-bold">{game.title} Top 5</h3>
      </div>
      
      <div className="space-y-4">
        {topScores.length > 0 ? topScores.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full font-bold text-sm">
                {i + 1}
              </span>
              <span className="font-bold text-gray-300">Player {s.userId.slice(0, 5)}...</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400 font-black">
              {s.score}
              <Trophy size={16} />
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500 italic">No scores yet. Be the first!</div>
        )}
      </div>
    </div>
  );
};
