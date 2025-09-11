<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-1 p-md-3 pb-1">
            <h3 class="mb-0 mx-5">Credential Selector</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img"
                    aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/verifier/swagger/"><i class="bi-filetype-doc mx-3" role="img"
                    aria-label="API Docs"></i></a>
            <a href="https://id.eecc.de"><img id="logo" src="@/assets/img/logo.png" /></a>
        </div>
        <div class="card-body p-1 p-md-3" style="overflow-y: scroll;">
            <div class="row m-3">
                <div class="col-9">
                    <p class="mb-0">Select the credential/s using one of the options below or send a presentation request.
                    </p>
                </div>
                <div class="col-3 text-end">
                    <button data-bs-toggle="modal" type="button" data-bs-target="#auth-modal"
                        class="btn btn-outline-primary ms-1 mt-1"><i class="bi-person-vcard-fill" data-bs-container="body"
                            data-bs-toggle="tooltip" data-bs-title="Authenticate"></i></button>
                    <router-link :to="{ path: 'request' }" class="btn btn-outline-primary ms-1 mt-1" type="button"><i
                            class="bi-send-check-fill" role="img" aria-label="Presentation request"></i>
                    </router-link>
                </div>
            </div>
            <!--By json file-->
            <div class="card m-3 p-3 shadow">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">Credential/Presentation Upload</h5>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="inputModeSwitch" v-model="useTextInput">
                        <label class="form-check-label" for="inputModeSwitch">
                            {{ useTextInput ? 'Text Input' : 'File Upload' }}
                        </label>
                    </div>
                </div>
                
                <!-- File Upload Mode -->
                <form v-if="!useTextInput" v-on:submit.prevent="submitFile">
                    <div class="input-group">
                        <button @click="scan = 'file'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal"
                            class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img"
                                aria-label="QR-Code"></i></button>
                        <input multiple v-on:change="onFileChange" id="credentialFiles" type="file" class="form-control"
                            placeholder="credential.json" aria-label="Credential" aria-describedby="credentialHelp"
                            accept=".json,.txt">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Upload credentials or presentations in JSON format, or JWT tokens in TXT files</div>
                </form>
                
                <!-- Text Input Mode -->
                <form v-if="useTextInput" v-on:submit.prevent="submitText">
                    <div class="input-group">
                        <button @click="scan = 'file'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal"
                            class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img"
                                aria-label="QR-Code"></i></button>
                        <textarea v-model="textInput" id="credentialText" class="form-control" rows="4"
                            placeholder="Paste JWT token or JSON-LD credential/presentation here..." 
                            aria-label="Credential Text" aria-describedby="credentialTextHelp"></textarea>
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Paste JWT tokens or JSON-LD credentials/presentations as plain text</div>
                </form>
            </div>
            <!--By credential id-->
            <div class="card m-3 p-3 shadow">
                <h5>Credential Id</h5>
                <form v-on:submit.prevent="submitId">
                    <div class="input-group">
                        <button @click="scan = 'credid'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal"
                            class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img"
                                aria-label="QR-Code"></i></button>
                        <input v-model="credentialId" id="credentialId" type="text" class="form-control"
                            placeholder="https://registry.org/vc/uuid" aria-label="Credential Id"
                            aria-describedby="credentialIdHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Provide the credential's id</div>
                </form>
            </div>
            <!--By subject id-->
            <div class="card m-3 p-3 shadow">
                <h5>Subject Id</h5>
                <form v-on:submit.prevent="submitSubject">
                    <div class="input-group">
                        <button @click="scan = 'subid'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal"
                            class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img"
                                aria-label="QR-Code"></i></button>
                        <input v-model="subjectId" id="credentialId" type="text" class="form-control"
                            placeholder="https://gs1.org/123455" aria-label="Subject Id" aria-describedby="subjectIdHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Provide the subject id for which the credentials shall be queried</div>
                </form>
            </div>
            <AuthModal id="auth-modal" />
            <ScanModal :scan="scan" />
        </div>
    </div>
</template>
<script>
import { Tooltip } from "bootstrap";
import { useToast } from "vue-toastification";
import { isJWT } from "@/utils.js";

import AuthModal from "@/components/AuthModal.vue";
import ScanModal from "@/components/ScanModal.vue"


export default {
    name: 'Entry',
    components: {
        AuthModal,
        ScanModal
    },
    data() {
        return {
            toast: useToast(),
            credentialId: '',
            subjectId: '',
            scan: '',
            useTextInput: false,
            textInput: ''
        }
    },
    mounted() {
        new Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']",
            trigger: 'hover'
        })
        document.getElementById('scan-modal').addEventListener('hidden.bs.modal', () => { this.scan = '' });
    },
    methods: {
        onFileChange(e) {
            var files = Array.from(e.target.files || e.dataTransfer.files);
            files.forEach(file => {
                const isJsonFile = file.type === 'application/json' || file.name.endsWith('.json');
                const isTxtFile = file.type === 'text/plain' || file.name.endsWith('.txt');
                
                if (!isJsonFile && !isTxtFile) {
                    this.toast.warning(`Credential '${file.name}' must be provided as a JSON or TXT file!`);
                    return;
                }

                // Handle TXT files (potentially containing JWTs)
                if (isTxtFile) {
                    new Response(file).text().then(jwtText => {
                        const trimmedJwt = jwtText.trim();
                        if (isJWT(trimmedJwt)) {
                            this.$store.dispatch("addVerifiables", [trimmedJwt]);
                        } else {
                            this.toast.warning(`'${file.name}' does not contain a valid JWT token!`);
                        }
                    }, () => {
                        this.toast.warning(`Could not read '${file.name}' as text!`);
                    });
                } else {
                    // Handle JSON files
                    new Response(file).json().then(json => {
                        this.$store.dispatch("addVerifiables", Array.isArray(json) ? json : [json]);
                    }, () => {
                        this.toast.warning(`'${file.name}' is not a valid JSON file!`);
                    });
                }
            })
        },
        submitFile() {
            this.$router.push({ path: '/verify' })
        },
        submitId() {
            this.$router.push({ path: '/verify', query: { credentialId: encodeURIComponent(this.credentialId) } })
        },
        submitSubject() {
            this.$router.push({ path: '/verify', query: { subjectId: encodeURIComponent(this.subjectId) } })
        },
        submitText() {
            if (!this.textInput.trim()) {
                this.toast.warning('Please enter some text to verify!');
                return;
            }

            const trimmedInput = this.textInput.trim();
            
            // Check if it's a JWT
            if (isJWT(trimmedInput)) {
                this.$store.dispatch("addVerifiables", [trimmedInput]);
                this.$router.push({ path: '/verify' });
                return;
            }

            // Try to parse as JSON
            try {
                const json = JSON.parse(trimmedInput);
                this.$store.dispatch("addVerifiables", Array.isArray(json) ? json : [json]);
                this.$router.push({ path: '/verify' });
            } catch (error) {
                this.toast.warning('Input is neither a valid JWT nor valid JSON!');
            }
        }
    }
}
</script>