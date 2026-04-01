import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { logger } from '@/utils/logger'

export type NotificationType =
  | 'import_success'
  | 'import_error'
  | 'audit_complete'
  | 'quota_warning'
  | 'quota_exceeded'
  | 'liasse_generated'
  | 'deadline_reminder'

export interface NotificationPayload {
  type: NotificationType
  recipientEmail: string
  recipientName: string
  data: Record<string, unknown>
}

interface NotificationTemplate {
  subject: string
  body: string
}

const TEMPLATES: Record<NotificationType, (data: Record<string, unknown>) => NotificationTemplate> = {
  import_success: (data) => ({
    subject: `Import balance réussi — ${data.dossierName || 'Dossier'}`,
    body: `Votre balance a été importée avec succès.\n\n` +
      `Nombre de comptes : ${data.compteCount || 0}\n` +
      `Total débit : ${data.totalDebit || 0} ${data.currency || 'XOF'}\n` +
      `Total crédit : ${data.totalCredit || 0} ${data.currency || 'XOF'}\n` +
      `Erreurs détectées : ${data.errorCount || 0}`,
  }),
  import_error: (data) => ({
    subject: `Erreur d'import — ${data.dossierName || 'Dossier'}`,
    body: `L'import de votre balance a échoué.\n\nErreur : ${data.errorMessage || 'Erreur inconnue'}`,
  }),
  audit_complete: (data) => ({
    subject: `Audit terminé — ${data.dossierName || 'Dossier'}`,
    body: `L'audit de votre balance est terminé.\n\n` +
      `Contrôles réussis : ${data.passed || 0}/${data.total || 0}\n` +
      `Erreurs bloquantes : ${data.blocking || 0}\n` +
      `Avertissements : ${data.warnings || 0}`,
  }),
  quota_warning: (data) => ({
    subject: `Quota presque atteint — ${data.percentUsed || 0}%`,
    body: `Vous avez utilisé ${data.used || 0} liasses sur ${data.limit || 0} disponibles (${data.percentUsed || 0}%).\n\n` +
      `Mettez à niveau votre plan pour continuer à générer des liasses.`,
  }),
  quota_exceeded: (data) => ({
    subject: 'Quota de liasses atteint',
    body: `Vous avez atteint votre limite de ${data.limit || 0} liasses.\n\n` +
      `Mettez à niveau votre abonnement pour continuer.`,
  }),
  liasse_generated: (data) => ({
    subject: `Liasse fiscale générée — ${data.dossierName || 'Dossier'}`,
    body: `Votre liasse fiscale a été générée avec succès.\n\n` +
      `Type : ${data.typeLiasse || 'SN'}\n` +
      `Exercice : ${data.exercice || ''}\n` +
      `Pages : ${data.pageCount || 0}`,
  }),
  deadline_reminder: (data) => ({
    subject: `Rappel deadline — ${data.deadlineName || 'Déclaration'}`,
    body: `La date limite pour ${data.deadlineName || 'votre déclaration'} approche.\n\n` +
      `Date limite : ${data.deadline || ''}\n` +
      `Jours restants : ${data.daysRemaining || 0}`,
  }),
}

/**
 * Send a notification. In production, this calls a Supabase Edge Function.
 * In development, it logs the notification.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const template = TEMPLATES[payload.type](payload.data)

  logger.info(`[Notification] ${payload.type} → ${payload.recipientEmail}`, template.subject)

  if (!isSupabaseEnabled || !supabase) {
    logger.debug('[Notification] Supabase not available, notification logged only')
    return
  }

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: payload.recipientEmail,
        toName: payload.recipientName,
        subject: template.subject,
        text: template.body,
        type: payload.type,
      },
    })
    if (error) {
      logger.error('[Notification] Failed to send:', error)
    }
  } catch (err) {
    logger.error('[Notification] Edge function error:', err)
  }
}

/**
 * Store notification in-app for the notification center
 */
export async function storeInAppNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return

  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
      read: false,
    })
  } catch (err) {
    logger.error('[Notification] Failed to store in-app notification:', err)
  }
}
