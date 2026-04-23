import { TransactionStatus, TransactionType } from '@/lib/types';

export type TransactionDirection = "outgoing" | "incoming";

export enum UiTransactionStatus {
  DEPOSIT_RECEIVED   = 'DEPOSIT_RECEIVED',
  DEPOSIT_COMPLETED  = 'DEPOSIT_COMPLETED',
  TRANSFER_PENDING   = 'TRANSFER_PENDING',
  TRANSFER_COMPLETED = 'TRANSFER_COMPLETED',
  FAILED             = 'FAILED',
}

export interface TransactionStatusConfig {
  label: string;
  description: string;
  icon: string;
  iconFilled: boolean;
  iconClass: string;
  dotClass: string;
  badgeClass: string;
  dotOverlayClass: string;
  isPulse: boolean;
}

/** Single transformation point: raw API tx → UI status. */
export function mapToUiStatus(
  type: TransactionType,
  apiStatus: string,
  isUserOrigin?: boolean,
): UiTransactionStatus {
  if (apiStatus === TransactionStatus.FAILED) return UiTransactionStatus.FAILED;

  if (type === TransactionType.DEPOSIT) {
    return apiStatus === TransactionStatus.COMPLETED
      ? UiTransactionStatus.DEPOSIT_COMPLETED
      : UiTransactionStatus.DEPOSIT_RECEIVED;
  }

  return apiStatus === TransactionStatus.COMPLETED
    ? UiTransactionStatus.TRANSFER_COMPLETED
    : UiTransactionStatus.TRANSFER_PENDING;
}

export function getTransactionStatusConfig(
  uiStatus: UiTransactionStatus,
  isUserOrigin?: boolean,
): TransactionStatusConfig {
  switch (uiStatus) {

    case UiTransactionStatus.DEPOSIT_RECEIVED:
      return {
        label: 'Depósito recibido',
        description: 'Hemos recibido tu transferencia bancaria. Estamos verificando el ingreso y acreditaremos el saldo en tu cuenta en breve. Los fondos aún no están disponibles.',
        icon: 'download',
        iconFilled: false,
        iconClass: 'text-blue-500',
        dotClass: 'bg-blue-400',
        badgeClass: 'bg-blue-50 text-blue-600',
        dotOverlayClass: 'bg-blue-400',
        isPulse: true,
      };

    case UiTransactionStatus.DEPOSIT_COMPLETED:
      return {
        label: 'Depósito completado',
        description: 'Tu depósito ha sido acreditado correctamente. El saldo ya está disponible en tu cuenta.',
        icon: 'check_circle',
        iconFilled: true,
        iconClass: 'text-[var(--color-success-text)]',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
        dotOverlayClass: 'bg-emerald-400',
        isPulse: false,
      };

    case UiTransactionStatus.TRANSFER_PENDING:
      return isUserOrigin
        ? {
            label: 'Envío realizado',
            description: 'Tu pago ha sido registrado y está siendo procesado. Los fondos llegarán a tu contacto en breve.',
            icon: 'send',
            iconFilled: false,
            iconClass: 'text-blue-500',
            dotClass: 'bg-blue-400',
            badgeClass: 'bg-blue-50 text-blue-600',
            dotOverlayClass: 'bg-blue-400',
            isPulse: true,
          }
        : {
            label: 'Pago recibido',
            description: 'Tu contacto ha iniciado la transferencia. Estamos procesando el pago — los fondos aún no están disponibles en tu cuenta.',
            icon: 'download',
            iconFilled: false,
            iconClass: 'text-blue-500',
            dotClass: 'bg-blue-400',
            badgeClass: 'bg-blue-50 text-blue-600',
            dotOverlayClass: 'bg-blue-400',
            isPulse: true,
          };

    case UiTransactionStatus.TRANSFER_COMPLETED:
      return {
        label: 'Completado',
        description: isUserOrigin
          ? 'Tu pago ha llegado. Los fondos ya están disponibles en la cuenta de tu contacto.'
          : 'Has recibido el pago. Los fondos ya están disponibles en tu cuenta.',
        icon: 'check_circle',
        iconFilled: true,
        iconClass: 'text-[var(--color-success-text)]',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
        dotOverlayClass: 'bg-emerald-400',
        isPulse: false,
      };

    case UiTransactionStatus.FAILED:
      return {
        label: isUserOrigin === undefined
          ? 'No procesado'
          : isUserOrigin
            ? 'No enviado'
            : 'No completado',
        description: isUserOrigin === undefined
          ? 'No hemos podido procesar el ingreso. Si realizaste la transferencia bancaria, el importe volverá a tu cuenta de origen en 1–3 días hábiles.'
          : isUserOrigin
            ? 'No se pudo completar la transferencia. No se ha realizado ningún cargo en tu cuenta. Si los fondos estaban reservados, serán devueltos en 1–3 días hábiles.'
            : 'La transferencia no pudo completarse. Tu contacto no ha sido cargado y recibirá una notificación.',
        icon: 'cancel',
        iconFilled: false,
        iconClass: 'text-[var(--color-error)]',
        dotClass: 'bg-[var(--color-error)]',
        badgeClass: 'bg-[var(--color-error-container)] text-[var(--color-error)]',
        dotOverlayClass: 'bg-[var(--color-error)]',
        isPulse: false,
      };
  }
}
