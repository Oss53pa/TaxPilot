import DOMPurify from 'dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className, as: Tag = 'div' }) => (
  <Tag
    className={className}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
)

export default SafeHtml
