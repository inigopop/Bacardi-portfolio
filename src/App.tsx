import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Clock, 
  Flame, 
  GlassWater, 
  Filter, 
  ChevronRight, 
  X,
  Info,
  ExternalLink
} from 'lucide-react';
import { COCKTAILS } from './constants';
import { Cocktail } from './types';

export default function App() {
  const [cocktails, setCocktails] = useState<Cocktail[]>(() => {
    const saved = localStorage.getItem('bacardi_archive_data');
    if (!saved) return COCKTAILS;
    
    const savedData: Cocktail[] = JSON.parse(saved);
    // Merge: keep saved data but add any new cocktails from COCKTAILS constant
    const merged = [...savedData];
    COCKTAILS.forEach(c => {
      if (!merged.find(m => m.nombre === c.nombre)) {
        merged.push(c);
      }
    });
    return merged;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const levels = useMemo(() => Array.from(new Set(cocktails.map(c => c.nivel))), [cocktails]);

  const filteredCocktails = useMemo(() => {
    return cocktails.filter(c => {
      const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.sabor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !selectedLevel || c.nivel === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchTerm, selectedLevel, cocktails]);

  const handleUpdateImage = () => {
    if (!selectedCocktail) return;
    
    const updated = cocktails.map(c => 
      c.nombre === selectedCocktail.nombre ? { ...c, imagen: newImageUrl } : c
    );
    
    setCocktails(updated);
    localStorage.setItem('bacardi_archive_data', JSON.stringify(updated));
    setSelectedCocktail({ ...selectedCocktail, imagen: newImageUrl });
    setIsEditingImage(false);
    setNewImageUrl('');
  };

  const openModal = (cocktail: Cocktail) => {
    setSelectedCocktail(cocktail);
    setIsEditingImage(false);
    setNewImageUrl(cocktail.imagen);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur-md border-b border-dark/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tighter mb-2">
              BACARDÍ <span className="italic font-normal">Archive</span>
            </h1>
            <p className="text-sm uppercase tracking-widest opacity-60 font-mono">
              The Definitive Collection of Rum Cocktails
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="text" 
                placeholder="Search by name or flavor..."
                className="bg-transparent border-b border-dark/20 focus:border-gold outline-none pl-10 pr-4 py-2 w-full sm:w-64 font-sans transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              <button 
                onClick={() => setSelectedLevel(null)}
                className={`px-4 py-2 text-xs uppercase tracking-widest border rounded-full transition-all whitespace-nowrap ${!selectedLevel ? 'bg-dark text-paper border-dark' : 'border-dark/20 hover:border-dark'}`}
              >
                All Levels
              </button>
              {levels.map(level => (
                <button 
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border rounded-full transition-all whitespace-nowrap ${selectedLevel === level ? 'bg-dark text-paper border-dark' : 'border-dark/20 hover:border-dark'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-dark/10 border border-dark/10">
          <AnimatePresence mode="popLayout">
            {filteredCocktails.map((cocktail, index) => (
              <motion.div
                layout
                key={cocktail.nombre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-paper p-8 flex flex-col group cursor-pointer hover:bg-gold/5 transition-colors relative overflow-hidden"
                onClick={() => openModal(cocktail)}
              >
                <div className="relative h-48 -mx-8 -mt-8 mb-8 overflow-hidden">
                  <img 
                    src={cocktail.imagen} 
                    alt={cocktail.nombre}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-dark/20 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-[10px] opacity-40 tracking-tighter">
                    0{index + 1} / {COCKTAILS.length}
                  </span>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-mono">{cocktail.tiempo_minutos || '?'}m</span>
                    </div>
                  </div>
                </div>

                <h2 className="font-serif text-3xl mb-4 group-hover:translate-x-2 transition-transform duration-500">
                  {cocktail.nombre}
                </h2>
                
                <div className="mt-auto pt-8 flex items-center justify-between border-t border-dark/5">
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 italic">
                    {cocktail.sabor}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCocktails.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl opacity-40 italic">No cocktails found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCocktail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCocktail(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            
            <motion.div 
              layoutId={selectedCocktail.nombre}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-paper shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto"
            >
              <button 
                onClick={() => setSelectedCocktail(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-paper/20 hover:bg-paper/40 rounded-full transition-colors text-paper md:text-dark md:bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-2/5 relative min-h-[300px] md:min-h-0 group/img">
                <img 
                  src={selectedCocktail.imagen} 
                  alt={selectedCocktail.nombre}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-80 md:hidden" />
                
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-6">
                  {!isEditingImage ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingImage(true); }}
                      className="bg-paper text-dark px-4 py-2 text-[10px] uppercase tracking-widest font-mono flex items-center gap-2 hover:bg-gold transition-colors"
                    >
                      <Filter className="w-3 h-3" />
                      Change Photo Link
                    </button>
                  ) : (
                    <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="w-full bg-paper/90 text-dark p-2 text-xs outline-none font-mono"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleUpdateImage}
                          className="flex-1 bg-gold text-dark py-2 text-[10px] uppercase tracking-widest font-mono"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setIsEditingImage(false)}
                          className="flex-1 bg-paper text-dark py-2 text-[10px] uppercase tracking-widest font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 md:hidden">
                  <h3 className="font-serif text-4xl text-paper mb-2">
                    {selectedCocktail.nombre}
                  </h3>
                </div>
              </div>

              <div className="w-full md:w-1/3 bg-dark text-paper p-8 flex flex-col justify-between">
                <div className="hidden md:block">
                  <h3 className="font-serif text-4xl mb-6 leading-tight">
                    {selectedCocktail.nombre}
                  </h3>
                  <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest opacity-70">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Prep: {selectedCocktail.tiempo_minutos || '?'} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-3 h-3" />
                      <span>Level: {selectedCocktail.nivel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlassWater className="w-3 h-3" />
                      <span>Flavor: {selectedCocktail.sabor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-paper/10">
                  {selectedCocktail.url && (
                    <a 
                      href={selectedCocktail.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold hover:text-paper transition-colors mb-6"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Official Recipe
                    </a>
                  )}
                  <p className="text-[9px] leading-relaxed opacity-50 italic">
                    "A classic expression of Bacardí heritage, crafted for the discerning palate."
                  </p>
                </div>
              </div>

              <div className="flex-1 p-8 sm:p-12 overflow-y-auto max-h-[70vh] md:max-h-none">
                <h4 className="font-serif italic text-xl mb-8 border-b border-dark/10 pb-2">Ingredients</h4>
                <ul className="space-y-6">
                  {selectedCocktail.ingredientes.map((ing, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (i * 0.05) }}
                      key={i} 
                      className="flex items-start gap-4 group"
                    >
                      <span className="font-mono text-[10px] opacity-30 mt-1">0{i+1}</span>
                      <span className="text-sm leading-relaxed border-b border-transparent group-hover:border-gold/30 transition-colors">
                        {ing}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="mt-12 p-6 bg-gold/5 border border-gold/10 rounded-sm">
                  <div className="flex gap-3 items-start">
                    <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed opacity-70 italic">
                      Always use fresh ingredients and high-quality ice for the best results. Shake or stir as directed by tradition.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-dark/10 mt-20 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          &copy; 2026 Bacardí Archive &bull; Drink Responsibly
        </p>
      </footer>
    </div>
  );
}
