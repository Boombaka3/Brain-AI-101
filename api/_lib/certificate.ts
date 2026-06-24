import { readFile, writeFile, unlink } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import JSZip from 'jszip'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const DOCX_TEMPLATE_PATH = path.join(
  process.cwd(),
  'certificate',
  'BrainxAI_101_Certificate_Template.docx',
)
const PDF_TEMPLATE_PATH = path.join(
  process.cwd(),
  'certificate',
  'BrainxAI_101_Certificate_Template.pdf',
)
const DOCUMENT_XML_PATH = 'word/document.xml'

export interface CertificateTemplateValues {
  recipientName: string
  issueMonth: string
  issueYear: string
}

export function normalizeRecipientName(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/\{\{[^}]*\}\}/g, '')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Cached — soffice availability does not change during process lifetime.
let sofficeAvailable: boolean | null = null

function isSofficeAvailable(): boolean {
  if (sofficeAvailable !== null) return sofficeAvailable
  try {
    execSync('which soffice', { stdio: 'ignore' })
    sofficeAvailable = true
  } catch {
    sofficeAvailable = false
  }
  return sofficeAvailable
}

async function fillDocxTemplate(values: CertificateTemplateValues): Promise<Buffer> {
  const content = await readFile(DOCX_TEMPLATE_PATH)
  const zip = await JSZip.loadAsync(content)

  const documentEntry = zip.file(DOCUMENT_XML_PATH)
  if (!documentEntry) {
    throw new Error('Certificate template is missing word/document.xml.')
  }

  let xml = await documentEntry.async('string')

  // Word's spell-checker inserts <w:proofErr> markers between runs, splitting
  // {{recipient_name}} into three separate runs: "{{" + "recipient_name" + "}}".
  // Remove those markers first so the adjacent runs become contiguous.
  xml = xml.replace(/<w:proofErr[^>]*\/>/g, '')

  // Try single-run replacement first (future-proof if template is ever fixed).
  // If not found, match the known three-run split pattern and collapse it into
  // one run, keeping the middle run's rPr (48pt bold) for the name.
  if (xml.includes('{{recipient_name}}')) {
    xml = xml.split('{{recipient_name}}').join(escapeXml(values.recipientName))
  } else {
    xml = xml.replace(
      /<w:r\b[^>]*>(?:<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t(?:\s[^>]*)?>{{<\/w:t><\/w:r><w:r\b[^>]*>(<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t(?:\s[^>]*)?>recipient_name<\/w:t><\/w:r><w:r\b[^>]*>(?:<w:rPr>[\s\S]*?<\/w:rPr>)?<w:t(?:\s[^>]*)?>}}<\/w:t><\/w:r>/,
      (_match, rPr?: string) =>
        `<w:r>${rPr ?? ''}<w:t xml:space="preserve">${escapeXml(values.recipientName)}</w:t></w:r>`,
    )
  }

  // Month: inject 24pt (sz=48) explicitly — the run uses the "Date" paragraph
  // style which is too small. Add/merge the font size into the run's rPr.
  xml = xml.replace(
    /(<w:r[^>]*>)(<w:rPr>[\s\S]*?<\/w:rPr>)?(<w:t[^>]*>)\{\{issue_month\}\}(<\/w:t><\/w:r>)/,
    (_m, runOpen: string, rPr: string | undefined, tOpen: string, tClose: string) => {
      const fontProps = '<w:sz w:val="48"/><w:szCs w:val="48"/>'
      const newRPr = rPr
        ? rPr.replace('</w:rPr>', `${fontProps}</w:rPr>`)
        : `<w:rPr>${fontProps}</w:rPr>`
      return `${runOpen}${newRPr}${tOpen}${escapeXml(values.issueMonth.toUpperCase())}${tClose}`
    },
  )

  // Year: bump explicit font size from 14pt (sz=28) to 24pt (sz=48) before
  // replacing the placeholder so the substituted text inherits the larger size.
  xml = xml.replace(
    /(<w:r[^>]*>)(<w:rPr>)([\s\S]*?)(<\/w:rPr>)(<w:t[^>]*>)\{\{issue_year\}\}/,
    (_m, runOpen: string, rPrOpen: string, rPrContent: string, rPrClose: string, tOpen: string) => {
      const fixed = rPrContent
        .replace(/(<w:sz w:val=")28(")/g, '$148$2')
        .replace(/(<w:szCs w:val=")28(")/g, '$148$2')
      return `${runOpen}${rPrOpen}${fixed}${rPrClose}${tOpen}{{issue_year}}`
    },
  )
  xml = xml.split('{{issue_year}}').join(escapeXml(values.issueYear))

  zip.file(DOCUMENT_XML_PATH, xml)
  return zip.generateAsync({ type: 'nodebuffer' })
}

async function generatePdfLibCertificate(values: CertificateTemplateValues): Promise<Buffer> {
  const templateBuffer = await readFile(PDF_TEMPLATE_PATH)
  const pdf = await PDFDocument.load(templateBuffer)
  const page = pdf.getPage(0)
  const { width, height } = page.getSize()

  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman)

  // Name — centered horizontally, 26pt italic
  const nameFontSize = 26
  const nameY = height * 0.38
  const nameTextWidth = timesItalic.widthOfTextAtSize(values.recipientName, nameFontSize)
  const nameX = (width - nameTextWidth) / 2

  console.log('certificate name Y:', nameY.toFixed(1), 'x:', nameX.toFixed(1), 'pageH:', height)

  page.drawText(values.recipientName, {
    x: nameX,
    y: nameY,
    size: nameFontSize,
    font: timesItalic,
    color: rgb(0.2, 0.14, 0.07),
  })

  // Month — 20pt
  page.drawText(values.issueMonth.toUpperCase(), {
    x: width * 0.128,
    y: height * 0.15,
    size: 20,
    font: timesRoman,
    color: rgb(0.17, 0.1, 0.05),
  })

  // Year — 22pt
  page.drawText(values.issueYear, {
    x: width * 0.122,
    y: height * 0.11,
    size: 22,
    font: timesRoman,
    color: rgb(0.17, 0.1, 0.05),
  })

  return Buffer.from(await pdf.save())
}

export async function generateCertificateDocument(values: CertificateTemplateValues): Promise<{
  buffer: Buffer
  mimeType: string
  extension: 'pdf' | 'docx'
}> {
  // Path 1: LibreOffice DOCX→PDF (available in some environments, not Vercel)
  if (isSofficeAvailable()) {
    const docxBuffer = await fillDocxTemplate(values)
    const tmp = tmpdir()
    const id = randomUUID()
    const tmpDocx = path.join(tmp, `cert_${id}.docx`)
    const tmpPdf = path.join(tmp, `cert_${id}.pdf`)
    try {
      await writeFile(tmpDocx, docxBuffer)
      execSync(`soffice --headless --convert-to pdf "${tmpDocx}" --outdir "${tmp}"`, {
        timeout: 25000,
      })
      const pdfBuffer = await readFile(tmpPdf)
      return { buffer: pdfBuffer, mimeType: 'application/pdf', extension: 'pdf' }
    } finally {
      await unlink(tmpDocx).catch(() => {})
      await unlink(tmpPdf).catch(() => {})
    }
  }

  // Path 2: pdf-lib overlay on the PDF template (works on Vercel)
  try {
    const pdfBuffer = await generatePdfLibCertificate(values)
    return { buffer: pdfBuffer, mimeType: 'application/pdf', extension: 'pdf' }
  } catch {
    // Path 3: last resort — return filled DOCX if PDF template is missing
    const docxBuffer = await fillDocxTemplate(values)
    return {
      buffer: docxBuffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
    }
  }
}

export function buildCertificateFilename(recipientName: string, extension = 'pdf') {
  const safeName = recipientName.replace(/[^\w-]+/g, '_').slice(0, 60) || 'recipient'
  return `BrainxAI_101_Certificate_${safeName}.${extension}`
}
