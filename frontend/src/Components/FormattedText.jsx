function formatInline(text) {
  return text.split(/(\*\*[^*\n]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function FormattedText({ text, className = '' }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{formatInline(paragraph)}</p>
      ))}
    </div>
  );
}
