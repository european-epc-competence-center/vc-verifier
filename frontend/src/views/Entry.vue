<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-3 pb-1">
            <h3 class="mb-0 mx-5">Credential Selector</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img" aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/verifier/swagger/"><i class="bi-filetype-doc mx-3" role="img" aria-label="API Docs"></i></a>
            <a href="https://eecc.info"><img id="logo" src="@/assets/img/logo.png"/></a>
        </div>
        <div class="card-body" style="overflow-y: scroll;">
            <p class="m-3">Select the credential/s using one of the options below.</p>
            <!--By json file-->
            <div class="card m-3 p-3 shadow">
                <h5>Credential File</h5>
                <form v-on:submit.prevent="submitFile">
                    <div class="input-group">
                        <button @click="scan='file'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal" class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img" aria-label="QR-Code"></i></button>
                        <input multiple v-on:change="onFileChange" id="credentialId" type="file" class="form-control" placeholder="credential.json" aria-label="Credential" aria-describedby="credentialHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Upload a credential in json format</div>
                </form>
            </div>
            <!--By credential id-->
            <div class="card m-3 p-3 shadow">
                <h5>Credential Id</h5>
                <form v-on:submit.prevent="submitId">
                    <div class="input-group">
                        <button @click="scan='credid'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal" class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img" aria-label="QR-Code"></i></button>
                        <input v-model="credentialId" id="credentialId" type="text" class="form-control" placeholder="https://registry.org/vc/uuid" aria-label="Credential Id" aria-describedby="credentialIdHelp">
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
                        <button @click="scan='subid'" data-bs-toggle="modal" type="button" data-bs-target="#scan-modal" class="btn btn-outline-light scanqr"><i class="bi-qr-code" role="img" aria-label="QR-Code"></i></button>
                        <input v-model="subjectId" id="credentialId" type="text" class="form-control" placeholder="https://gs1.org/123455" aria-label="Subject Id" aria-describedby="subjectIdHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Provide the subject id for which the credentials shall be queried</div>
                </form>
            </div>
            <ScanModal :scan="scan"/>
        </div>
    </div>
</template>
<script>
  import { useToast } from "vue-toastification";
  import ScanModal from "./ScanModal.vue"

  import 'bootstrap/js/dist/modal'

  export default {
  name: 'Entry',
  components: {
    ScanModal
  },
  data() {
    return {
        toast: useToast(),
        credentialId: '',
        subjectId: '',
        scan: ''
    }
  },
  mounted() {
    document.getElementById('scan-modal').addEventListener('hidden.bs.modal', () => { this.scan = '' });
  },
  methods: {
    onFileChange(e) {
        var files = Array.from(e.target.files || e.dataTransfer.files);
        files.forEach( file => {
            if (file.type != 'application/json') this.toast.warning(`Credential '${file.name}'' must be provided as a json file!`);

            new Response(file).json().then(json => {
                // TODO do credential checks
                if (Array.isArray(json)) {
                    this.$store.dispatch("addCredentials", json);
                } else {
                    this.$store.dispatch("addCredential", json);
                }
            }, () => {
                this.toast.warning(`Credential '${file.name}' is not a json file!`);
            })
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
    }
  }
}
</script>