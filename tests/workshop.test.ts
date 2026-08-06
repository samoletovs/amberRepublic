import { describe, it, expect } from 'vitest';
import {
  WORKSHOP_SCENARIOS,
  getScenario,
  scoreWorkshopChoice,
  gradeFromScore,
  feedbackForGrade,
  buildWorkshopResult,
  type WorkshopResult,
} from '../src/engine/workshop';

describe('workshop — WORKSHOP_SCENARIOS', () => {
  it('defines at least 3 scenarios', () => {
    expect(WORKSHOP_SCENARIOS.length).toBeGreaterThanOrEqual(3);
  });

  it('every scenario has a unique id', () => {
    const ids = WORKSHOP_SCENARIOS.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every scenario has at least 2 stakeholders', () => {
    for (const s of WORKSHOP_SCENARIOS) {
      expect(s.stakeholders.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every scenario has at least 2 options', () => {
    for (const s of WORKSHOP_SCENARIOS) {
      expect(s.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every stakeholder advocatesOption index is valid', () => {
    for (const s of WORKSHOP_SCENARIOS) {
      for (const st of s.stakeholders) {
        expect(st.advocatesOption).toBeGreaterThanOrEqual(0);
        expect(st.advocatesOption).toBeLessThan(s.options.length);
      }
    }
  });

  it('every option has a valid baseScore 0–100', () => {
    for (const s of WORKSHOP_SCENARIOS) {
      for (const o of s.options) {
        expect(o.baseScore).toBeGreaterThanOrEqual(0);
        expect(o.baseScore).toBeLessThanOrEqual(100);
      }
    }
  });

  it('every option id is unique within its scenario', () => {
    for (const s of WORKSHOP_SCENARIOS) {
      const ids = s.options.map(o => o.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });
});

describe('workshop — getScenario', () => {
  it('returns the scenario matching the given id', () => {
    const s = getScenario('healthcare-crisis');
    expect(s.id).toBe('healthcare-crisis');
  });

  it('falls back to the first scenario for unknown id', () => {
    const s = getScenario('nonexistent-scenario');
    expect(s).toBe(WORKSHOP_SCENARIOS[0]);
  });
});

describe('workshop — scoreWorkshopChoice', () => {
  const healthcareScenario = getScenario('healthcare-crisis');

  it('returns the option baseScore when context bonus does not apply', () => {
    // healthcareQuality = 60 (>= 40 threshold, so no bonus for tax-increase option)
    const indicators = { healthcareQuality: 60 };
    const score = scoreWorkshopChoice(healthcareScenario, 'tax-increase', indicators);
    expect(score).toBe(72); // baseScore only
  });

  it('applies context bonus when condition is met', () => {
    // tax-increase option: contextBonus triggers when healthcareQuality < 40
    const indicators = { healthcareQuality: 30 };
    const score = scoreWorkshopChoice(healthcareScenario, 'tax-increase', indicators);
    expect(score).toBe(72 + 15); // baseScore + bonus
  });

  it('caps score at 100', () => {
    const scenario = WORKSHOP_SCENARIOS[0];
    const highBonusOption = scenario.options.find(o => (o.baseScore + (o.contextBonus?.bonus ?? 0)) > 100);
    if (!highBonusOption || !highBonusOption.contextBonus) return; // skip if no such option
    const indicators = { [highBonusOption.contextBonus.indicator]: highBonusOption.contextBonus.op === '<' ? 0 : 200 };
    const score = scoreWorkshopChoice(scenario, highBonusOption.id, indicators);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns 0 for unknown option id', () => {
    const indicators = {};
    const score = scoreWorkshopChoice(healthcareScenario, 'unknown-option', indicators);
    expect(score).toBe(0);
  });

  it('uses 0 for missing indicator when computing context bonus', () => {
    // tax-increase has contextBonus { indicator: 'healthcareQuality', op: '<', threshold: 40, bonus: 15 }
    // if healthcareQuality is missing, defaults to 0 which is < 40 → bonus applies
    const score = scoreWorkshopChoice(healthcareScenario, 'tax-increase', {});
    expect(score).toBe(72 + 15);
  });
});

describe('workshop — gradeFromScore', () => {
  it('returns Expert Policy Architect for score >= 80', () => {
    expect(gradeFromScore(80)).toBe('Expert Policy Architect');
    expect(gradeFromScore(95)).toBe('Expert Policy Architect');
    expect(gradeFromScore(100)).toBe('Expert Policy Architect');
  });

  it('returns Senior Adviser for score 65–79', () => {
    expect(gradeFromScore(65)).toBe('Senior Adviser');
    expect(gradeFromScore(72)).toBe('Senior Adviser');
    expect(gradeFromScore(79)).toBe('Senior Adviser');
  });

  it('returns Junior Analyst for score 50–64', () => {
    expect(gradeFromScore(50)).toBe('Junior Analyst');
    expect(gradeFromScore(57)).toBe('Junior Analyst');
    expect(gradeFromScore(64)).toBe('Junior Analyst');
  });

  it('returns Intern for score < 50', () => {
    expect(gradeFromScore(0)).toBe('Intern');
    expect(gradeFromScore(30)).toBe('Intern');
    expect(gradeFromScore(49)).toBe('Intern');
  });
});

describe('workshop — feedbackForGrade', () => {
  const grades: WorkshopResult['grade'][] = [
    'Expert Policy Architect',
    'Senior Adviser',
    'Junior Analyst',
    'Intern',
  ];

  it('returns a non-empty string for every grade', () => {
    for (const g of grades) {
      const feedback = feedbackForGrade(g);
      expect(typeof feedback).toBe('string');
      expect(feedback.length).toBeGreaterThan(0);
    }
  });

  it('returns distinct feedback for each grade', () => {
    const feedbacks = grades.map(feedbackForGrade);
    const unique = new Set(feedbacks);
    expect(unique.size).toBe(grades.length);
  });
});

describe('workshop — buildWorkshopResult', () => {
  it('builds a complete result object', () => {
    const scenario = getScenario('healthcare-crisis');
    const result = buildWorkshopResult(scenario, 'tax-increase', { healthcareQuality: 60 });
    expect(result.scenarioId).toBe('healthcare-crisis');
    expect(result.optionId).toBe('tax-increase');
    expect(result.score).toBeGreaterThan(0);
    expect(result.grade).toBeDefined();
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('score is consistent with scoreWorkshopChoice', () => {
    const scenario = getScenario('defence-posture');
    const indicators = { russiaRelations: 10 };
    const result = buildWorkshopResult(scenario, 'full-three-percent', indicators);
    const directScore = scoreWorkshopChoice(scenario, 'full-three-percent', indicators);
    expect(result.score).toBe(directScore);
  });

  it('grade matches score', () => {
    const scenario = getScenario('pension-reform');
    const result = buildWorkshopResult(scenario, 'hybrid-reform', { publicDebt: 40 });
    const expectedGrade = gradeFromScore(result.score);
    expect(result.grade).toBe(expectedGrade);
  });

  it('all scenarios can produce a result for their first option', () => {
    for (const scenario of WORKSHOP_SCENARIOS) {
      const firstOption = scenario.options[0];
      const result = buildWorkshopResult(scenario, firstOption.id, {});
      expect(result.scenarioId).toBe(scenario.id);
      expect(result.optionId).toBe(firstOption.id);
      expect(result.score).toBeGreaterThanOrEqual(0);
    }
  });
});
