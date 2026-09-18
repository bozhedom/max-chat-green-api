import { ChatPage } from '@/features/chat/ui/ChatPage'
import { useSession } from '@/features/session/model/useSession'
import { LoginScreen } from '@/features/session/ui/LoginScreen'

export function App() {
  const { credentials, signIn, signOut } = useSession()

  if (!credentials) return <LoginScreen onSignIn={signIn} />

  return <ChatPage key={credentials.idInstance} credentials={credentials} onSignOut={signOut} />
}
