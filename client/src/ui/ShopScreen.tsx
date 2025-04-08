import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useShopStore, type ShopItem } from "../lib/stores/useShopStore";
import { useGameStore } from "../lib/stores/useGameStore";
import { ShoppingCart, Coins, ChevronLeft, Check, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

const ShopScreen: React.FC = () => {
  // States for filtering and viewing
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  
  // Get items from shop store
  const shopItems = useShopStore(state => state.items);
  const buyItem = useShopStore(state => state.buyItem);
  const equipItem = useShopStore(state => state.equipItem);
  
  // Get coins from game store
  const coins = useGameStore(state => state.coins);
  const totalCoins = useGameStore(state => state.totalCoins);
  const setGameState = useGameStore(state => state.setGameState);
  
  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);
  
  // Map category names to more readable labels
  const categoryLabels: Record<string, string> = {
    all: "All Items",
    character: "Characters",
    ability: "Abilities",
    booster: "Boosters",
    cosmetic: "Cosmetics"
  };

  // Handle dynamic import of Lucide icons
  const getIcon = (iconName: string): LucideIcon => {
    // @ts-ignore - Dynamically access icon component
    return LucideIcons[iconName] || LucideIcons.HelpCircle;
  };
  
  // Handle back to main menu
  const handleBack = () => {
    setGameState('title');
  };
  
  // Handle buying an item
  const handleBuyItem = (id: string) => {
    const success = buyItem(id);
    if (success) {
      console.log(`Successfully purchased item ${id}`);
    }
  };
  
  // Handle equipping an item
  const handleEquipItem = (id: string) => {
    equipItem(id);
  };
  
  // Handle selecting an item to see details
  const handleSelectItem = (item: ShopItem) => {
    setSelectedItem(item);
  };
  
  return (
    <div className="absolute inset-0 flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header area */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-gray-300 hover:text-white"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back
        </Button>
        
        <h1 className="text-xl font-bold flex items-center">
          <ShoppingCart size={24} className="mr-2" />
          Shop
        </h1>
        
        <div className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
          <Coins size={16} className="mr-1 text-yellow-400" />
          <span>{coins} / {totalCoins}</span>
        </div>
      </div>
      
      {/* Category selector */}
      <div className="bg-gray-800 border-t border-gray-700 flex overflow-x-auto">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => setSelectedCategory(key)}
            className={`py-2 px-4 ${selectedCategory === key ? 'border-b-2 border-blue-500' : ''}`}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Main shop area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Item grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const ItemIcon = getIcon(item.icon);
            return (
              <div
                key={item.id}
                className={`bg-gray-800 border ${
                  item.owned ? 'border-green-600' : 'border-gray-700'
                } rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="p-4 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.owned ? 'bg-green-900' : 'bg-gray-700'
                  }`}>
                    <ItemIcon size={24} className={item.owned ? 'text-green-400' : 'text-gray-300'} />
                  </div>
                  
                  <h3 className="mt-2 text-lg font-medium">
                    {item.name}
                    {item.equipped && <span className="ml-2 text-green-400">(Equipped)</span>}
                  </h3>
                  
                  <p className="mt-1 text-xs text-gray-400 text-center">{item.description}</p>
                  
                  <div className="mt-3">
                    {item.owned ? (
                      <Button
                        variant={item.equipped ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.equipped) handleEquipItem(item.id);
                        }}
                        className={item.equipped ? 'border-green-600 text-green-400' : ''}
                        disabled={item.equipped}
                      >
                        {item.equipped ? (
                          <>
                            <Check size={16} className="mr-1" /> Equipped
                          </>
                        ) : (
                          'Equip'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyItem(item.id);
                        }}
                        disabled={coins < item.cost}
                        className="flex items-center"
                      >
                        <Coins size={16} className="mr-1 text-yellow-400" />
                        {item.cost}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Item details panel (if an item is selected) */}
        {selectedItem && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            
            {/* Item icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                {React.createElement(getIcon(selectedItem.icon), { size: 36 })}
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400">Type</h3>
              <p className="capitalize">{selectedItem.type}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400">Status</h3>
              <p>
                {selectedItem.owned ? (
                  <span className="text-green-400">Owned</span>
                ) : (
                  <span className="text-yellow-400">Available for {selectedItem.cost} coins</span>
                )}
              </p>
            </div>
            
            <div className="mt-6">
              {selectedItem.owned ? (
                <Button
                  variant={selectedItem.equipped ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleEquipItem(selectedItem.id)}
                  className="w-full"
                  disabled={selectedItem.equipped}
                >
                  {selectedItem.equipped ? 'Currently Equipped' : 'Equip Item'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleBuyItem(selectedItem.id)}
                  className="w-full"
                  disabled={coins < selectedItem.cost}
                >
                  Buy for {selectedItem.cost} coins
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopScreen;
