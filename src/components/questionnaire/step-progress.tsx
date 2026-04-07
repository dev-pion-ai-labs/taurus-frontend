'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { QUESTIONNAIRE_STEPS } from '@/lib/constants';

interface StepProgressProps {
  currentStep: number;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <nav className="flex flex-col gap-0">
      {QUESTIONNAIRE_STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = index === QUESTIONNAIRE_STEPS.length - 1;

        return (
          <div key={step.id} className="flex gap-3.5">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? '#1C1917' : '#E7E5E4',
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-white' : 'text-[#78716C]'
                    }`}
                  >
                    {step.id}
                  </span>
                )}
              </motion.div>

              {/* Connector line */}
              {!isLast && (
                <div className="relative w-0.5 flex-1 bg-[#E7E5E4]">
                  <motion.div
                    initial={false}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="absolute left-0 top-0 w-full bg-[#1C1917]"
                  />
                </div>
              )}
            </div>

            {/* Label + description */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-semibold leading-8 transition-colors duration-300 ${
                  isCurrent
                    ? 'text-[#1C1917]'
                    : isCompleted
                    ? 'text-[#1C1917]'
                    : 'text-[#A8A29E]'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs leading-relaxed transition-colors duration-300 ${
                  isCurrent ? 'text-[#78716C]' : 'text-[#D6D3D1]'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// Compact mobile progress bar (shown on small screens)
export function MobileProgress({ currentStep }: StepProgressProps) {
  const totalSteps = QUESTIONNAIRE_STEPS.length;
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-[#78716C]">
          Step {currentStep} of {totalSteps} &middot;{' '}
          <span className="font-semibold text-[#1C1917]">
            {QUESTIONNAIRE_STEPS[currentStep - 1]?.label}
          </span>
        </p>
        <p className="text-xs font-semibold text-[#1C1917]">{percent}%</p>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#E7E5E4]">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-[#1C1917]"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
