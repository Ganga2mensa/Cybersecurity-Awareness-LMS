import { forbidden } from 'next/navigation'

export default function UnauthorizedPage() {
  forbidden()
}
