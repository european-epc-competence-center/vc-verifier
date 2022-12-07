<template>
    <div class="modal fade" :id="id" aria-hidden="true" :aria-labelledby="id" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5 text-primary" id="exampleModalToggleLabel">Scan {{getRequestType()}}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-stream @decode="onDecode"></qrcode-stream>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { QrcodeStream } from 'vue3-qrcode-reader'
import { useToast } from "vue-toastification";

export default {
    name: 'ScanModal',
    props: {
        id: String,
        request: String
    },
    components: {
        QrcodeStream
    },
    data() {
        return {
            toast: useToast()
        }
    },
    methods: {
        onDecode(decodedString) {
            try{
                if (this.request == 'file') {
                    const credential = JSON.parse(decodedString);
                    if (Array.isArray(credential)) {
                        this.$store.dispatch("addCredentials", credential);
                    } else {
                        this.$store.dispatch("addCredential", credential);
                    }
                    this.$router.push({ path: '/verify' })
                }
            } catch (error) {
                this.toast.warning(`Error readin the credential/s!\n${error}`);
            }
        },
        getRequestType() {
            if (this.request == 'file') return 'Credential';
            if (this.request == 'credentialid') return 'Credential Id'
            return 'Subject Id'
        }
    }
}
</script>