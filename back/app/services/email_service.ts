import env from '#start/env'
import { Resend } from 'resend'

const resend = new Resend(env.get('RESEND_API_KEY'))

const FROM = env.get('RESEND_FROM', 'EUKS Store <onboarding@resend.dev>')
const APP_URL = env.get('APP_URL', 'http://localhost:3333')

function formatPrice(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export async function sendPurchaseConfirmation(opts: {
  to: string
  trackTitle: string
  licenseTitle: string
  amountCents: number
  currency: string
  orderId: string
}) {
  const price = formatPrice(opts.amountCents, opts.currency)
  const downloadsUrl = `${APP_URL}/dashboard?purchased=1`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation d'achat — EUKS</title>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:'Helvetica Neue',Arial,sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#0f172a;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#67e8f9;">EUKS Store</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#ffffff;">Merci pour ton achat&nbsp;🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#cbd5e1;">
                Ton paiement a bien été validé. Tes fichiers sont disponibles dès maintenant dans ton espace.
              </p>

              <!-- Order recap -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Musique</p>
                    <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#ffffff;">${opts.trackTitle}</p>

                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Licence</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#e2e8f0;">${opts.licenseTitle}</p>

                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">Montant</p>
                    <p style="margin:0;font-size:20px;font-weight:900;color:#67e8f9;">${price}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${downloadsUrl}"
                       style="display:inline-block;padding:14px 32px;background:rgba(103,232,249,0.15);border:1px solid rgba(103,232,249,0.3);border-radius:9999px;font-size:14px;font-weight:700;color:#67e8f9;text-decoration:none;letter-spacing:0.02em;">
                      Accéder à mes téléchargements →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:#475569;text-align:center;line-height:1.6;">
                Les liens de téléchargement sont valables <strong style="color:#64748b;">12 mois</strong>.<br/>
                Commande&nbsp;: <code style="color:#64748b;">${opts.orderId}</code>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:#334155;">
                EUKS Store — Licences de beats, achats instantanés et support artiste.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `✅ Achat confirmé — ${opts.trackTitle}`,
    html,
  })
}

export async function sendPasswordReset(opts: { to: string; token: string }) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(opts.token)}`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation du mot de passe — EUKS</title>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:'Helvetica Neue',Arial,sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#0f172a;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#67e8f9;">EUKS Store</p>
              <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#ffffff;">Réinitialise ton mot de passe</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#cbd5e1;">
                Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable <strong style="color:#e2e8f0;">1 heure</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;background:rgba(103,232,249,0.15);border:1px solid rgba(103,232,249,0.3);border-radius:9999px;font-size:14px;font-weight:700;color:#67e8f9;text-decoration:none;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#475569;text-align:center;line-height:1.6;">
                Si tu n'es pas à l'origine de cette demande, ignore simplement cet email — ton mot de passe reste inchangé.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:#334155;">EUKS Store</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: '🔐 Réinitialisation de ton mot de passe EUKS',
    html,
  })
}
