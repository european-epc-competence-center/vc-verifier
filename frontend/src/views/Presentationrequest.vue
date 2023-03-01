<template>
  <div id="maincard" class="card m-md-auto shadow">
    <div class="card-header text-center p-3 pb-1">
      <h3 class="mb-0 mx-5">Credential Selector</h3>
      <a href="https://github.com/european-epc-competence-center/vc-verifier"
        ><i class="bi-github mx-3" role="img" aria-label="GitHub"></i
      ></a>
      <a href="https://ssi.eecc.de/api/verifier/swagger/"
        ><i class="bi-filetype-doc mx-3" role="img" aria-label="API Docs"></i
      ></a>
      <a href="https://id.eecc.de"
        ><img id="logo" src="@/assets/img/logo.png"
      /></a>
    </div>
    <h5>Open ID for verifiable presentations</h5>
    <p class="m-3">
      Scan the QR Code with your wallet to present your credential.
    </p>
    <a v-if="qr_code_value" :href="qr_code_value">
      <qrcode-vue
        :value="qr_code_value"
        :margin="1"
        :size="300"
        level="M"
        class="m-3"
      />
    </a>
    <div
      v-else
      class="spinner-border text-secondary"
      role="status"
      style="width: 1.25rem; height: 1.25rem"
    >
      <span class="visually-hidden">Loading Presentation Request...</span>
    </div>
  </div>
</template>
<script>
import { useToast } from 'vue-toastification'
import QrcodeVue from 'qrcode.vue'
export default {
  name: 'Presentationrequest',
  components: { QrcodeVue },
  data() {
    return {
      toast: useToast(),
      base_path: 'https://ssi.eecc.de/api/verifier',
      presentation_endpoint: '/openid-presentation',
      request_endpoint: '/openid-presentation-request',
      qr_code_value: '',
      presentation_uri: '',
      intervalid: '',
    }
  },
  async mounted() {
    this.qr_code_value = await this.openid_presentation_request()
    if (this.intervalid) {
      clearInterval(this.intervalid)
    }
    this.intervalid = setInterval(this.get_status, 3000)
  },
  methods: {
    async openid_presentation_request() {
      var presentation_request = await this.generate_request_in_backend()
      var qr_code_value = presentation_request.request_uri
      console.log('Request uri:', qr_code_value)
      return qr_code_value
    },
    async generate_request_in_backend() {
      return this.$api
        .get(this.request_endpoint)
        .then((re) => {
          console.log(re)
          this.presentation_uri =
            this.base_path +
            '/presentation/' +
            re.data.presentation_definition_id
          return re.data
        })
        .catch((error) => {
          console.log(error)
        })
    },
    async get_status() {
      //console.log('getting presentation_uri', this.presentation_uri)
      if (!this.presentation_uri) {
        return
      }
      this.$api
        .get(this.presentation_uri)
        .then((re) => {
          console.log(re)
          var verifiable_presentation = re.data
          this.$store.dispatch('addVerifiables', [verifiable_presentation])
          this.$router.push({ path: '/verify' })
        })
        .catch((error) => {
          if (!error || !error.response || error.response.status !== 404) {
            console.log(error)
          }
        })
    },
  },
}
</script>