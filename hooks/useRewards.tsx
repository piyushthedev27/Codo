'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface RewardsContextType {
    coins: number;
    xp: number;
    streak: number;
    lessonsDone: number;
    coinsSpent: number;
    addCoins: (amount: number) => void;
    addXp: (amount: number) => void;
    addLesson: () => void;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
    const [coins, setCoins] = useState(0);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lessonsDone, setLessonsDone] = useState(0);
    const [coinsSpent, setCoinsSpent] = useState(0);

    // Load from local storage on mount
    useEffect(() => {
        const storedCoins = localStorage.getItem('codo_coins');
        const storedXp = localStorage.getItem('codo_xp');
        const storedStreak = localStorage.getItem('codo_streak');
        const storedLessons = localStorage.getItem('codo_lessons');
        const storedCoinsSpent = localStorage.getItem('codo_coins_spent');
        const lastActiveDate = localStorage.getItem('codo_last_active');

        if (storedCoins) setCoins(parseInt(storedCoins, 10) || 0);
        if (storedXp) setXp(parseInt(storedXp, 10) || 0);
        if (storedLessons) setLessonsDone(parseInt(storedLessons, 10) || 0);
        if (storedCoinsSpent) setCoinsSpent(parseInt(storedCoinsSpent, 10) || 0);

        // Process Streak calculation based on today
        const today = new Date().toDateString();
        let currentStreak = parseInt(storedStreak || '0', 10);

        if (lastActiveDate && lastActiveDate !== today) {
            const lastDate = new Date(lastActiveDate);
            const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If it's been more than 1 day (+ timezone padding), break the streak
            if (diffDays > 1) {
                currentStreak = 0;
            }
        } else if (!lastActiveDate) {
            currentStreak = 0;
        }

        setStreak(currentStreak);
        localStorage.setItem('codo_streak', currentStreak.toString());

    }, []);

    const updateActivityAndStreak = () => {
        const today = new Date().toDateString();
        const lastActiveDate = localStorage.getItem('codo_last_active');

        if (lastActiveDate !== today) {
            // First activity of today
            setStreak(prev => {
                const next = prev + 1;
                localStorage.setItem('codo_streak', next.toString());
                return next;
            });
            localStorage.setItem('codo_last_active', today);
        }
    };

    const addCoins = (amount: number) => {
        setCoins(prev => {
            const next = prev + amount;
            localStorage.setItem('codo_coins', next.toString());
            return next;
        });

        // Track spending
        if (amount < 0) {
            setCoinsSpent(prev => {
                const next = prev + Math.abs(amount);
                localStorage.setItem('codo_coins_spent', next.toString());
                return next;
            });
        }
    };

    const addXp = (amount: number) => {
        setXp(prev => {
            const next = prev + amount;
            localStorage.setItem('codo_xp', next.toString());
            return next;
        });
        updateActivityAndStreak(); // Earning XP counts as daily activity
    };

    const addLesson = () => {
        setLessonsDone(prev => {
            const next = prev + 1;
            localStorage.setItem('codo_lessons', next.toString());
            return next;
        });
        updateActivityAndStreak(); // Finishing a lesson counts as activity
    };

    return (
        <RewardsContext.Provider value={{ coins, xp, streak, lessonsDone, coinsSpent, addCoins, addXp, addLesson }}>
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
