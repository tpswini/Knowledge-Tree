import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Leaf, Star, Trophy, Flame, Zap, Clock, Target, Book, BookOpen, Lock } from 'lucide-react';

const ICONS = {
  Seedling: Leaf,
  Sprout: Star,
  TreePine: Trophy,
  Flame: Flame,
  Zap: Zap,
  Hourglass: Clock,
  Target: Target,
  Book: Book,
  BookOpen: BookOpen
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/achievements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAchievements(res.data);
      } catch (err) {
        setError('Failed to load achievements.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1a472a]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100) || 0;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a472a] to-[#2c7a4b] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Award size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Achievements</h1>
              <p className="text-emerald-100 mt-1">Unlock badges by reaching learning milestones.</p>
            </div>
          </div>
          
          <div className="mt-8 max-w-md">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>{unlockedCount} of {achievements.length} Unlocked</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Decorative background icon */}
        <Award className="absolute -right-8 -bottom-16 text-white/10" size={240} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {achievements.map((ach) => {
          const IconComponent = ICONS[ach.icon] || Award;
          const isUnlocked = ach.unlocked;

          return (
            <div 
              key={ach.id} 
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center p-6 ${
                isUnlocked 
                  ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-1' 
                  : 'bg-gray-50 border-gray-100 opacity-70 grayscale'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isUnlocked ? 'bg-emerald-100 text-[#1a472a]' : 'bg-gray-200 text-gray-400'
              }`}>
                <IconComponent size={32} />
              </div>
              
              <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {ach.title}
              </h3>
              <p className="text-sm text-gray-500 flex-1">
                {ach.description}
              </p>

              {!isUnlocked && (
                <div className="absolute top-3 right-3 text-gray-400">
                  <Lock size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Achievements;
