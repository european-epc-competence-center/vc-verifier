<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-3 pb-1">
            <router-link to="/"><i id="backbutton" style="font-size: 2rem;" class="bi-arrow-left-square-fill mx-3 my-1"
                    role="img" aria-label="API Docs"></i></router-link>
            <h3 class="mb-0 mx-5">Presentation Request</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img"
                    aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/openid/swagger/"><i class="bi-filetype-doc mx-3" role="img"
                    aria-label="API Docs"></i></a>
            <a href="https://id.eecc.de"><img id="logo" src="@/assets/img/logo.png" /></a>
        </div>
        <div class="card-body" style="overflow-y: scroll;">
            <div class="row mx-md-3">
                <div class="col-12">
                    <p>Define which credentials you want to have presented</p>
                </div>
            </div>
            <div class="row mx-md-3">
                <div class="col-md-4">
                    <select v-model="credentialType" @change="registerPresentationRequest" id="credentialType"
                        class="form-select" aria-label="Credential Type">
                        <option selected :value="undefined">All</option>
                        <option value="ProductPassportCredential">Product Passport Credential</option>
                        <option value="GS1GLNCredential">GS1 GLN Credential</option>
                    </select>
                    <label for="credentialType" class="form-label text-muted ms-1"><small>Credential type</small></label>
                </div>
            </div>
            <div class="row">
                <div class="col-12 px-0 mt-3 text-center">
                    <div v-if="generating" class="my-3" style="min-height: 300px;">
                        <p class="p-5 m-0 text-muted">Registering presentation request</p>
                        <div class="spinner-border text-primary m-5" role="status"
                            style="width: 5rem; height: 5rem; top: 150px;">
                            <span class="visually-hidden">Generating...</span>
                        </div>
                    </div>
                    <qrcode-vue v-else-if="presentationRequestId" :value="presentationRequestURI" :margin="1" :size="300"
                        level="M" class="my-3" id="presentation-request-canvas" />
                    <div v-else class="my-3" style="min-height: 300px;">
                        <p class="p-5 text-muted">Please configure your presentation request</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 mt-3 text-center text-muted">
                    <small>Using the <a
                            href="https://openid.net/specs/openid-4-verifiable-presentations-1_0.html">OpenId4VC</a>
                        protocol</small>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { useToast } from 'vue-toastification';
import QrcodeVue from 'qrcode.vue'
import { getPresentationDefinition } from '../utils.js';

export default {
    name: 'PresentationRequest',
    data() {
        return {
            toast: useToast(),
            qrSize: 300,
            generating: false,
            presentationRequestId: undefined,
            nonce: Math.random().toString(16).substring(2, 24),
            credentialType: undefined,
            intervalId: undefined
        }
    },
    components: {
        QrcodeVue
    },
    mounted() {
        if (this.intervalId) clearInterval(this.intervalId)
        this.intervalId = setInterval(this.getPresentation, 3000);
    },
    beforeUnmount() {
        if (this.intervalId) clearInterval(this.intervalId)
    },
    computed: {
        presentationDefinition() {
            return getPresentationDefinition(this.credentialType)
        },
        presentationRequest() {
            return {
                "nonce": this.nonce,
                "response_mode": "direct_post",
                "response_type": "vp_token",
                "client_id": this.$store.state.OPENID_ENDPOINT + "presentation" + this.getRequestPath(),
                "response_uri": this.$store.state.OPENID_ENDPOINT + "presentation" + this.getRequestPath(),
                "presentation_definition": this.presentationDefinition
            };
        },
        presentationRequestURI() {
            return 'openid-presentation-request://?client_id='
                + encodeURI(this.$store.state.OPENID_ENDPOINT + 'presentation/' + this.presentationRequestId)
                + '&request_uri='
                + encodeURI(this.$store.state.OPENID_ENDPOINT + 'request/' + this.presentationRequestId)
        }
    },
    methods: {
        getPresentation() {
            if (this.presentationRequestId) {
                this.$api.get(this.$store.state.OPENID_ENDPOINT + 'presentation' + this.getRequestPath())
                    .then((res) => {
                        clearInterval(this.intervalId)
                        this.intervalId = undefined
                        const presentationResponse = res.data
                        const presentation = typeof presentationResponse.vp_token == 'string' ? JSON.parse(presentationResponse.vp_token) : presentationResponse.vp_token;
                        this.$store.dispatch("addVerifiables", [presentation])
                            .then(() => this.$router.push({ path: '/verify', query: { challenge: this.nonce } }));
                    })
                    .catch((error) => {
                        if (error.response.status != 404) {
                            this.toast.error(`Something went wrong fetching the presentation request!\n${error}`);
                            console.error(error)
                            clearInterval(this.intervalId)
                            this.intervalId = undefined
                        }
                    }).finally(() => {

                    });
            }
        },
        getRequestPath() {
            return this.presentationRequestId ? '/' + this.presentationRequestId : '';
        },
        registerPresentationRequest() {
            this.generating = true
            this.$api.post(this.$store.state.OPENID_ENDPOINT + 'request' + this.getRequestPath(), this.presentationRequest)
                .then((res) => {
                    this.presentationRequestId = res.data;
                })
                .catch((error) => {
                    this.toast.error(`Something went wrong generating the presentation request!\n${error}`);
                }).finally(() => {
                    this.generating = false
                });
        }
    }
}
</script>