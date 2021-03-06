import Vue from 'vue'
import { Context } from '@nuxt/types'
import draggable from 'vuedraggable'
import BaseService from '~/services/base'
import ApiService from '~/services/api'

export default (context: Context) => {
  BaseService.error = context.error
  BaseService.api = ApiService
  BaseService.vuex = context.store
  BaseService.events = new Vue()
  BaseService.router = context.app.router
  BaseService.route = context.route
  ApiService.axios = context.app.$axios
  ApiService.redirect = context.redirect

  ApiService.initInterceptors()

  // Register all the components
  const componentsFolderFiles: any = require.context('../components', true, /\.vue$/i)
  componentsFolderFiles.keys().forEach((key: String) => {
    const part: String | undefined = key.split('/').pop()
    if (part) {
      Vue.component(part.split('.')[0], componentsFolderFiles(key).default)
    }
  })

  // Draggable
  Vue.component('Draggable', draggable)

  BaseService.vuex.dispatch('setMainListScrollTop', 0)
  BaseService.initApplication()
    .then(() => BaseService.vuex.dispatch('setIsInitInfoLoading', false))
    .catch(() => BaseService.vuex.dispatch('setIsInitInfoLoading', false))
}
