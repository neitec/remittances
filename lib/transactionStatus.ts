import { TransactionStatus, TransactionType } from '@/lib/types';

export interface TransactionStatusConfig {
  label: string;
  description: string;
  icon: string;
  iconFilled: boolean;
  iconClass: string;
  dotClass: string;
  badgeClass: string;
  dotOverlayClass: string;
  step: number;
  totalSteps: number;
  isPulse: boolean;
}

export function normalizeStatus(raw: string): TransactionStatus {
  if (raw === 'PENDING') return TransactionStatus.IN_PROGRESS;
  return raw as TransactionStatus;
}

export function getTransactionStatusConfig(
  status: TransactionStatus,
  type: TransactionType
): TransactionStatusConfig {
  const isDeposit = type === TransactionType.DEPOSIT;

  switch (status) {
    case TransactionStatus.FUNDS_RECEIVED:
      return {
        label: 'Fondos recibidos',
        description: 'Hemos recibido tu depósito y estamos procesando la entrada de fondos.',
        icon: 'download',
        iconFilled: false,
        iconClass: 'text-blue-500',
        dotClass: 'bg-blue-400',
        badgeClass: 'bg-blue-50 text-blue-600',
        dotOverlayClass: 'bg-blue-400',
        step: 1,
        totalSteps: 4,
        isPulse: true,
      };

    case TransactionStatus.PAYMENT_SUBMITTED:
      return {
        label: 'Pago enviado',
        description: 'Tu orden de pago ha sido enviada a la red. Esperando confirmación.',
        icon: 'send',
        iconFilled: false,
        iconClass: 'text-blue-500',
        dotClass: 'bg-blue-400',
        badgeClass: 'bg-blue-50 text-blue-600',
        dotOverlayClass: 'bg-blue-400',
        step: 1,
        totalSteps: 4,
        isPulse: true,
      };

    case TransactionStatus.IN_REVIEW:
      return {
        label: 'En revisión',
        description: 'Nuestra operación está siendo verificada por el equipo de cumplimiento. Esto es habitual y no afecta al resultado.',
        icon: 'shield_person',
        iconFilled: false,
        iconClass: 'text-amber-500',
        dotClass: 'bg-amber-400',
        badgeClass: 'bg-amber-50 text-amber-600',
        dotOverlayClass: 'bg-amber-400',
        step: 2,
        totalSteps: 4,
        isPulse: false,
      };

    case TransactionStatus.IN_PROGRESS:
      return {
        label: 'En progreso',
        description: isDeposit
          ? 'Tus fondos están en camino y serán acreditados en breve.'
          : 'La transferencia está siendo procesada por la red. Suele completarse en minutos.',
        icon: 'sync',
        iconFilled: false,
        iconClass: 'text-[var(--color-primary)]',
        dotClass: 'bg-[var(--color-primary)]',
        badgeClass: 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)]',
        dotOverlayClass: 'bg-[var(--color-primary)]',
        step: 3,
        totalSteps: 4,
        isPulse: true,
      };

    case TransactionStatus.COMPLETED:
      return {
        label: 'Completado',
        description: isDeposit
          ? 'Tu depósito ha sido acreditado correctamente en tu wallet.'
          : 'La transferencia se ha completado y el destinatario ha recibido los fondos.',
        icon: 'check_circle',
        iconFilled: true,
        iconClass: 'text-[var(--color-success-text)]',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
        dotOverlayClass: 'bg-emerald-400',
        step: 4,
        totalSteps: 4,
        isPulse: false,
      };

    case TransactionStatus.FAILED:
      return {
        label: 'Fallido',
        description: 'La operación no pudo completarse. Si el importe fue debitado, será reembolsado en 1–3 días hábiles.',
        icon: 'cancel',
        iconFilled: false,
        iconClass: 'text-[var(--color-error)]',
        dotClass: 'bg-[var(--color-error)]',
        badgeClass: 'bg-[var(--color-error-container)] text-[var(--color-error)]',
        dotOverlayClass: 'bg-[var(--color-error)]',
        step: 4,
        totalSteps: 4,
        isPulse: false,
      };

    default:
      return {
        label: 'Pendiente',
        description: 'Esta operación está siendo procesada.',
        icon: 'schedule',
        iconFilled: false,
        iconClass: 'text-amber-500',
        dotClass: 'bg-amber-400',
        badgeClass: 'bg-amber-50 text-amber-600',
        dotOverlayClass: 'bg-amber-400',
        step: 1,
        totalSteps: 4,
        isPulse: true,
      };
  }
}
