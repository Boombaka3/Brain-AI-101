import { readFile } from 'node:fs/promises'
import path from 'node:path'
import JSZip from 'jszip'
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from 'pdf-lib'

const TEMPLATE_FILENAME = 'BrainxAI_101_Certificate_Template.docx'
const TEMPLATE_PATH = path.join(process.cwd(), 'certificate', TEMPLATE_FILENAME)
const DOCUMENT_XML_PATH = 'word/document.xml'
const CERTIFICATE_PDF_FILENAME = 'BrainxAI_101_Certificate_of_Completion.pdf'
const CERTIFICATE_PDF_PATH = path.join(process.cwd(), 'certificate', CERTIFICATE_PDF_FILENAME)

const PLACEHOLDER_MAP = {
  '{{recipient_name}}': 'recipientName',
  '{{issue_month}}': 'issueMonth',
  '{{issue_year}}': 'issueYear',
  '{{signer_name}}': 'signerName',
} as const

export interface CertificateTemplateValues {
  recipientName: string
  issueMonth: string
  issueYear: string
  signerName?: string
}

const PDF_LAYOUT = {
  name: {
    xRatio: 0.5,
    yRatio: 0.52,
    fontSize: 26,
    minFontSize: 16,
    maxWidthRatio: 0.52,
    clearWidthRatio: 0.68,
    clearHeight: 40,
  },
  month: {
    xRatio: 0.128,
    yRatio: 0.15,
    fontSize: 16,
    clearWidth: 120,
    clearHeight: 24,
  },
  year: {
    xRatio: 0.122,
    yRatio: 0.11,
    fontSize: 18,
    clearWidth: 72,
    clearHeight: 24,
  },
} as const

function replaceAllPlaceholders(xml: string, values: CertificateTemplateValues) {
  let nextXml = xml

  for (const [placeholder, key] of Object.entries(PLACEHOLDER_MAP)) {
    const replacement = values[key]
    if (!replacement) continue
    nextXml = nextXml.split(placeholder).join(replacement)
  }

  return nextXml
}

export async function generateCertificateDocx(values: CertificateTemplateValues) {
  const templateBuffer = await readFile(TEMPLATE_PATH)
  const zip = await JSZip.loadAsync(templateBuffer)
  const documentEntry = zip.file(DOCUMENT_XML_PATH)

  if (!documentEntry) {
    throw new Error('Certificate template is missing word/document.xml.')
  }

  const documentXml = await documentEntry.async('string')
  const updatedDocumentXml = replaceAllPlaceholders(documentXml, values)

  zip.file(DOCUMENT_XML_PATH, updatedDocumentXml)

  return zip.generateAsync({ type: 'nodebuffer' })
}

export function normalizeRecipientName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function fitCenteredText({
  page,
  font,
  text,
  preferredSize,
  minSize,
  maxWidth,
}: {
  page: PDFPage
  font: PDFFont
  text: string
  preferredSize: number
  minSize: number
  maxWidth: number
}) {
  let fontSize = preferredSize

  while (fontSize > minSize && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 1
  }

  const width = font.widthOfTextAtSize(text, fontSize)

  return {
    fontSize,
    x: (page.getWidth() - width) / 2,
    width,
  }
}

function clearTextArea({
  page,
  centerX,
  centerY,
  width,
  height,
}: {
  page: PDFPage
  centerX: number
  centerY: number
  width: number
  height: number
}) {
  page.drawRectangle({
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  })
}

export async function generateCertificatePdf(values: CertificateTemplateValues) {
  const templateBuffer = await readFile(CERTIFICATE_PDF_PATH)
  const pdf = await PDFDocument.load(templateBuffer)
  const page = pdf.getPage(0)
  const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman)
  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic)

  const { width, height } = page.getSize()

  const namePlacement = fitCenteredText({
    page,
    font: timesItalic,
    text: values.recipientName,
    preferredSize: PDF_LAYOUT.name.fontSize,
    minSize: PDF_LAYOUT.name.minFontSize,
    maxWidth: width * PDF_LAYOUT.name.maxWidthRatio,
  })

  clearTextArea({
    page,
    centerX: width * PDF_LAYOUT.name.xRatio,
    centerY: height * PDF_LAYOUT.name.yRatio + namePlacement.fontSize * 0.2,
    width: width * PDF_LAYOUT.name.clearWidthRatio,
    height: PDF_LAYOUT.name.clearHeight,
  })

  page.drawText(values.recipientName, {
    x: namePlacement.x,
    y: height * PDF_LAYOUT.name.yRatio,
    size: namePlacement.fontSize,
    font: timesItalic,
    color: rgb(0.2, 0.14, 0.07),
  })

  clearTextArea({
    page,
    centerX: width * PDF_LAYOUT.month.xRatio + PDF_LAYOUT.month.clearWidth / 2,
    centerY: height * PDF_LAYOUT.month.yRatio + PDF_LAYOUT.month.clearHeight / 2 - 2,
    width: PDF_LAYOUT.month.clearWidth,
    height: PDF_LAYOUT.month.clearHeight,
  })

  page.drawText(values.issueMonth, {
    x: width * PDF_LAYOUT.month.xRatio,
    y: height * PDF_LAYOUT.month.yRatio,
    size: PDF_LAYOUT.month.fontSize,
    font: timesRoman,
    color: rgb(0.17, 0.1, 0.05),
  })

  clearTextArea({
    page,
    centerX: width * PDF_LAYOUT.year.xRatio + PDF_LAYOUT.year.clearWidth / 2,
    centerY: height * PDF_LAYOUT.year.yRatio + PDF_LAYOUT.year.clearHeight / 2 - 2,
    width: PDF_LAYOUT.year.clearWidth,
    height: PDF_LAYOUT.year.clearHeight,
  })

  page.drawText(values.issueYear, {
    x: width * PDF_LAYOUT.year.xRatio,
    y: height * PDF_LAYOUT.year.yRatio,
    size: PDF_LAYOUT.year.fontSize,
    font: timesRoman,
    color: rgb(0.17, 0.1, 0.05),
  })

  return Buffer.from(await pdf.save())
}

export function buildCertificateFilename(recipientName: string, extension = 'pdf') {
  const safeName = recipientName.replace(/[^\w-]+/g, '_').slice(0, 60) || 'recipient'
  return `BrainxAI_101_Certificate_${safeName}.${extension}`
}
