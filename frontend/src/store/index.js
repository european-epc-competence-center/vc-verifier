import { createStore } from 'vuex'


export default createStore({
  state: {
    version: '1.4.0',
    verifiables: [],
    VC_REGISTRY: process.env.VC_REGISTRY || 'https://ssi.eecc.de/api/registry/vcs/',
    OPENID_ENDPOINT: process.env.OPENID_ENDPOINT || 'http://localhost:3002/api/openid/',
    showQRModal: false
  },
  mutations: {
    showQRModal(state, payload) {
      state.showQRModal = payload.value
    },
    addVerifiables(state, verifiables) {
      state.verifiables = state.verifiables.concat(verifiables)
    },
    resetVerifiables(state) {
      state.verifiables = [];
    },
  },
  actions: {
    addVerifiables(context, verifiables) {
      this.commit('addVerifiables', verifiables)
    },
    resetVerifiables() {
      this.commit('resetVerifiables')
    },
  },
  modules: {},
})