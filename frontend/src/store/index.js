import { createStore } from 'vuex'


export default createStore({
  state: {
    version: '0.3.4',
    credentials: [],
    VC_REGISTRY: process.env.VC_REGISTRY || 'https://ssi.eecc.de/api/registry/vcs/',
    showQRModal: false
  },
  mutations: {
    showQRModal(state, payload) {
      state.showQRModal = payload.value
    },
    addCredential(state, credential) {
        state.credentials.push(credential)
    },
    addCredentials(state, credentials) {
      state.credentials = state.credentials.concat(credentials)
  },
    setCredentials(state, credentials) {
        state.credentials = credentials
    },
    resetCredentials(state) {
        state.credentials = []
    },
  },
  actions: { 
    addCredential(context, credential) {
        this.commit('addCredential', credential)
    },
    addCredentials(context, credentials) {
      this.commit('addCredentials', credentials)
  },
    setCredentials(context, credentials) {
        this.commit('setCredentials', credentials)
    },
    resetCredentials() {
        this.commit('resetCredentials')
    },
  }, 
  modules: {},
})