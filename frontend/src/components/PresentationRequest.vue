<template>
    <div class="row">
        <div class="col-12 px-0 my-3 text-center">
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
            <small>Using the <a href="https://openid.net/specs/openid-4-verifiable-presentations-1_0.html">OpenId4VC</a>
                protocol</small>
        </div>
    </div>
</template>
<script>
import { useToast } from 'vue-toastification';
import QrcodeVue from 'qrcode.vue';

function getInputDescriptor(ct) {
    return {
        id: "eecc_verifier_request_" + ct || "VerifiableCredential",
        format: {
            ldp_vc: {
                proof_type: ["Ed25519Signature2018", "Ed25519Signature2020"],
            },
        },
        constraints: {
            fields: [
                {
                    path: ["$.type"],
                    filter: {
                        type: "array",
                        contains: {
                            type: "string",
                            pattern: ct || "VerifiableCredential",
                        },
                    },
                },
            ],
        },
    };
}

export default {
    name: 'PresentationRequest',
    props: {
        credentialTypes: Array,
        mode: {
            type: String,
            default: 'verify'
        },
        composeTypesWithOr: {
            type: Boolean, 
            default: false
        }
    },
    data() {
        return {
            toast: useToast(),
            qrSize: 300,
            generating: false,
            presentationRequestId: undefined,
            nonce: Math.random().toString(16).substring(2, 24),
            intervalId: undefined
        }
    },
    components: {
        QrcodeVue
    },
    mounted() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(this.getPresentation, 3000);
        this.registerPresentationRequest();
    },
    beforeUnmount() {
        if (this.intervalId) clearInterval(this.intervalId)
    },
    watch: {
        credentialTypes: {
            handler() {
                this.registerPresentationRequest();
            },
            deep: true
        },
        composeTypesWithOr: {
            handler() {
                this.registerPresentationRequest();
            },
        },
    },
    computed: {
        authentication: {
            get() {
                return this.$store.state.authentication;
            },
            set(auth) {
                this.$store.commit('updateAuthentication', auth);
            }
        },
        presentationDefinition() {
            const definition = {
                "id": "eecc_verifier_request",
                "input_descriptors": [
                ]
            }
            if (this.composeTypesWithOr) {
                definition.input_descriptors.push(
                    getInputDescriptor(this.credentialTypes.join("|"))
                );
            } 
            if (!this.composeTypesWithOr) {
                for (const credentialType of this.credentialTypes) {
                    definition.input_descriptors.push(
                        getInputDescriptor(credentialType)
                    );
                }
            } 
            return definition;

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
                        if (this.mode == 'authenticate') {
                            this.authentication = presentation;
                        } else {
                            this.$store.dispatch("addVerifiables", [presentation])
                                .then(() => this.$router.push({ path: '/verify', query: { challenge: this.nonce } }));
                        }
                    })
                    .catch((error) => {
                        if (error.response.status != 404) {
                            this.toast.error(`Something went wrong fetching the presentation request!\n${error}`);
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