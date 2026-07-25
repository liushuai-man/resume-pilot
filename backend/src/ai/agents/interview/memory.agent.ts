import {
  CandidateProfile,
  Evaluation,
  MemoryResult,
} from '../../types/interview.types';

export class MemoryAgent {
  updateProfile(
    profile: CandidateProfile,
    evaluation: Evaluation
  ): CandidateProfile {
    const newProfile: CandidateProfile = {
      skills: { ...profile.skills },
      overallLevel: profile.overallLevel,
    };

    if (evaluation.profileUpdate) {
      const { skill, level, confidence } = evaluation.profileUpdate;
      const existing = newProfile.skills[skill];

      if (existing) {
        const totalConfidence = existing.confidence + confidence;
        newProfile.skills[skill] = {
          level: Math.round(
            (existing.level * existing.confidence + level * confidence) /
              totalConfidence
          ),
          confidence: Math.min(totalConfidence, 1),
        };
      } else {
        newProfile.skills[skill] = { level, confidence };
      }
    }

    const skillValues = Object.values(newProfile.skills);
    if (skillValues.length > 0) {
      newProfile.overallLevel = Math.round(
        skillValues.reduce((sum, s) => sum + s.level, 0) / skillValues.length
      );
    }

    return newProfile;
  }

  async retrieveSemanticMemory(
    _query: string,
    _userId?: string
  ): Promise<MemoryResult> {
    return {
      semanticMemory: [],
      profileUpdated: false,
    };
  }
}
