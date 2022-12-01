<template>
    <div class="card m-auto shadow" style="min-width: 80%; height: 90vh;">
        <div class="card-header text-center p-3 pb-1">
            <router-link to="/"><i id="backbutton" style="font-size: 2rem;" class="bi-arrow-left-square-fill mx-3 my-1" role="img" aria-label="API Docs"></i></router-link>
            <h3 class="mb-0 mx-5">Verifiable Credential Verifier</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img" aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/verifier/swagger/"><i class="bi-filetype-doc mx-3" role="img" aria-label="API Docs"></i></a>
            <a href="https://eecc.info"><img id="logo" src="@/assets/img/logo.png"/></a>
        </div>
        <div class="card-body p-3" style="overflow-y: scroll;">
            <div class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0" v-html="getInfoString"></p>
                <Transition name="fade">
                <div v-if="progress < credentials.length" class="text-center px-5 mt-3">
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar progress-bar-striped" role="progressbar" aria-label="Verification progress" :style="'width: ' + progress/credentials.length * 100 + '%;'" :aria-valuenow="progress" aria-valuemin="0" :aria-valuemax="credentials.length + 1"></div>
                    </div>
                </div>
                </Transition>
            </div>
            <Passport :credentials="credentials"/>
            <h5 v-if="!credentialId" class="mx-3 px-3">Included Credentials</h5>
            <div v-for="credential in getOrderedCredentials" :key="credential.id" class="card shadow m-3">
                <QRModal :id="getCredCompId('modal', credential.id)" v-bind:value="getPlainCredential(credential)"/>
                <div class="card-header p-3">
                    <div class="row justify-content-between align-items-center">
                        <div class="col-md-6">
                            <h5 class="mb-0 text-primary">{{credential.type[1]}}</h5>
                        </div>
                        <div class="col-md-6 text-end">
                            <i v-if="credential.verified==true" style="font-size: 1.25rem;" class="bi bi-check-circle-fill text-success" role="img" aria-label="Verified"></i>
                            <i v-else-if="credential.verified==false" style="font-size: 1.25rem;" class="bi bi-x-circle-fill text-danger" role="img" aria-label="Unverified"></i>
                            <div v-else class="spinner-border text-secondary" role="status" style="width: 1.25rem; height: 1.25rem;">
                                <span class="visually-hidden">Verifying...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-3">
                    <div class="row justify-content-between mb-3">
                        <div class="col-md-6 text-secondary">
                            <div class="row my-1 me-md-5">
                                <div class="col-sm-4">
                                    Issuer:
                                </div>
                                <div class="col-sm-8 text-sm-end text-start">
                                    <span v-if="typeof credential.issuer == 'string'" class="badge text-bg-primary text-white">{{credential.issuer}}</span>
                                    <div v-else ><span class="badge text-bg-primary text-white">{{credential.issuer.id}}</span><span class="ms-3">{{credential.issuer.name}} <img style="height: 1.2rem;" :src="credential.issuer.image" /></span></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 text-secondary">
                            <div class="row my-1 ms-md-5">
                                <div class="col-sm-4">
                                    Date:
                                </div>
                                <div class="col-sm-8 text-sm-end text-start">
                                    <span class="badge text-bg-primary text-white">{{credential.issuanceDate}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="accordion" :id="getCredCompId('acc', credential.id)">
                        <div class="accordion-item">
                            <h2 class="accordion-header" :id="getCredCompId('itemhead', credential.id)">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="getCredCompId('#item', credential.id)" aria-expanded="false" :aria-controls="getCredCompId('item', credential.id)">
                                Details
                            </button>
                            </h2>
                            <div :id="getCredCompId('item', credential.id)" class="accordion-collapse collapse" :aria-labelledby="getCredCompId('itemhead', credential.id)" :data-bs-parent="getCredCompId('#acc', credential.id)">
                            <div class="accordion-body">
                                <ul class="list-group">
                                    <li v-for="(value, key) in credential.credentialSubject" :key="key" class="list-group-item">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <strong>{{key}}</strong>
                                            </div>
                                            <div class="col-md-6">
                                                <span v-if="typeof value === 'object'" class="badge text-bg-primary text-white" 
                                                data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="credential-tooltip" :data-bs-title="Object.entries(value).map(([k, v]) => `<b>${k}:</b> ${v}<br>`).join('')">
                                                    {{value.value || value['@value']}}
                                                </span>
                                                <p class="m-0" v-else>{{value}}</p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer px-3 text-end">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Download">
                        <button @click="downloadCredential(credential)" type="button" class="btn btn-outline-primary"><i class="bi-filetype-json" role="img" aria-label="JSON Download"></i></button>
                        <button data-bs-toggle="modal" :data-bs-target="getCredCompId('#modal', credential.id)" role="button" type="button" class="btn btn-outline-primary"><i class="bi-qr-code" role="img" aria-label="QR-Code"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from "vue-toastification";
import exportFromJSON from "export-from-json";
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/modal'
import { Tooltip } from 'bootstrap'

import QRModal from "./QRModal.vue";
import Passport from "./Passport.vue";

export default {
    name: 'Verify',
    components: {
        QRModal,
        Passport
    },
    data() {
        return {
            toast: useToast(),
            credentials: [],
            credentialId: this.$route.query.credentialId ? decodeURIComponent(this.$route.query.credentialId) : undefined,
            subjectId: this.$route.query.subjectId ? decodeURIComponent(this.$route.query.subjectId) : undefined,
            progress: 0
        }
    },
    mounted() {
        new Tooltip(document.body, {
        selector: '[data-bs-toggle="tooltip"]',
        })     
        this.fetchData()
                .then(() => {
                    this.verify()
                 })
                 .catch((error) => {
                    this.toast.error(`Something went wrong fetching the credential!\n${error}`);
                 }).finally(() => {
                     //Perform action in always
                 });
    },
    computed: {
        getOrderedCredentials() {
            return [...this.credentials].sort((a, b) => {
                let da = new Date(a.issuanceDate),
                    db = new Date(b.issuanceDate);
                return db - da;
            });
        },
        numberVerified() {
            return this.credentials.filter(function(credential) {return credential.verified}).length
        },
        getInfoString() {
            if (this.credentialId) {
                return `${this.progress < this.credentials.length ? 'Verifying' : 'Verified'} single credential <a href="${this.credentialId}" target="_blank">${this.credentialId}</a>`
            }
            else if (this.subjectId) {
                return `Verified ${this.numberVerified}/${this.credentials.length} credential${this.credentials.length == 1 ? '' : 's'} of <a href="${this.subjectId}" target="_blank">${this.subjectId}</a>`
            }
            else if (this.credentials.length > 0) {
                return `Verified ${this.numberVerified}/${this.credentials.length} single credential${this.credentials.length == 1 ? '' : 's'}`
            }
            else return 'Loading credentials ...'
        }
    },
    methods: {
        getPlainCredential(credential) {
            var clean_credential = {...credential};
            delete clean_credential.verified;
            return clean_credential
        },
        downloadCredential(credential) {

            const fileName = this.getCredCompId('credential', credential.id);
            const exportType = 'json';
            exportFromJSON({ data: this.getPlainCredential(credential), fileName, exportType });

        },
        getCredCompId(type, id) {
            return type + '-' + id.substr(id.length - 5, id.length).replace(/^[^a-z]+|[^\w:.-]+/gi, "");
        },
        async fetchData() {

            if (this.credentialId) {
                const res = await this.$api.get(this.credentialId);
                this.credentials.push(res.data);
                return
            }

            if (this.subjectId) {
                const res = await this.$api.get(this.$store.state.VC_REGISTRY + encodeURIComponent(this.subjectId));
                this.credentials = res.data
                return
            }

            if (this.$store.state.credentials.length > 0) {
                this.credentials = this.$store.state.credentials;
                this.$store.dispatch("resetCredentials");
                return
            }

            this.toast.error('No credentials provided!');

        },
        async verify() {

            if (this.credentials.length == 0) {
                this.toast.warning('No credentials provided for verification!');
                return
            }

            try {

                this.progress = 1

                var verifyTasks = Promise.all(this.credentials.map(async function(credential) {

                    const res = await this.$api.post('/vc', [credential]);

                    const verified = res.data[0].verified

                    if (!verified) this.toast.warning(`Verification of ${credential.type[1]} failed!`);

                    this.progress += 1

                    return Object.assign(credential, {verified: verified});

                }.bind(this)));

                // wait for all vcs to be verified
                await verifyTasks;

                if (this.numberVerified == this.credentials.length) this.toast.success('All credentials could be verified!');

                return

            } catch (error) {
                this.toast.error(`Something went wrong verifying the credentials!\n${error.response.data.error || error.response.data || error}`);
            }
           
        }
    }
}
</script>