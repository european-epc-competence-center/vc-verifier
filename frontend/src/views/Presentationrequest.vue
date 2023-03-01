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
    <qrcode-vue
      :v-if="qr_code_value"
      :value="qr_code_value"
      :margin="1"
      :size="300"
      level="M"
      class="m-3"
    />
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
    }
  },
  async mounted() {
    this.qr_code_value = await this.openid_presentation_request()
    this.intervalid = setInterval(function () {
      this.get_status()
    }, 1000)
  },
  methods: {
    async openid_presentation_request() {
      var request_id = await this.generate_request_in_backend()
      var endpoint = this.base_path + this.presentation_endpoint
      var request_uri =
        this.base_path + this.request_endpoint + '/' + request_id

      var qr_code_value =
        'openid-presentation-request://?client_id=' +
        encodeURI(endpoint) +
        '&request_uri=' +
        encodeURI(request_uri)
      console.log(qr_code_value)
      return qr_code_value
    },
    async generate_request_in_backend() {
      return this.$api
        .get(this.request_endpoint)
        .then((re) => {
          console.log(re)
          this.presentation_uri = this.base_path + '/presentation/' +re.data.presentation_definition_id
          return re.data.id
        })
        .catch((error) => {
          console.log(error)
        })
    },
    async get_status() {
      if (!this.request_uri) {
        return
      }
      console.log('request uri', this.request_uri)
      this.$api
        .get(this.presentation_uri)
        .then((re) => {
          console.log(re)
          var verifiable_presentation = re.data
          this.$store.dispatch('addVerifiables', [verifiable_presentation])
          this.$router.push({ path: '/verify' })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
}
</script>