import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Send, Email, Phone, LocationOn, CheckCircle } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

const inputSx = {
  width: '100%',
  fontFamily: BODY,
  fontSize: '0.9rem',
  color: TEXT_PRIMARY,
  bgcolor: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER}`,
  borderRadius: '8px',
  px: 2,
  py: 1.5,
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': { borderColor: 'rgba(201,168,76,0.4)' },
  '&::placeholder': { color: TEXT_SECONDARY, opacity: 0.7 },
}

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout>
      {/* Header */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>
          <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.4rem', md: '3.4rem' }, color: TEXT_PRIMARY, m: 0, mb: 1 }}>
            Contactez-nous
          </Box>
          <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: TEXT_SECONDARY, m: 0, lineHeight: 1.7 }}>
            Une question, une demande de démo ou un besoin spécifique ? Notre équipe vous répond sous 24h.
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, pb: { xs: 8, md: 12 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Contact info */}
          <Box sx={{ flex: '0 0 320px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                { icon: <Email sx={{ fontSize: 22, color: GOLD }} />, label: 'Email', value: 'contact@atlas-studio.com' },
                { icon: <Phone sx={{ fontSize: 22, color: GOLD }} />, label: 'Téléphone', value: '+225 27 22 00 00 00' },
                { icon: <LocationOn sx={{ fontSize: 22, color: GOLD }} />, label: 'Adresse', value: 'Abidjan, Côte d\'Ivoire\nZone OHADA' },
              ].map((info) => (
                <Box
                  key={info.label}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2.5,
                    borderRadius: '12px',
                    border: `1px solid ${BORDER}`,
                    bgcolor: DARK_SURFACE,
                  }}
                >
                  <Box sx={{ mt: 0.3 }}>{info.icon}</Box>
                  <Box>
                    <Box sx={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.85rem', color: TEXT_PRIMARY, mb: 0.3 }}>
                      {info.label}
                    </Box>
                    <Box sx={{ fontFamily: BODY, fontSize: '0.85rem', color: TEXT_SECONDARY, whiteSpace: 'pre-line' }}>
                      {info.value}
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Horaires */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  bgcolor: DARK_SURFACE,
                }}
              >
                <Box sx={{ fontFamily: BODY, fontWeight: 600, fontSize: '0.85rem', color: TEXT_PRIMARY, mb: 1 }}>
                  Horaires d'ouverture
                </Box>
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.8 }}>
                  Lundi — Vendredi : 8h — 18h (GMT)<br />
                  Samedi : 9h — 13h (GMT)<br />
                  Dimanche : Fermé
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Form */}
          <Box sx={{ flex: 1 }}>
            {sent ? (
              <Box
                sx={{
                  p: 5,
                  borderRadius: '14px',
                  border: `1px solid ${BORDER}`,
                  bgcolor: DARK_SURFACE,
                  textAlign: 'center',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 56, color: GOLD, mb: 2 }} />
                <Box component="h3" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.5rem', color: TEXT_PRIMARY, m: 0, mb: 1 }}>
                  Message envoyé !
                </Box>
                <Box sx={{ fontFamily: BODY, color: TEXT_SECONDARY, fontSize: '0.95rem' }}>
                  Notre équipe vous répondra sous 24 heures ouvrées.
                </Box>
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '14px',
                  border: `1px solid ${BORDER}`,
                  bgcolor: DARK_SURFACE,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                }}
              >
                {/* Row: Nom + Email */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box component="label" sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, fontWeight: 500 }}>
                      Nom complet *
                    </Box>
                    <Box component="input" required placeholder="Votre nom" sx={inputSx} />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box component="label" sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, fontWeight: 500 }}>
                      Email *
                    </Box>
                    <Box component="input" type="email" required placeholder="votre@email.com" sx={inputSx} />
                  </Box>
                </Box>

                {/* Entreprise */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box component="label" sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, fontWeight: 500 }}>
                    Entreprise
                  </Box>
                  <Box component="input" placeholder="Nom de votre entreprise" sx={inputSx} />
                </Box>

                {/* Sujet */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box component="label" sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, fontWeight: 500 }}>
                    Sujet *
                  </Box>
                  <Box
                    component="select"
                    required
                    sx={{
                      ...inputSx,
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23908980' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" style={{ background: '#181818' }}>Sélectionnez un sujet</option>
                    <option value="demo" style={{ background: '#181818' }}>Demande de démonstration</option>
                    <option value="devis" style={{ background: '#181818' }}>Demande de devis</option>
                    <option value="technique" style={{ background: '#181818' }}>Question technique</option>
                    <option value="partenariat" style={{ background: '#181818' }}>Partenariat</option>
                    <option value="autre" style={{ background: '#181818' }}>Autre</option>
                  </Box>
                </Box>

                {/* Message */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box component="label" sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, fontWeight: 500 }}>
                    Message *
                  </Box>
                  <Box
                    component="textarea"
                    required
                    rows={5}
                    placeholder="Décrivez votre demande..."
                    sx={{ ...inputSx, resize: 'vertical', minHeight: 120 }}
                  />
                </Box>

                {/* Submit */}
                <Box
                  component="button"
                  type="submit"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    bgcolor: GOLD,
                    color: '#1a1200',
                    fontWeight: 600,
                    fontFamily: BODY,
                    fontSize: '0.95rem',
                    border: 'none',
                    borderRadius: '8px',
                    px: 4,
                    py: 1.6,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: '#d4b35a' },
                    alignSelf: 'flex-end',
                    mt: 1,
                  }}
                >
                  <Send sx={{ fontSize: 18 }} />
                  Envoyer le message
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </PublicLayout>
  )
}

export default Contact
