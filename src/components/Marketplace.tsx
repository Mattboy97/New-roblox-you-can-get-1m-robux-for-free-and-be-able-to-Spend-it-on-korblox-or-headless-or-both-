import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Coins, CheckCircle2 } from 'lucide-react';
import { MARKETPLACE_ITEMS, MarketplaceItem, UserProfile } from '../types';
import { cn } from '../utils/cn';

interface MarketplaceProps {
  profile: UserProfile;
  onPurchase: (item: MarketplaceItem) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ profile, onPurchase }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight uppercase italic">Marketplace</h2>
          <p className="text-gray-500">Get the most exclusive items in OpenBlox</p>
        </div>
        <div className="bg-yellow-400/10 border border-yellow-400/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Coins className="text-yellow-400" size={24} />
          <span className="text-2xl font-black text-yellow-400">{profile.robux.toLocaleString()} Robux</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MARKETPLACE_ITEMS.map((item) => {
          const isOwned = profile.inventory.includes(item.id);
          const canAfford = profile.robux >= item.price;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -8 }}
              className="bg-[#111] rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-all flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-white/5 p-8 flex items-center justify-center">
                <img 
                  src={item.thumbnail} 
                  alt={item.name}
                  className="w-full h-full object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    item.type === 'bundle' ? "bg-purple-500" : "bg-blue-500"
                  )}>
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-black">
                    <Coins size={16} />
                    <span>{item.price.toLocaleString()}</span>
                  </div>
                  
                  {isOwned ? (
                    <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                      <CheckCircle2 size={18} />
                      Owned
                    </div>
                  ) : (
                    <button
                      onClick={() => onPurchase(item)}
                      disabled={!canAfford}
                      className={cn(
                        "px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        canAfford 
                          ? "bg-white text-black hover:scale-105 active:scale-95" 
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                    >
                      <ShoppingCart size={16} />
                      Buy
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
