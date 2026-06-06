export {
  normalizeActivityStatus,
  isTerminalStatus,
  isEndedSuccess,
  isEndedCancelled,
  isEndedColumnStatus,
  getStatusLabel,
  getCancelReasonLabel,
  getAllowedTransitions,
  getTransitionLabel,
  type StatusTransition,
} from '../../shared/activityStatus'
