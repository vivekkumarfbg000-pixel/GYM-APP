'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag, Search, Filter, Star, Plus } from 'lucide-react';
import { products } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function ShopPage() {
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                // In a real app, fetch user goal from profile context
                const res = await fetch('/api/ai/recommend-products', {
                    method: 'POST',
                    body: JSON.stringify({ goal: 'Muscle Gain', level: 'Intermediate' })
                });
                const data = await res.json();
                if (data.success) {
                    setRecommendations(data.data);
                }
            } catch (error) {
                console.error("Failed to load recs", error);
            } finally {
                setLoadingRecs(false);
            }
        };
        fetchRecs();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = category === 'All' || p.category === category;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', 'Supplements', 'Merchandise', 'Accessories', 'Beverages'];

    const handleBuy = (productName: string) => {
        toast.success(`Added ${productName} to cart!`, {
            description: "Proceed to checkout to complete order."
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="font-bold text-lg text-gray-900">Pro Shop</h1>
                    </div>
                    <div className="relative">
                        <ShoppingBag size={22} className="text-gray-700" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="px-4 pb-3 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search gear, supplements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            {!loadingRecs && recommendations.length > 0 && (
                <div className="pt-4 pl-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🤖</span>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900">Recommended for You</h3>
                            <p className="text-[10px] text-gray-500">Based on your Muscle Gain goal</p>
                        </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 pr-4 scrollbar-hide">
                        {recommendations.map((rec) => (
                            <div key={`rec-${rec.id}`} className="min-w-[140px] bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl shadow-lg border border-gray-700 relative">
                                <div className="absolute top-2 right-2 text-xs">✨</div>
                                <div className="aspect-square bg-gray-700/50 rounded-lg mb-2 flex items-center justify-center text-3xl">
                                    {rec.category === 'Supplements' ? '💊' : '🎒'}
                                </div>
                                <h4 className="text-white font-bold text-xs leading-tight mb-1 line-clamp-2">{rec.name}</h4>
                                <p className="text-[9px] text-gray-400 mb-2 line-clamp-2">{rec.reason}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-white font-bold text-xs">₹{rec.price}</span>
                                    <button onClick={() => handleBuy(rec.name)} className="bg-white text-black p-1 rounded-full">
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="px-4 pb-3 sticky top-[110px] z-0 bg-gray-50 pt-2">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === cat
                                ? 'bg-black text-white'
                                : 'bg-white border border-gray-200 text-gray-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden group">
                            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                {product.category === 'Supplements' ? '💊' :
                                    product.category === 'Merchandise' ? '👕' :
                                        product.category === 'Beverages' ? '🥤' : '🎒'}
                            </span>
                            {product.stock < 10 && (
                                <span className="absolute top-2 left-2 bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                    Low Stock
                                </span>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">{product.category}</p>

                            <div className="flex items-center gap-1 mb-3">
                                <Star size={10} className="text-yellow-400 fill-current" />
                                <span className="text-[10px] font-medium text-gray-700">4.8</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-gray-900">₹{product.price}</span>
                            <button
                                onClick={() => handleBuy(product.name)}
                                className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
