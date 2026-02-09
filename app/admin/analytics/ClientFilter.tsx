'use client'

interface Client {
  id: string
  name: string
}

export default function ClientFilter({ clients }: { clients: Client[] }) {
  if (clients.length <= 1) return null

  return (
    <select
      onChange={(e) => {
        const clientId = e.target.value
        window.location.href = clientId
          ? `/admin/analytics?clientId=${clientId}`
          : '/admin/analytics'
      }}
      defaultValue=""
      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
    >
      <option value="">All Clients</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  )
}
