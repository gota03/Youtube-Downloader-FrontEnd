import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://you-audio-backend-five.vercel.app/',
})
