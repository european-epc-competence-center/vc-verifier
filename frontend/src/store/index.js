import { createStore } from 'vuex'


export default createStore({
  state: {
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
    setCredentials(context, credentials) {
        this.commit('setCredentials', credentials)
    },
    resetCredentials() {
        this.commit('setCredentials')
    },
  }, 
  modules: {},
})