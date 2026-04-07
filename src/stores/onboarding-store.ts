'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingData, UploadedDocument } from '@/types';

const INITIAL_FORM_DATA: OnboardingData = {
  companyName: '',
  industryId: '',
  customIndustry: '',
  companySize: '',
  businessDescription: '',
  revenueStreams: '',
  selectedChallenges: [],
  customChallenges: '',
  availableData: [],
  customDataSources: '',
  selectedTools: [],
  customTools: '',
  selectedGoals: [],
  customGoals: '',
};

interface OnboardingState {
  currentStep: number;
  formData: OnboardingData;
  documents: UploadedDocument[];
  initialized: boolean;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<OnboardingData>) => void;
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  initialize: (data: Partial<OnboardingData>, step: number, docs: UploadedDocument[]) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: { ...INITIAL_FORM_DATA },
      documents: [],
      initialized: false,
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc],
        })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
      initialize: (data, step, docs) =>
        set({
          formData: { ...INITIAL_FORM_DATA, ...data },
          currentStep: step,
          documents: docs,
          initialized: true,
        }),
      reset: () =>
        set({
          currentStep: 1,
          formData: { ...INITIAL_FORM_DATA },
          documents: [],
          initialized: false,
        }),
    }),
    {
      name: 'taurus-onboarding',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        documents: state.documents,
      }),
    }
  )
);
