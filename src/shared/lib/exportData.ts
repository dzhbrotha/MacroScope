// Download helpers so a chart can leave the app as data or as a picture.

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const body = rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return ''
          const text = String(cell)
          return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(';'),
    )
    .join('\r\n')
  // The byte order mark keeps Cyrillic readable when the file opens in Excel.
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Recharts renders plain SVG, so a picture is a serialise plus canvas redraw.
export async function downloadChartPng(
  container: HTMLElement | null,
  filename: string,
  background: string,
) {
  const svg = container?.querySelector('svg')
  if (!svg) throw new Error('No chart to export')

  const rect = svg.getBoundingClientRect()
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const backdrop = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  backdrop.setAttribute('width', '100%')
  backdrop.setAttribute('height', '100%')
  backdrop.setAttribute('fill', background)
  clone.insertBefore(backdrop, clone.firstChild)

  const source = new XMLSerializer().serializeToString(clone)
  const svgUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not rasterise the chart'))
      img.src = svgUrl
    })

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is unavailable')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    triggerDownload(canvas.toDataURL('image/png'), filename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
