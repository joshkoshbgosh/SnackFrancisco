import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
  // loader: async () => await getCount(),
})

function Home() {
  return (
    <div>Hello World!</div>
  )
}
