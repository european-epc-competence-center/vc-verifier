<template>
    <div class="modal fade" :id="id" aria-hidden="true" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5">Authentication</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center pt-1" style="height: 70vh; overflow-y: scroll; overflow-x: hidden;">
                    <div class="row justify-content-end mb-5">
                        <div class="col-11 text-end">
                            <small class="text-muted">Use demo authentication</small>
                        </div>
                        <div class="col-1 ps-0">
                            <div class="form-check form-switch">
                                <input @change="updateDemoAuth($event)" class="form-check-input" type="checkbox"
                                    id="useDemoSwitch" :checked="isDemoAuth">
                            </div>
                        </div>
                    </div>
                    <div v-if="authentication">
                        <h5>Authenticated as</h5>
                        <h5 class="my-3"><strong>{{ authHolder }}</strong></h5>
                        <div v-if="authCredentials">
                            <h5>holding the following credentials</h5>
                            <ol class="list-group list-group my-5 mx-md-3">
                                <li v-for="vc in authCredentials " :key="vc.id"
                                    class="list-group-item d-flex justify-content-between align-items-start">
                                    <div class="ms-2 me-auto text-start">
                                        <div class="fw-bold text-primary">{{ vc.type[1] }}</div>
                                        <small class="text-muted">issued by</small> {{ vc.issuer.id || vc.issuer }}
                                    </div>
                                    <a tabindex="0" type="button" data-bs-container="body" data-bs-toggle="tooltip"
                                        :data-bs-title="getHTMLProps(vc.credentialSubject)" data-bs-html="true">
                                        <small>
                                            <i class="bi bi-info-circle text-primary"></i>
                                        </small>
                                    </a>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div v-else class="row align-items-center" style="height: 30vh;">
                        <div class="col-12">
                            <h5>Authenticate with your wallet</h5>
                            <PresentationRequest v-if="active" mode="authenticate" />
                        </div>
                    </div>
                </div>
                <div class="modal-footer row justify-content-center">
                    <div class="col-6 col-md-5 col-lg-3">
                        <button :disabled="!authentication" @click="this.authentication = undefined" type="button"
                            class="btn btn-outline-secondary w-100">Re-authenticate <i class="bi-arrow-repeat"></i></button>
                    </div>
                    <div class="col-6 col-md-5 col-lg-3">
                        <button v-if="authentication" data-bs-dismiss="modal" type="button"
                            class="btn btn-outline-primary w-100">Apply
                            <i class="bi-check-circle-fill"></i></button>
                        <button v-else data-bs-dismiss="modal" type="button" class="btn btn-outline-secondary w-100">Discard
                            <i class="bi-x-octagon"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PresentationRequest from "./PresentationRequest.vue";
import { demoAuthPresentation } from "@/store/demoAuth";
import { isDemoAuth } from "../utils.js";

export default {
    name: 'AuthModal',
    props: {
        id: String
    },
    components: {
        PresentationRequest
    },
    data() {
        return {
            demoAuth: demoAuthPresentation,
            active: false
        }
    },
    mounted() {
        const modal = document.getElementById(this.id)
        modal.addEventListener('show.bs.modal', () => this.active = true)
        modal.addEventListener('hide.bs.modal', () => this.active = false)
    },
    computed: {
        isDemoAuth() {
            return isDemoAuth(this.authentication);
        },
        authentication: {
            get() {
                return this.$store.state.authentication;
            },
            set(auth) {
                this.$store.commit('updateAuthentication', auth);
            }
        },
        authHolder() {
            return this.authentication.holder || (Array.isArray(this.authentication.proof) ? this.authentication.proof[0].verificationMethod : this.authentication.proof.verificationMethod).split('#')[0]
        },
        authCredentials() {
            if (!this.authentication.verifiableCredential) return undefined;
            return Array.isArray(this.authentication.verifiableCredential) ? this.authentication.verifiableCredential : [this.authentication.verifiableCredential];
        }
    },
    methods: {
        getHTMLProps(props) {
            return Object.entries(props).map(([key, value]) => {
                return key == 'id' ? undefined : '<strong>' + key + '</strong>: ' + value
            }).filter((x) => x).join('<br>');
        },
        updateDemoAuth(event) {
            this.authentication = event.target.checked ? this.demoAuth : undefined;
        },
    }
}
</script>