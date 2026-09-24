export interface TrustSignalInputs {
  verificationStatus: 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'STUDENT_VERIFIED';
  createdAt: Date;
  completedDealsCount: number;
  totalDealsInitiated: number;
  averageRating: number;
  reviewCount: number;
  confirmedReportsCount: number;
}

export interface TrustScoreBreakdown {
  totalScore: number;
  tier: 'CAMPUS_CHAMPION' | 'TRUSTED_TRADER' | 'VERIFIED_PEER' | 'NEW_STUDENT';
  tierLabel: string;
  signals: {
    verification: { points: number; max: 50; description: string };
    completedDeals: { points: number; max: 20; description: string };
    peerRatings: { points: number; max: 20; description: string };
    campusLongevity: { points: number; max: 10; description: string };
    cancellationPenalty: { points: number; description: string };
    conductPenalty: { points: number; description: string };
  };
}

/**
 * Calculates an explainable, deterministic Collex Trust Score (0 - 100)
 */
export function calculateTrustScore(inputs: TrustSignalInputs): TrustScoreBreakdown {
  // 1. Verification Signal (Max 50 points)
  let verificationPoints = 10;
  let verificationDesc = 'Unverified campus status';
  if (inputs.verificationStatus === 'STUDENT_VERIFIED') {
    verificationPoints = 50;
    verificationDesc = 'Verified Student ID & Campus Credentials';
  } else if (inputs.verificationStatus === 'EMAIL_VERIFIED') {
    verificationPoints = 35;
    verificationDesc = 'Verified Active College Email';
  }

  // 2. Completed Transactions Signal (Max 20 points, 4pts per completed handoff)
  const dealsPoints = Math.min(20, inputs.completedDealsCount * 4);
  const dealsDesc = `${inputs.completedDealsCount} peer handoffs completed cleanly`;

  // 3. Peer Rating Signal (Max 20 points)
  let ratingPoints = 12; // Neutral baseline for new students with no reviews yet
  let ratingDesc = 'No peer reviews recorded yet (neutral baseline)';
  if (inputs.reviewCount > 0) {
    ratingPoints = Math.round((Math.max(1, Math.min(5, inputs.averageRating)) / 5) * 20);
    ratingDesc = `${inputs.averageRating.toFixed(1)}/5.0 stars from ${inputs.reviewCount} peer review(s)`;
  }

  // 4. Longevity Signal (Max 10 points based on account age)
  const daysActive = Math.floor(
    (Date.now() - new Date(inputs.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  let longevityPoints = 3;
  let longevityDesc = `Member for ${daysActive} day(s)`;
  if (daysActive >= 90) {
    longevityPoints = 10;
    longevityDesc = `Campus veteran (>90 days member)`;
  } else if (daysActive >= 30) {
    longevityPoints = 7;
    longevityDesc = `Established campus member (>30 days)`;
  }

  // 5. Cancellation Penalty
  let cancellationPenalty = 0;
  let cancellationDesc = 'Clean transaction fulfillment rate';
  if (inputs.totalDealsInitiated >= 3) {
    const cancelledCount = inputs.totalDealsInitiated - inputs.completedDealsCount;
    const cancelRatio = cancelledCount / inputs.totalDealsInitiated;
    if (cancelRatio > 0.35) {
      cancellationPenalty = -15;
      cancellationDesc = `High cancellation rate (${Math.round(cancelRatio * 100)}%)`;
    } else if (cancelRatio > 0.2) {
      cancellationPenalty = -8;
      cancellationDesc = `Moderate cancellation rate (${Math.round(cancelRatio * 100)}%)`;
    }
  }

  // 6. Conduct Violation Penalty (-25 points per confirmed report)
  const conductPenalty = -(inputs.confirmedReportsCount * 25);
  const conductDesc = inputs.confirmedReportsCount > 0
    ? `${inputs.confirmedReportsCount} confirmed community policy violation(s)`
    : 'Zero moderation flags';

  // Compute Total Clamped to 0 - 100
  const rawScore =
    verificationPoints +
    dealsPoints +
    ratingPoints +
    longevityPoints +
    cancellationPenalty +
    conductPenalty;

  const totalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Tier Classification
  let tier: TrustScoreBreakdown['tier'] = 'NEW_STUDENT';
  let tierLabel = 'New Student';
  if (totalScore >= 90) {
    tier = 'CAMPUS_CHAMPION';
    tierLabel = 'Campus Champion';
  } else if (totalScore >= 75) {
    tier = 'TRUSTED_TRADER';
    tierLabel = 'Trusted Trader';
  } else if (totalScore >= 50) {
    tier = 'VERIFIED_PEER';
    tierLabel = 'Verified Peer';
  }

  return {
    totalScore,
    tier,
    tierLabel,
    signals: {
      verification: { points: verificationPoints, max: 50, description: verificationDesc },
      completedDeals: { points: dealsPoints, max: 20, description: dealsDesc },
      peerRatings: { points: ratingPoints, max: 20, description: ratingDesc },
      campusLongevity: { points: longevityPoints, max: 10, description: longevityDesc },
      cancellationPenalty: { points: cancellationPenalty, description: cancellationDesc },
      conductPenalty: { points: conductPenalty, description: conductDesc },
    },
  };
}
