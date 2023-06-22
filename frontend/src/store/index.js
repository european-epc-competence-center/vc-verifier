import { createStore } from 'vuex'
import api from '../api'
import { demoAuthPresentation } from './demoAuth';


export default createStore({
  state: {
    version: '1.6.0',
    authentication: demoAuthPresentation,
    verifiables: [],
    disclosedCredentials: [],
    VC_REGISTRY: process.env.VC_REGISTRY || 'https://ssi.eecc.de/api/registry/vcs/',
    OPENID_ENDPOINT: process.env.OPENID_ENDPOINT || 'https://ssi.eecc.de/api/openid/',
    showQRModal: false
  },
  mutations: {
    updateAuthentication(state, payload) {
      state.authentication = payload;
    },
    showQRModal(state, payload) {
      state.showQRModal = payload.value;
    },
    addVerifiables(state, verifiables) {
      state.verifiables = state.verifiables.concat(Array.isArray(verifiables) ? verifiables : [verifiables])
    },
    resetVerifiables(state) {
      state.verifiables = [];
    },
    addDisclosedCredential(state, credential) {
      state.disclosedCredentials.push(credential.id)
    },
  },
  actions: {
    addVerifiables(context, verifiables) {
      this.commit('addVerifiables', verifiables);
    },
    resetVerifiables() {
      this.commit('resetVerifiables');
    },
    makeAuthenticatedRequest(context, payload) {
      // folowing OID4VP with authVP extension
      api.post(payload.url, { vp: payload.authPresentation })
        .then((res) => {
          this.commit('addVerifiables', res.data)
          this.commit('addDisclosedCredential', res.data)
        })
        .catch((error) => {
          console.log(error)
        });
    }
  },
  modules: {},
})