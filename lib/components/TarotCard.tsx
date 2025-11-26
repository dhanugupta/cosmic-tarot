'use client';

import React from 'react';
import styles from './TarotCard.module.css';

interface TarotCardProps {
  imageSrc: string;
  name?: string;
  description?: string;
  cardLabel: string;
  reversed?: boolean;
  revealed?: boolean;
  size?: 'normal' | 'small' | 'compact';
}

export default function TarotCard({
  imageSrc,
  name,
  description,
  cardLabel,
  reversed = false,
  revealed = false,
  size = 'normal',
}: TarotCardProps) {
  const sizeClass = size === 'small' ? styles.small : size === 'compact' ? styles.compact : '';
  
  return (
    <div className={`${styles.cardWrapper} ${sizeClass}`}>
      <div className={`${styles.card} ${revealed ? styles.revealed : ''} ${sizeClass}`}>
        {revealed ? (
          <img
            className={reversed ? styles.reversed : ''}
            src={imageSrc}
            alt={name || cardLabel}
          />
        ) : (
          <div className={styles.cardBack}>
            <div className={styles.mysticalSymbol}>✦</div>
          </div>
        )}
      </div>
      <div className={styles.cardLabel}>{cardLabel}</div>
    </div>
  );
}

