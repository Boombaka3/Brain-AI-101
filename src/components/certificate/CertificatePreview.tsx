import { forwardRef } from 'react'
import './certificate.css'

interface CertificatePreviewProps {
  studentName: string
  issueDate: string
}

const CertificatePreview = forwardRef<HTMLDivElement, CertificatePreviewProps>(function CertificatePreview(
  { studentName, issueDate },
  ref,
) {
  const displayName = studentName.trim() || '[Student Name]'

  return (
    <div ref={ref} className="certificate-preview" aria-label="Certificate preview">
      <div className="certificate-preview__inner">
        <p className="certificate-preview__eyebrow">Certificate of Completion</p>
        <h3 className="certificate-preview__title">CERTIFICATE OF COMPLETION</h3>

        <div className="certificate-preview__awarded">
          <span>Awarded to:</span>
          <strong>{displayName}</strong>
        </div>

        <div className="certificate-preview__body">
          <p>This certificate is presented to</p>
          <p className="certificate-preview__name">{displayName}</p>
          <p>for successfully completing</p>
          <p className="certificate-preview__course">BrainxAI 101</p>
        </div>

        <p className="certificate-preview__subtitle">
          An introductory course on neuroscience and artificial intelligence
        </p>

        <div className="certificate-preview__footer">
          <div className="certificate-preview__signature">
            <span className="certificate-preview__line" />
            <p>Ruogu Fang</p>
          </div>
          <div className="certificate-preview__date">
            <span>Date: {issueDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CertificatePreview
