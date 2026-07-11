import { useParams } from 'react-router-dom'

export function InitiativeDetail() {
  const { id } = useParams()

  return (
    <h1 className="text-2xl font-semibold text-secondary dark:text-secondary-lighter">
      Initiative {id}
    </h1>
  )
}
