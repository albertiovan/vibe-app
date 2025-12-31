/**
 * ActivityCompletionWrapper
 * Checks for pending activities on app launch and shows completion modal
 */

import React, { useState, useEffect } from 'react';
import { ActivityCompletionModal } from '../ui/components/ActivityCompletionModal';
import { userStorage } from '../src/services/userStorage';
import { API_BASE_URL } from '../src/config/api';

interface ActivityCompletionWrapperProps {
  children: React.ReactNode;
}

export function ActivityCompletionWrapper({ children }: ActivityCompletionWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkForPendingActivity();
  }, []);

  async function checkForPendingActivity() {
    try {
      const account = await userStorage.getAccount();
      if (!account?.userId) {
        setIsChecking(false);
        return;
      }

      // Call backend API to check for promptable activity
      const response = await fetch(
        `${API_BASE_URL}/api/activity-completion/promptable?userId=${account.userId}`
      );

      if (response.ok) {
        const activity = await response.json();
        if (activity) {
          setPendingActivity(activity);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking for pending activity:', error);
    } finally {
      setIsChecking(false);
    }
  }

  async function handleComplete(rating: number, photoUrl?: string) {
    try {
      // Upload photo if provided
      let uploadedPhotoUrl = photoUrl;
      if (photoUrl) {
        // TODO: Implement photo upload to backend
        // For now, just use the local URI
        uploadedPhotoUrl = photoUrl;
      }

      // Send completion to backend
      await fetch(
        `${API_BASE_URL}/api/activity-completion/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: pendingActivity.id,
            rating,
            photoUrl: uploadedPhotoUrl,
          }),
        }
      );

      setShowModal(false);
      setPendingActivity(null);
    } catch (error) {
      console.error('Error completing activity:', error);
      // Still close modal even if API fails
      setShowModal(false);
      setPendingActivity(null);
    }
  }

  async function handleSkip() {
    try {
      await fetch(
        `${API_BASE_URL}/api/activity-completion/skip`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: pendingActivity.id,
          }),
        }
      );

      setShowModal(false);
      setPendingActivity(null);
    } catch (error) {
      console.error('Error skipping activity:', error);
      setShowModal(false);
      setPendingActivity(null);
    }
  }

  async function handleOngoing() {
    try {
      await fetch(
        `${API_BASE_URL}/api/activity-completion/ongoing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: pendingActivity.id,
          }),
        }
      );

      setShowModal(false);
      setPendingActivity(null);
    } catch (error) {
      console.error('Error marking ongoing:', error);
      setShowModal(false);
      setPendingActivity(null);
    }
  }

  // Don't render children until we've checked for pending activities
  // This prevents a flash of the home screen before the modal appears
  if (isChecking) {
    return null;
  }

  return (
    <>
      {children}
      {showModal && pendingActivity && (
        <ActivityCompletionModal
          activity={{
            id: pendingActivity.activity_id,
            instanceId: pendingActivity.id,
            name: pendingActivity.activity_name,
            venueName: pendingActivity.venue_name,
            category: pendingActivity.activity_category,
          }}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onOngoing={handleOngoing}
        />
      )}
    </>
  );
}
