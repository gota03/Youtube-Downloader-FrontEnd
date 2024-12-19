import { useState } from 'react'
import { api } from '../../services/axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import LoadingBar from 'react-top-loading-bar'
import { LoadingOval } from '@/components/loading'

export function DownloadAudio() {
  const { toast } = useToast()
  const [url, setUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [percentageDownload, setPercentage] = useState<number>(0)

  async function decodeUtf(content: string) {
    try {
      const regex = /filename\*?=utf-8''([^;]+)|filename="([^"]+)"/i

      const match = content.match(regex)
      
      if (!match) throw new Error('Nenhum match encontrado')

      return match[1] ? decodeURIComponent(match[1]) : match[2] || 'audio.mp4'
    } catch (error) {
      console.error('Erro ao decodificar o Content-Disposition:', error)

      toast({
        title: 'Erro ao extrair nome do arquivo',
        variant: 'destructive',
      })
      return 'audio.mp4'
    }
  }

  async function createDownloadLink(data: Blob, filename: string, type: string) {
    const downloadUrl = window.URL.createObjectURL(new Blob([data], { type: type }))

    const link = document.createElement('a')

    link.href = downloadUrl

    link.setAttribute('download', filename)

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  async function handleSubmitUrl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    if (!url.includes('youtube') && !url.includes('youtu.be')) {
      toast({
        title: 'Apenas vídeos do Youtube são permitidos'
      })  
      setIsLoading(false)
      return
    }
      try {
        const response = await api.get<Blob>(`/download/?video=${url}`, {
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
              setPercentage(progress)
            }
          },
        })

        const data = response.data
        const type = data.type

        const contentDisposition = response.headers['content-disposition']
        const filename = await decodeUtf(contentDisposition)

        await createDownloadLink(data, filename, type)

        setPercentage(0)
        setIsLoading(false)

        toast({
          title: 'Música baixada com sucesso',
        })
      } catch (err: any) {
        setPercentage(0)
        setIsLoading(false)
        console.error('Erro: ', err)
        toast({
          title: 'Erro ao baixar a música',
          variant: 'destructive',
        })
      }
  }

  return (
    <div className=' bg-gray-900 h-screen flex items-center justify-center'>
      {isLoading && (
        <div className='fixed top-0 left-0 w-full z-50'>
          <LoadingBar color='#0db387' progress={percentageDownload} height={4} />
        </div>
      )}
      <div className='bg-cinza-700 p-6 rounded-lg shadow-lg w-full max-w-sm'>
        <form onSubmit={handleSubmitUrl} className='space-y-4'>
          <Label htmlFor='url' className='text-branco-50 font-medium text-base'>
            Url
          </Label>
          <Input
            required
            id='url'
            type='text'
            placeholder='Digite ou cole a url do vídeo...'
            onChange={(e) => setUrl(e.target.value)}
            className='w-full border border-branco-100 rounded-md placeholder:text-base placeholder:text-branco-100 text-branco-100'
          />
          {isLoading ? (
            <div className='flex justify-center items-center gap-2'>
              <p className='text-branco-50 text-sm'>Baixando... </p>
              <LoadingOval />
            </div>
          ) : (
            <Button
              className='w-full bg-verde-500 text-branco-50 p-2 rounded-md flex items-center justify-center gap-2 disabled:cursor-not-allowed hover:opacity-90 hover:bg-verde-500'
              type='submit'
              disabled={isLoading}
            >
              Baixar
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
