import type { ApplicationStage } from '../../../types/internships';

export const stageOrder: ApplicationStage[] = ['Applied', 'OnlineAssessment', 'Interview', 'Offer', 'Rejected'];

export const stageLabels: Record<ApplicationStage, string> = {
  Applied: 'Applied',
  OnlineAssessment: 'OA',
  Interview: 'Interview',
  Offer: 'Offer',
  Rejected: 'Rejected',
};

export const stageClassName: Record<ApplicationStage, string> = {
  Applied: 'chip stage-applied',
  OnlineAssessment: 'chip stage-oa',
  Interview: 'chip stage-interview',
  Offer: 'chip stage-offer',
  Rejected: 'chip stage-rejected',
};
