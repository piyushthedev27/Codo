'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface RewardsContextType {
    coins: number;
    xp: number;
    addCoins: (amount: number) => void;
    addXp: (amount: number) => void;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
    const [coins, setCoins] = useState(0);
    const [xp, setXp] = useState(0);

    // Load from local storage on mount
    useEffect(() => {
        const storedCoins = localStorage.getItem('codo_coins');
        const storedXp = localStorage.getItem('codo_xp');
        if (storedCoins) setCoins(parseInt(storedCoins, 10) || 0);
        if (storedXp) setXp(parseInt(storedXp, 10) || 0);
    }, []);

    const addCoins = (amount: number) => {
        setCoins(prev => {
            const next = prev + amount;
            localStorage.setItem('codo_coins', next.toString());
            return next;
        });
    };

    const addXp = (amount: number) => {
        setXp(prev => {
            const next = prev + amount;
            localStorage.setItem('codo_xp', next.toString());
            return next;
        });
    };

    return (
        <RewardsContext.Provider value={{ coins, xp, addCoins, addXp }}>
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    const context = useContext(RewardsContext);
    if (context === undefined) {
        throw new Error('useRewards must be used within a RewardsProvider');
    }
    return context;
}
