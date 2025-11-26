'use client';

import React, { useState } from 'react';
import { useTarotReading } from '@/lib/hooks/useTarotReading';
import Header from '@/lib/components/Header';
import NavigationTabs from '@/lib/components/NavigationTabs';
import StepIndicator from '@/lib/components/StepIndicator';
import PersonalizationStep from '@/lib/components/PersonalizationStep';
import CardDrawingStep from '@/lib/components/CardDrawingStep';
import LoadingScreen from '@/lib/components/LoadingScreen';
import ReadingDisplayStep from '@/lib/components/ReadingDisplayStep';
import ReadingLimitWarning from '@/lib/components/ReadingLimitWarning';
import CardLibrary from '@/lib/components/CardLibrary';
import './globals.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'reading' | 'learn'>('reading');
  const {
    currentStep,
    userName,
    responseReading,
    isLoading,
    past,
    present,
    future,
    cardsRevealed,
    remainingReadings,
    readingLimitError,
    setUserName,
    setCurrentStep,
    drawCard,
    startNewReading,
    setReadingLimitError,
  } = useTarotReading();

  const handleNextStep = () => {
    if (userName.trim().length > 0) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && currentStep !== 3) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="cosmic-container">
      <Header />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Learning Tab */}
      {activeTab === 'learn' && (
        <CardLibrary />
      )}

      {/* Reading Tab */}
      {activeTab === 'reading' && (
        <>
          <StepIndicator currentStep={currentStep} />

      {/* Step 1: Personalization */}
      {currentStep === 1 && (
        <PersonalizationStep
          userName={userName}
          remainingReadings={remainingReadings}
          onUserNameChange={setUserName}
          onNext={handleNextStep}
        />
      )}

      {/* Reading Limit Warning */}
      {readingLimitError && (
        <ReadingLimitWarning
          error={readingLimitError}
          onDismiss={() => setReadingLimitError(null)}
        />
      )}

      {/* Step 2: Draw Cards or Loading */}
      {currentStep === 2 && (
        <>
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <CardDrawingStep
              userName={userName}
              past={past}
              present={present}
              future={future}
              cardsRevealed={cardsRevealed}
              remainingReadings={remainingReadings}
              onDrawCard={drawCard}
              onBack={handlePreviousStep}
            />
          )}
        </>
      )}

      {/* Step 3: Reading Display */}
      {currentStep === 3 && responseReading && !isLoading && (
        <ReadingDisplayStep
          reading={responseReading}
          past={past}
          present={present}
          future={future}
          onStartNewReading={startNewReading}
        />
      )}
        </>
      )}
    </div>
  );
}
