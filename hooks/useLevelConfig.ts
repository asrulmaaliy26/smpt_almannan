import { useContext } from 'react';
import { LevelConfigContext } from '../App';
import { LevelConfigData, EducationLevel } from '../types';

// Custom hook untuk mengakses LEVEL_CONFIG dari context
// Dijamin ada karena App.tsx memblokir render sampai config terload
export const useLevelConfig = (): LevelConfigData => {
    const levelConfig = useContext(LevelConfigContext);
    if (!levelConfig) {
        throw new Error("useLevelConfig must be used within a LevelConfigProvider with loaded data");
    }
    return levelConfig;
};
