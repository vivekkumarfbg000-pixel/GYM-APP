'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { products, recentSales, productSalesMetrics, type Product } from '@/lib/mock-data';

export default function ProductsPage() {
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter(product => {
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

    return (
        <div className="space-y-6">
            {/* Header with Metrics */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Monthly Revenue"
                        value={`₹${(productSalesMetrics.totalRevenue / 1000).toFixed(0)}K`}
                        subtitle="From product sales"
                        icon="💰"
                        color="blue"
                    />
                    <MetricCard
                        title="Profit Margin"
                        value={`₹${(productSalesMetrics.totalProfit / 1000).toFixed(0)}K`}
                        subtitle={`${((productSalesMetrics.totalProfit / productSalesMetrics.totalRevenue) * 100).toFixed(0)}% margin`}
                        icon="📊"
                        color="green"
                    />
                    <MetricCard
                        title="Items Sold"
                        value={productSalesMetrics.itemsSold.toString()}
                        subtitle="This month"
                        icon="📦"
                        color="purple"
                    />
                    <MetricCard
                        title="Low Stock Alerts"
                        value={lowStockProducts.length.toString()}
                        subtitle="Need reorder"
                        icon="⚠️"
                        color="red"
                    />
                </div>
            </motion.div>

            {/* Low Stock Alert Banner */}
            {lowStockProducts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📦</span>
                                    <div>
                                        <p className="font-semibold text-orange-900">
                                            {lowStockProducts.length} products running low on stock
                                        </p>
                                        <p className="text-sm text-orange-700">
                                            {lowStockProducts.map(p => p.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="border-orange-300">
                                    Generate PO
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Inventory - 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Product Inventory</CardTitle>
                                    <CardDescription>{filteredProducts.length} products</CardDescription>
                                </div>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    + Add Product
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="flex gap-4 mb-6">
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Supplements">Supplements</SelectItem>
                                        <SelectItem value="Merchandise">Merchandise</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                        <SelectItem value="Beverages">Beverages</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Product Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.description}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <CategoryBadge category={product.category} />
                                            </TableCell>
                                            <TableCell className="font-semibold">₹{product.price}</TableCell>
                                            <TableCell>
                                                <StockBadge stock={product.stock} threshold={product.lowStockThreshold} />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.monthlySales} units</p>
                                                    <p className="text-xs text-gray-500">₹{(product.revenue / 1000).toFixed(0)}K</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    Quick Sale
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Sales & Top Sellers - 1 column */}
                <div className="space-y-6">
                    {/* Top Seller */}
                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🏆 Top Seller
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{productSalesMetrics.topSeller.name}</h3>
                                <p className="text-sm text-gray-600">{productSalesMetrics.topSeller.category}</p>
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="text-2xl font-bold text-purple-600">
                                        {productSalesMetrics.topSeller.monthlySales}
                                    </span>
                                    <span className="text-sm text-gray-600">units sold</span>
                                </div>
                                <div className="pt-3 border-t border-purple-200">
                                    <p className="text-xs text-gray-600">Revenue</p>
                                    <p className="text-xl font-bold text-purple-900">
                                        ₹{(productSalesMetrics.topSeller.revenue / 1000).toFixed(0)}K
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Sales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>Latest transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{sale.product}</p>
                                            <p className="text-xs text-gray-600">{sale.member}</p>
                                            <p className="text-xs text-gray-500 mt-1">{sale.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">₹{sale.amount}</p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {sale.method}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                📊 View Full Sales Report
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                📦 Generate Purchase Order
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                📥 Import Products (CSV)
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                🏷️ Manage Categories
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Sale Modal */}
            {selectedProduct && (
                <QuickSaleModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}

function MetricCard({ title, value, subtitle, icon, color }: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        red: 'from-red-500 to-orange-500',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        Supplements: 'bg-purple-100 text-purple-700',
        Merchandise: 'bg-blue-100 text-blue-700',
        Accessories: 'bg-green-100 text-green-700',
        Beverages: 'bg-orange-100 text-orange-700',
    };

    return (
        <Badge variant="secondary" className={colors[category]}>
            {category}
        </Badge>
    );
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
    if (stock <= threshold) {
        return <Badge variant="destructive">Low: {stock}</Badge>;
    }
    if (stock <= threshold * 1.5) {
        return <Badge className="bg-yellow-100 text-yellow-700">Med: {stock}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700">Good: {stock}</Badge>;
}

function QuickSaleModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const [quantity, setQuantity] = useState(1);
    const total = product.price * quantity;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Quick Sale</CardTitle>
                            <CardDescription>{product.name}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Price per unit</p>
                        <p className="text-2xl font-bold">₹{product.price}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Available: {product.stock} units</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-3xl font-bold text-blue-900">₹{total}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="w-full">
                            💳 Card
                        </Button>
                        <Button variant="outline" className="w-full">
                            💵 Cash
                        </Button>
                        <Button variant="outline" className="w-full">
                            📱 UPI
                        </Button>
                    </div>

                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                        Complete Sale
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
