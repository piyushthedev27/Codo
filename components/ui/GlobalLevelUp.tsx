'use client';

import { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/useRewards';
import LevelUpModal from './LevelUpModal';

export default function GlobalLevelUp() {
    const { xp } = useRewards();
    const currentLevel = Math.floor(xp / 1000) + 1;

    // Use null initially so we don't trigger a level up on first mount if they are > level 1
    const [prevLevel, setPrevLevel] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [levelUpData, setLevelUpData] = useState({ oldLevel: 1, newLevel: 2 });

    useEffect(() => {
        if (prevLevel === null) {
            // Initial mount: set the baseline level
            setPrevLevel(currentLevel);
        } else if (currentLevel > prevLevel) {
            // Level increased!
            setLevelUpData({ oldLevel: prevLevel, newLevel: currentLevel });
            setIsOpen(true);
            setPrevLevel(currentLevel);
        } else if (currentLevel < prevLevel) {
            // Level decreased (e.g. storage cleared or manipulated)
            setPrevLevel(currentLevel);
        }
    }, [currentLevel, prevLevel]);

    return (
        <LevelUpModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            oldLevel={levelUpData.oldLevel}
            newLevel={levelUpData.newLevel}
            rewards={[
                { icon: '💎', label: `${levelUpData.newLevel * 50} Gems` },
                { icon: '🚀', label: 'More Content' },
                { icon: '🏷️', label: `Level ${levelUpData.newLevel} Title` },
            ]}
        />
    );
}
