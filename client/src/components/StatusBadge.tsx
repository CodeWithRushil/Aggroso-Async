import React from 'react';
import { Severity, ListingStatus } from '../types/index.js';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert, CheckCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status?: ListingStatus;
  severity?: Severity;
  score?: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, severity, score, className = '' }) => {
  if (severity) {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className={`badge badge-critical ${className}`}>
            <ShieldAlert size={12} /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className={`badge badge-high ${className}`}>
            <AlertCircle size={12} /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`badge badge-medium ${className}`}>
            <AlertTriangle size={12} /> MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className={`badge badge-low ${className}`}>
            <Info size={12} /> LOW
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'FLAGGED':
        return (
          <span className={`badge badge-flagged ${className}`}>
            <ShieldAlert size={12} /> FLAGGED
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className={`badge badge-revision ${className}`}>
            <AlertTriangle size={12} /> NEEDS REVISION
          </span>
        );
      case 'COMPLIANT':
        return (
          <span className={`badge badge-compliant ${className}`}>
            <CheckCircle size={12} /> COMPLIANT
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`badge badge-approved ${className}`}>
            <CheckCheck size={12} /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`badge badge-critical ${className}`}>
            <XCircle size={12} /> REJECTED
          </span>
        );
      default:
        return (
          <span className={`badge badge-low ${className}`}>
            {status}
          </span>
        );
    }
  }

  if (score !== undefined) {
    let scoreClass = 'score-high';
    if (score < 60) scoreClass = 'score-low';
    else if (score < 80) scoreClass = 'score-medium';

    return (
      <span className={`score-badge ${scoreClass} ${className}`}>
        {score}/100
      </span>
    );
  }

  return null;
};
