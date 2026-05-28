export default function CourseEvaluationQuestionCallback({ module, sectionTitle }) {
  return (
    <div className="ce-connects-strip" aria-label={`Connects to ${module} ${sectionTitle}`}>
      <span>Connects to:</span>
      <strong>{module} · {sectionTitle}</strong>
    </div>
  )
}
