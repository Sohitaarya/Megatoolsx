/**
 * QR — real engine (wraps the well-tested `qrcode` library).
 * Builds the correct content payload per QR type and renders real QR codes.
 */

import QRCode from 'qrcode'

export type QrType = 'url' | 'text' | 'email' | 'phone' | 'wifi'

export function buildPayload(type: QrType, value: string, wifi?: { ssid: string; password: string; encryption: string }): string {
  switch (type) {
    case 'url': {
      const v = value.trim()
      return /^https?:\/\//i.test(v) ? v : `https://${v}`
    }
    case 'email':
      return `mailto:${value.trim()}`
    case 'phone':
      return `tel:${value.trim().replace(/[^\d+]/g, '')}`
    case 'wifi':
      if (!wifi) return ''
      return `WIFI:T:${wifi.encryption || 'WPA'};S:${wifi.ssid};P:${wifi.password};;`
    case 'text':
    default:
      return value
  }
}

export interface QrRenderOptions {
  width: number
  margin: number
  foreground: string
  background: string
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

export type QrPoint = { x: number; y: number }

/** Render a real QR onto a canvas (returns the canvas for preview/export). */
export async function renderQr(canvas: HTMLCanvasElement, content: string, opts: QrRenderOptions): Promise<void> {
  if (!content.trim()) return
  await QRCode.toCanvas(canvas, content, {
    width: opts.width,
    margin: opts.margin,
    errorCorrectionLevel: opts.errorCorrection,
    color: { dark: opts.foreground, light: opts.background },
  })
}

/** Download the QR as a real PNG blob. */
export async function qrPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'))
}

/** True SVG string for the QR (the library actually produces SVG). */
export async function qrSvg(content: string, opts: QrRenderOptions): Promise<string> {
  return QRCode.toString(content, { type: 'svg', errorCorrectionLevel: opts.errorCorrection, color: { dark: opts.foreground, light: opts.background } })
}