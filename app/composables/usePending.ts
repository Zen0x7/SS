import type { MessagePayload, ProfilePayload } from '~/utils/share'
import type { Opened } from '~/utils/pki'

/** Enlaces que llegaron antes de que el usuario terminara de crear su perfil. */
export const usePending = () => {
  const profile = useState<ProfilePayload | null>('ss:pendingProfile', () => null)
  const message = useState<MessagePayload | null>('ss:pendingMessage', () => null)
  const opened = useState<Opened | null>('ss:opened', () => null)
  return { profile, message, opened }
}