import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Toaster } from '@/components/ui/toaster'
import { DownloadAudio } from './pages/downloadAudio'

export function App() {
  return (
    <>
      <DownloadAudio />
      <ToastContainer />
      <Toaster />
    </>
  )
}
