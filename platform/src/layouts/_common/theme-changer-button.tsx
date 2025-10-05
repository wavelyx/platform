import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';

// Settings tipini ve gerekli metotları tanımla
interface Settings {
  themeMode: string;
  onUpdate: (key: string, value: string) => void;
}

interface ThemeSwitcherButtonProps {
  settings: Settings;
}

const ThemeSwitcherButton: React.FC<ThemeSwitcherButtonProps> = ({ settings }) => {
  // Durumu ve başlangıç değerini ayarla
  const [themeMode, setThemeMode] = useState(settings.themeMode);

  const toggleThemeMode = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    settings.onUpdate('themeMode', newThemeMode);
  };

  return (
    <IconButton
      onClick={toggleThemeMode}
      aria-label="Toggle theme"
    >
      <Iconify width={24} height={24} icon={themeMode === 'light' ? 'tabler:moon' : 'tabler:sun'} />
    </IconButton>
  );
};

export default ThemeSwitcherButton;
