import { createHash } from 'node:crypto';

/**
 * HITL SIMULATION EXAM ENGINE (DAVINCIA-HITL-SIMULATION-v1.0)
 * Evaluates human oversight candidates by injecting synthetic AI hallucinations, unauthorized actions, and subtle evidence errors.
 */
export class HitlSimulationExamEngine {
  runSimulationExam(hitlCandidateId, domainId, simulatedCases) {
    // simulatedCases: array of { caseId, containsInjectedError: bool, candidateDecision: 'APPROVE'|'REJECT'|'STOP' }
    let detectedErrors = 0;
    let totalInjectedErrors = 0;
    let falseAcceptances = 0;
    let falseRejections = 0;

    simulatedCases.forEach(c => {
      if (c.containsInjectedError) {
        totalInjectedErrors++;
        if (c.candidateDecision === 'REJECT' || c.candidateDecision === 'STOP') {
          detectedErrors++;
        } else {
          falseAcceptances++; // Failed to catch error
        }
      } else {
        if (c.candidateDecision === 'REJECT' || c.candidateDecision === 'STOP') {
          falseRejections++; // Rejected valid AI output
        }
      }
    });

    const detectionRatePercent = totalInjectedErrors > 0 ? (detectedErrors / totalInjectedErrors) * 100 : 100;
    const challengeRatePercent = (detectedErrors / simulatedCases.length) * 100;

    const examPassed = detectionRatePercent >= 90.0 && falseAcceptances === 0;

    const timestamp = new Date().toISOString();
    const examResultId = `exam_${createHash('md5').update(`${hitlCandidateId}:${timestamp}`).digest('hex').substring(0, 10)}`;

    return {
      exam_id: examResultId,
      candidate_id: hitlCandidateId,
      domain_id: domainId,
      metrics: {
        totalCasesTested: simulatedCases.length,
        injectedErrors: totalInjectedErrors,
        detectedErrors,
        falseAcceptances,
        falseRejections,
        detectionRatePercent,
        challengeRatePercent
      },
      result: examPassed ? 'PASSED_EMBASSY_HITL_SIMULATION' : 'FAILED_AUTOMATION_BIAS_TEST',
      exam_timestamp: timestamp
    };
  }
}
