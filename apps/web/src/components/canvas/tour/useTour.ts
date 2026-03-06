import { useState, useEffect, useCallback } from 'react';
import { TOUR_STEPS, type TourContext, type TourStep } from './tourSteps';
import type { Node } from '@xyflow/react';

const STORAGE_PREFIX = 'adis-tour-v1-';

export interface UseTourReturn {
  active: boolean;
  currentStep: TourStep | null;
  stepIndex: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
  restart: () => void;
}

export function useTour(context: TourContext, nodes: Node[] = []): UseTourReturn {
  const storageKey = STORAGE_PREFIX + context;
  const allSteps = TOUR_STEPS[context];

  // Filter out node-targeted steps that have no matching node on canvas
  const steps = allSteps.filter((step) => {
    if (!step.targetNodeTypes || step.targetNodeTypes.length === 0) return true;
    return nodes.some((n) => step.targetNodeTypes!.includes(n.type ?? ''));
  });

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Reset stepIndex when steps list changes (e.g. nodes loaded after delay)
  useEffect(() => {
    setStepIndex(0);
  }, [steps.length]);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        const timer = setTimeout(() => setActive(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      try {
        localStorage.setItem(storageKey, '1');
      } catch {}
      setActive(false);
    }
  }, [stepIndex, steps.length, storageKey]);

  const prev = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  const skip = useCallback(() => {
    try {
      localStorage.setItem(storageKey, '1');
    } catch {}
    setActive(false);
    setStepIndex(0);
  }, [storageKey]);

  const restart = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setStepIndex(0);
    setActive(true);
  }, [storageKey]);

  const currentStep: TourStep | null = active ? (steps[stepIndex] ?? null) : null;

  return { active, currentStep, stepIndex, totalSteps: steps.length, next, prev, skip, restart };
}
