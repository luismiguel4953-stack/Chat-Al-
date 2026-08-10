import React from 'react';
import { motion } from 'motion/react';
import { MascotFigure } from './MascotFigure';

interface ThinkingIndicatorProps {
  modelName?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ modelName = 'LM Chat AI' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <MascotFigure state="typing" text="Redactando respuesta en tiempo real..." modelName={modelName} />
    </motion.div>
  );
};
