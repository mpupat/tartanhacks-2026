import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, type IChartApi } from 'lightweight-charts';
import type { Candle } from '@/types/positionTypes';
import { fetchXRPPriceSimple } from '@/services/priceService';

interface CandlestickChartProps {
    height?: number;
}

export function CandlestickChart({ height = 300 }: CandlestickChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ReturnType<typeof CandlestickSeries.prototype.api> | null>(null);
    const [candles, setCandles] = useState<Candle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height,
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            crosshair: {
                mode: 1,
            },
        });

        // New API for v4+: use chart.addSeries with CandlestickSeries
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        // Handle resize
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

    // Generate and update candle data
    useEffect(() => {
        const generateInitialCandles = async () => {
            setIsLoading(true);
            try {
                const currentPrice = await fetchXRPPriceSimple();
                const now = Math.floor(Date.now() / 1000);
                const candleInterval = 60; // 1 minute candles
                const candleCount = 60;

                const initialCandles: Candle[] = [];
                let basePrice = currentPrice * 0.995; // Start slightly below current

                for (let i = candleCount; i >= 0; i--) {
                    const time = now - (i * candleInterval);
                    const volatility = 0.002;

                    const open = basePrice;
                    const change = (Math.random() - 0.48) * volatility * basePrice;
                    const close = open + change;
                    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
                    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;

                    initialCandles.push({
                        time,
                        open: Number(open.toFixed(4)),
                        high: Number(high.toFixed(4)),
                        low: Number(low.toFixed(4)),
                        close: Number(close.toFixed(4)),
                    });

                    basePrice = close;
                }

                setCandles(initialCandles);
                if (candleSeriesRef.current) {
                    candleSeriesRef.current.setData(initialCandles as any);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to generate candles:', error);
                setIsLoading(false);
            }
        };

        generateInitialCandles();
    }, []);

    // Real-time updates
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const currentPrice = await fetchXRPPriceSimple();
                const now = Math.floor(Date.now() / 1000);
                const candleInterval = 60;
                const currentCandleTime = Math.floor(now / candleInterval) * candleInterval;

                setCandles(prev => {
                    if (prev.length === 0) return prev;

                    const lastCandle = prev[prev.length - 1];

                    if (lastCandle.time === currentCandleTime) {
                        // Update existing candle
                        const updated = {
                            ...lastCandle,
                            high: Math.max(lastCandle.high, currentPrice),
                            low: Math.min(lastCandle.low, currentPrice),
                            close: currentPrice,
                        };
                        const newCandles = [...prev.slice(0, -1), updated];
                        if (candleSeriesRef.current) {
                            candleSeriesRef.current.update(updated as any);
                        }
                        return newCandles;
                    } else {
                        // New candle
                        const newCandle: Candle = {
                            time: currentCandleTime,
                            open: lastCandle.close,
                            high: Math.max(lastCandle.close, currentPrice),
                            low: Math.min(lastCandle.close, currentPrice),
                            close: currentPrice,
                        };
                        const newCandles = [...prev, newCandle].slice(-60);
                        if (candleSeriesRef.current) {
                            candleSeriesRef.current.update(newCandle as any);
                        }
                        return newCandles;
                    }
                });
            } catch (error) {
                console.error('Failed to update candle:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="terminal-grid p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="terminal-header text-xs">XRP/USD CHART</span>
                <span className="text-2xs text-muted-foreground">1M CANDLES</span>
            </div>
            <div ref={chartContainerRef} className="w-full" style={{ height }}>
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground text-sm">Loading chart...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
