import axios from 'axios'

// 127.0.0.1:8000
// you-audio-backend-five.vercel.app

export const api = axios.create({
  baseURL: 'you-audio-backend-five.vercel.app',
})
