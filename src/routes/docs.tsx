import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import 'swagger-ui-dist/swagger-ui.css'

export const Route = createFileRoute('/docs')({
  component: DocsPage,
})

function DocsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    import('swagger-ui-dist/swagger-ui-bundle.js').then(({ default: SwaggerUIBundle }) => {
      SwaggerUIBundle({
        dom_id: '#swagger-ui',
        url: '/api/docs/swaggerJson',
      })
    })
  }, [])

  if (!mounted) return null

  return <div id="swagger-ui" className="h-screen" />
}
