import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { StatusCodes } from 'http-status-codes'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => response.data,
  errorResponseHandler
)

async function errorResponseHandler(error) {
  if (error.response) {
    const { data, status } = error.response
    let { message } = data

    if (status === StatusCodes.UNAUTHORIZED) {
      Message.error({message, duration: 1000})

      const currentPath = router.currentRoute.path
      await store.dispatch('user/resetToken')

      if (!currentPath.startsWith('/login')) {
        // resetRouter()
        await store.dispatch('tagsView/delAllViews', null, { root: true })
        router.replace(`/login`).catch(() => {})
      }
      return Promise.reject(message)
    } else if (status === StatusCodes.FORBIDDEN) {
      message = message + '，将为您跳转到首页'
      const duration = 1200
      Message.error({message, duration: duration})

      setTimeout(() => {
        router.replace('/').then()
        store.dispatch('tagsView/delAllViews', null, { root: true })
      }, duration)
      return Promise.reject(message)
    } else {
      Message.error({message, duration: 1200})
      return Promise.reject(message)
    }

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error", error.message);
  }

}

export default service
