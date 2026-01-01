"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { PremiumUpgradePopup } from "./PremiumUpgradePopup";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { TrialExpiredPopup } from "./TrialExpiredPopup";
import { GenreSelectionPopup } from "./GenreSelectionPopup";
import { DailyRecommendationPopup } from "./DailyRecommendationPopup";

const PREMIUM_POPUP_KEY = "premium_popup_dismissed_at";
const ONBOARDING_KEY = "onboarding_completed";
const TRIAL_EXPIRED_POPUP_KEY = "trial_expired_popup_dismissed_at";
const DAILY_RECOMMENDATION_KEY = "daily_recommendation_shown_at";
const PREMIUM_POPUP_DELAY_DAYS = 7;

export function PopupManager() {
  const { data: session } = useSession();
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const [showGenreSelection, setShowGenreSelection] = useState(false);
  const [showDailyRecommendation, setShowDailyRecommendation] = useState(false);

  // Get current user data
  const { data: currentUser } = trpc.user.getCurrent.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Get premium status to check trial expiration
  const { data: premiumStatus } = trpc.user.getPremiumStatus.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Update genre preferences mutation
  const updateGenrePreferences = trpc.user.updateGenrePreferences.useMutation();

  // Get daily recommendations
  const { data: dailyRecommendations } = trpc.discovery.getDailyRecommendations.useQuery(
    { limit: 5 },
    {
      enabled: !!session?.user && showDailyRecommendation,
    }
  );

  useEffect(() => {
    if (!session?.user || !currentUser) return;

    // 最優先: ジャンル選択がまだの場合は表示
    if (!currentUser.hasCompletedGenreSelection) {
      setShowGenreSelection(true);
      return;
    }

    // Check if trial has expired
    if (premiumStatus) {
      const now = new Date();
      const isTrialExpired =
        premiumStatus.trialEndsAt &&
        new Date(premiumStatus.trialEndsAt) < now &&
        !premiumStatus.isSubscriptionActive;

      if (isTrialExpired) {
        // Check if trial expired popup was recently dismissed
        const dismissedAt = localStorage.getItem(TRIAL_EXPIRED_POPUP_KEY);
        if (dismissedAt) {
          const dismissedDate = new Date(parseInt(dismissedAt));
          const hoursSinceDismissed = Math.floor(
            (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60)
          );

          // Show again after 24 hours
          if (hoursSinceDismissed < 24) {
            return;
          }
        }

        // Show trial expired popup immediately
        setShowTrialExpired(true);
        return;
      }
    }

    // Check if user is already premium
    const isPremium = (session.user as any).membershipType === "PREMIUM";
    if (isPremium) return;

    // Check onboarding status
    const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingCompleted) {
      // Show onboarding for new users
      setShowOnboarding(true);
      return;
    }

    // Check if daily recommendation should be shown
    const lastShownStr = localStorage.getItem(DAILY_RECOMMENDATION_KEY);
    const now = new Date();

    if (lastShownStr) {
      const lastShown = new Date(parseInt(lastShownStr));
      const isSameDay =
        lastShown.getFullYear() === now.getFullYear() &&
        lastShown.getMonth() === now.getMonth() &&
        lastShown.getDate() === now.getDate();

      // If already shown today, don't show again
      if (isSameDay) {
        // Continue to check premium popup
      } else {
        // New day - schedule popup at random time (1-5 minutes)
        const randomDelay = Math.floor(Math.random() * 4 * 60 * 1000) + 60 * 1000;
        const timer = setTimeout(() => {
          setShowDailyRecommendation(true);
          localStorage.setItem(DAILY_RECOMMENDATION_KEY, Date.now().toString());
        }, randomDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // First time - show after random delay
      const randomDelay = Math.floor(Math.random() * 4 * 60 * 1000) + 60 * 1000;
      const timer = setTimeout(() => {
        setShowDailyRecommendation(true);
        localStorage.setItem(DAILY_RECOMMENDATION_KEY, Date.now().toString());
      }, randomDelay);

      return () => clearTimeout(timer);
    }

    // Check when premium popup was last dismissed
    const dismissedAt = localStorage.getItem(PREMIUM_POPUP_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt));
      const now = new Date();
      const daysSinceDismissed = Math.floor(
        (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Don't show if dismissed within the delay period
      if (daysSinceDismissed < PREMIUM_POPUP_DELAY_DAYS) {
        return;
      }
    }

    // Show premium popup after a delay (5 seconds)
    const timer = setTimeout(() => {
      setShowPremiumPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [session, currentUser, premiumStatus]);

  const handlePremiumPopupClose = (dontShowAgain: boolean) => {
    setShowPremiumPopup(false);
    if (dontShowAgain) {
      localStorage.setItem(PREMIUM_POPUP_KEY, Date.now().toString());
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  const handleTrialExpiredClose = () => {
    setShowTrialExpired(false);
    localStorage.setItem(TRIAL_EXPIRED_POPUP_KEY, Date.now().toString());
  };

  const handleGenreSelectionComplete = async (selectedGenres: string[]) => {
    try {
      await updateGenrePreferences.mutateAsync({ genres: selectedGenres });
      setShowGenreSelection(false);
    } catch (error) {
      console.error("Failed to update genre preferences:", error);
      alert("ジャンルの保存に失敗しました。もう一度お試しください。");
    }
  };

  const handleDailyRecommendationClose = () => {
    setShowDailyRecommendation(false);
  };

  return (
    <>
      <GenreSelectionPopup
        isOpen={showGenreSelection}
        onComplete={handleGenreSelectionComplete}
      />
      <OnboardingTutorial
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
      <DailyRecommendationPopup
        isOpen={showDailyRecommendation}
        onClose={handleDailyRecommendationClose}
        recommendations={dailyRecommendations?.books || []}
      />
      <TrialExpiredPopup
        isOpen={showTrialExpired}
        onClose={handleTrialExpiredClose}
        trialEndsAt={premiumStatus?.trialEndsAt}
      />
      <PremiumUpgradePopup
        isOpen={showPremiumPopup}
        onClose={handlePremiumPopupClose}
      />
    </>
  );
}
