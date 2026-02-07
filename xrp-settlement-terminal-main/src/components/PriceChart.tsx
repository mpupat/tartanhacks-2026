import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries, type IChartApi } from 'lightweight-charts';
import { fetchXRPPriceSimple } from '@/services/priceService';

interface PriceChartProps {
    height?: number;
}

interface PricePoint {
    time: number;
    value: number;
}

export function PriceChart({ height = 200 }: PriceChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#6b7280',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            width: chartContainerRef.current.clientWidth,
            height,
            timeScale: {
                visible: false,
            },
            rightPriceScale: {
                visible: false,
            },
            leftPriceScale: {
                visible: false,
            },
            crosshair: {
                horzLine: { visible: false },
                vertLine: { visible: false },
            },
            handleScale: false,
            handleScroll: false,
        });

        // Area series with gold/green colors
        const series = chart.addSeries(AreaSeries, {
            lineColor: '#f59e0b', // Amber/Gold
            topColor: 'rgba(245, 158, 11, 0.4)',
            bottomColor: 'rgba(245, 158, 11, 0.0)',
            lineWidth: 3,
            priceLineVisible: false,
            lastValueVisible: false,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [height]);

    // Generate initial data and fetch live prices
    useEffect(() => {
        const generateData = async () => {
            try {
                const price = await fetchXRPPriceSimple();
                setCurrentPrice(price);

                // Generate historical points (simulated)
                const now = Math.floor(Date.now() / 1000);
                const points: PricePoint[] = [];
                let basePrice = price * 0.98;

                // Generate 60 points, ending just before now
                for (let i = 60; i >= 1; i--) {
                    const time = now - (i * 60);
                    const variation = (Math.random() - 0.45) * 0.005 * basePrice;
                    basePrice = basePrice + variation;
                    points.push({
                        time,
                        value: Number(basePrice.toFixed(4)),
                    });
                }

                // Add current price as final point
                points.push({ time: now, value: price });

                setPriceHistory(points);
                setPriceChange(((price - points[0].value) / points[0].value) * 100);

                if (seriesRef.current) {
                    seriesRef.current.setData(points);
                    chartRef.current?.timeScale().fitContent();
                }
            } catch (error) {
                console.error('Failed to load chart data:', error);
            }
        };

        generateData();

        // Update every 10 seconds
        const interval = setInterval(async () => {
            try {
                const price = await fetchXRPPriceSimple();
                setCurrentPrice(price);

                if (priceHistory.length > 0) {
                    const firstPrice = priceHistory[0].value;
                    setPriceChange(((price - firstPrice) / firstPrice) * 100);
                }
            } catch (error) {
                console.error('Failed to update price:', error);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Update chart color based on price change (green for up, red for down)
    useEffect(() => {
        if (seriesRef.current) {
            // Use amber/gold for positive, red for negative
            const color = priceChange >= 0 ? '#f59e0b' : '#ef4444';
            seriesRef.current.applyOptions({
                lineColor: color,
                topColor: priceChange >= 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.3)',
                bottomColor: priceChange >= 0 ? 'rgba(245, 158, 11, 0.0)' : 'rgba(239, 68, 68, 0.0)',
            });
        }
    }, [priceChange]);

    return (
        <div className="w-full">
            <div ref={chartContainerRef} className="w-full" style={{ height }} />
        </div>
    );
}
