import { createFileRoute } from '@tanstack/react-router'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export const Route = createFileRoute('/docs')({
  component: DocsPage,
})

function DocsPage() {
  return (
    <div className="h-screen w-full">
      <SwaggerUI url="/api/docs/swaggerJson" />
    </div>
  )
}
