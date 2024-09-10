<template>
    <div class="card shadow m-3"
        :class="[getStateColor(credential) != 'success' ? `border-${getStateColor(credential)}` : '']">
        <QRModal :id="getCredCompId('qr-modal')" :value="getPlainCredential(credential)" />
        <DiscloseModal :id="getCredCompId('disclose-modal')" :credential="credential" :requestURL="credential.id" />
        <div class="card-header p-3">
            <div class="row justify-content-between align-items-center">
                <div class="col-8">
                    <h5 class="mb-0 text-primary"><img v-if="isGs1Credential(credential)" class="me-1" style="height: 1.5rem;"
                        src="https://ref.gs1.org/logos/gs1logo.png" /> {{ getCredentialType(credential) }}</h5>
                    <div class="credentialid mt-1"><a :href="credential.id">{{ credential.id }}</a></div>
                </div>
                <div class="col-2 text-end">
                    <a v-if="SDCredential" tabindex="0" style="display: inline-block;" type="button"
                        data-bs-container="body" data-bs-toggle="tooltip" data-bs-html="true"
                        :data-bs-title="'<strong>Selective disclosure credential</strong><br>' + (disclosed ? 'Already disclosed' : 'Go to details to request more disclosure')">
                        <i v-if="disclosed" style="font-size: 1.25rem;" class="bi bi-eye-fill text-primary" role="img"
                            aria-label="SD-Credentials"></i>
                        <i v-else style="font-size: 1.25rem;" class="bi bi-eye-slash-fill text-secondary" role="img"
                            aria-label="SD-Credentials"></i>
                    </a>
                    <a v-if="credential.presentation && credential.presentation.verified != undefined" tabindex="0"
                        style="display: inline-block;" type="button" data-bs-container="body" data-bs-toggle="tooltip"
                        :data-bs-title="'Presentation ' + credential.presentation.status">
                        <i v-if="credential.presentation.verified" style="font-size: 1.25rem;"
                            class="bi bi-card-checklist text-success" role="img" aria-label="Verified"></i>
                        <i v-else-if="credential.presentation.presentationResult" style="font-size: 1.25rem;"
                            class="bi bi-card-checklist text-warning" role="img" aria-label="Partly verified"></i>
                        <i v-else style="font-size: 1.25rem;" class="bi bi-card-checklist text-danger" role="img"
                            aria-label="Unverified"></i>
                    </a>
                    <a tabindex="0" class="ms-1 ms-sm-3" style="display: inline-block;" type="button"
                        data-bs-container="body" data-bs-toggle="tooltip"
                        :data-bs-title="credential.status ? credential.status : 'Verifying...'">
                        <i v-if="credential.verified == true" style="font-size: 1.25rem;"
                            class="bi bi-check-circle-fill text-success" role="img" aria-label="Verified"></i>
                        <i v-else-if="credential.revoked" style="font-size: 1.25rem;"
                            class="bi bi-sign-turn-left text-danger" role="img" aria-label="Revoked"></i>
                        <i v-else-if="credential.suspended" style="font-size: 1.25rem;"
                            class="bi bi-clock-history text-warning" role="img" aria-label="Suspended"></i>
                        <i v-else-if="credential.verified == false" style="font-size: 1.25rem;"
                            class="bi bi-x-circle-fill text-danger" role="img" aria-label="Unverified"></i>
                        <div v-else class="spinner-border text-secondary" role="status"
                            style="width: 1.25rem; height: 1.25rem;">
                            <span class="visually-hidden">Verifying...</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        <div class="card-body p-3">
            <div v-if="credential.presentation && (credential.presentation.holder || credential.presentation.challenge || credential.presentation.domain)"
                class="row justify-content-between mb-3 align-items-center">
                <div class="col-md-6 text-secondary">
                    <div class="row my-md-1 mb-3 me-md-3 align-items-center">
                        <div class="col-sm-4">
                            Holder:
                        </div>
                        <div class="col-sm-8 my-1 my-md-0 text-sm-end text-start">
                            <span v-if="!credential.presentation.holder">-</span>
                            <div v-else-if="typeof credential.presentation.holder == 'string'">
                                <TrimmedBatch :value="credential.presentation.holder" :color="'secondary'" />
                            </div>
                            <div v-else><span class="me-1"><img style="height: 1.8rem;"
                                        :src="credential.presentation.holder.image" /></span><span class="me-3">{{
                                            credential.presentation.holder.name
                                        }}</span>
                                <TrimmedBatch :value="credential.presentation.holder.id" :color="'secondary'" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 text-secondary">
                    <div v-if="credential.presentation.challenge || credential.presentation.domain"
                        class="row my-md-1 mb-3 ms-md-3">
                        <div class="col-sm-4">
                            {{ credential.presentation.challenge ? 'Challange' : 'Domain' }}:
                        </div>
                        <div class="col-sm-8 my-1 my-md-0 text-sm-end text-start">
                            <TrimmedBatch :value="credential.presentation.challenge || credential.presentation.domain"
                                :color="'secondary'" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="row justify-content-between mb-3 align-items-center">
                <div class="col-md-6 text-secondary">
                    <div class="row my-md-1 mb-3 me-md-3 align-items-center">
                        <div class="col-sm-4">
                            Issuer:
                        </div>
                        <div class="col-sm-8 my-1 my-md-0 text-sm-end text-start">
                            <div v-if="typeof credential.issuer == 'string'">
                                <TrimmedBatch :value="credential.issuer" />
                            </div>
                            <div v-else><span class="me-1"><img style="height: 1.8rem;"
                                        :src="credential.issuer.image" /></span><span class="me-3">{{
                                            credential.issuer.name
                                        }}</span>
                                <TrimmedBatch :value="credential.issuer.id" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 text-secondary">
                    <div class="row my-md-1 mb-3 ms-md-3">
                        <div class="col-sm-4">
                            Date:
                        </div>
                        <div class="col-sm-8 my-1 my-md-0 text-sm-end text-start">
                            <span class="badge text-bg-primary text-white">{{ credential.issuanceDate }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="accordion" :id="getCredCompId('acc')">
                <div class="accordion-item">
                    <h2 class="accordion-header" :id="getCredCompId('itemhead')">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            :data-bs-target="getCredCompId('#item')" aria-expanded="false"
                            :aria-controls="getCredCompId('item')">
                            Details
                        </button>
                    </h2>
                    <div :id="getCredCompId('item')" class="accordion-collapse collapse"
                        :aria-labelledby="getCredCompId('itemhead')" :data-bs-parent="getCredCompId('#acc')">
                        <div class="accordion-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped mb-1">
                                    <TransitionGroup name="list" tag="tbody">
                                        <tr v-for="(value, key) in credential.credentialSubject" :key="key">
                                            <td><strong>{{ key }}</strong> <a
                                                    v-if="credential.context && credential.context.get(key)"
                                                    :href="credential.context.get(key)['@id']" tabindex="0"
                                                    style="display: inline-block;" type="button" target="_blank"
                                                    data-bs-container="body" data-bs-toggle="tooltip"
                                                    :data-bs-title="credential.context.get(key)['@id']">
                                                    <small>
                                                        <i class="bi bi-info-circle text-primary"></i>
                                                    </small>
                                                </a>
                                            </td>
                                            <td>
                                                <a v-if="$isURL($getCredentialValue(value))"
                                                    :href="$getCredentialValue(value)">{{
                                                        $getCredentialValue(value)
                                                    }}</a>
                                                <p v-else class="m-0">{{ $getCredentialValue(value) }}</p>
                                            </td>
                                        </tr>
                                    </TransitionGroup>
                                </table>
                                <div v-if="SDCredential" class="row m-3 justify-content-center">
                                    <div class="col-md-6 text-center">
                                        <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                                            :data-bs-target="getCredCompId('#disclose-modal')"><i
                                                class="bi-file-earmark-lock2-fill" role="img" aria-label="PDF Download"></i>
                                            Disclose more</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer px-3 text-end">
            <div class="btn-group btn-group-sm" role="group" aria-label="Download">
                <button @click="downloadCredentialPDF(credential)" type="button" style="border-right: none;"
                    class="btn btn-outline-primary"><i class="bi-filetype-pdf" role="img"
                        aria-label="PDF Download"></i></button>
                <button @click="downloadCredential(credential)" type="button" style="border-right: none;"
                    class="btn btn-outline-primary"><i class="bi-filetype-json" role="img"
                        aria-label="JSON Download"></i></button>
                <button data-bs-toggle="modal" :data-bs-target="getCredCompId('#qr-modal')" role="button" type="button"
                    class="btn btn-outline-primary"><i class="bi-qr-code" role="img" aria-label="QR-Code"></i></button>
            </div>
        </div>
    </div>
</template>

<script>
import exportFromJSON from "export-from-json";
import { Tooltip } from 'bootstrap';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { credentialPDF } from '../pdf.js';
import { getPlainCredential, getCredentialType, isGs1Credential } from '../utils.js';
import * as JsHashes from 'jshashes';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { useToast } from "vue-toastification";
import TrimmedBatch from "@/components/TrimmedBatch.vue";
import QRModal from "@/components/QRModal.vue";
import DiscloseModal from "./DiscloseModal.vue";

export default {
    name: 'Credential',
    props: {
        credential: Object,
    },
    components: {
        TrimmedBatch,
        QRModal,
        DiscloseModal
    },
    data() {
        return {
            toast: useToast(),
            getPlainCredential: getPlainCredential,
            getCredentialType: getCredentialType,
            isGs1Credential: isGs1Credential
        }
    },
    mounted() {
        new Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']"
        })
    },
    computed: {
        SDCredential() {
            const proof = Array.isArray(this.credential.proof) ? this.credential.proof[0] : this.credential.proof;
            return proof.cryptosuite && proof.cryptosuite == 'ecdsa-sd-2023';
        },
        disclosed() {
            return this.$store.state.disclosedCredentials.includes(this.credential.id);
        }
    },
    methods: {
        downloadCredentialPDF(credential) {
            // var win = window.open('', '_blank');
            credentialPDF(credential)
                .then((pdf) => {
                    // return pdfMake.createPdf(pdf).open({}, win);
                    return pdfMake.createPdf(pdf).download(this.getCredCompId('credential') + '.pdf');
                })
                .catch((error) => {
                    this.toast.error(`Something went wrong creating the pdf!\n${error}`);
                }).finally(() => {
                    //Perform action in always
                });
        },
        getStateColor(credential) {
            if (credential.revoked) return 'danger';
            if (credential.suspended) return 'warning';
            if (credential.verified === false) return 'danger';
            return 'success';
        },
        downloadCredential(credential) {

            const fileName = this.getCredCompId('credential');
            const exportType = 'json';
            exportFromJSON({ data: getPlainCredential(credential), fileName, exportType });

        },
        getCredCompId(prefix) {
            const idHash = new JsHashes.SHA256().hex(this.credential.id || JSON.stringify(this.credential.proof));
            return prefix + '-' + idHash.substr(idHash.length - 5, idHash.length);
        }
    }
}
</script>