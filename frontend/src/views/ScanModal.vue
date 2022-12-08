<template>
    <div class="modal fade" id="scan-modal" aria-hidden="true" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5 text-primary" id="exampleModalToggleLabel">Scan {{getRequestType()}}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-stream v-if="scan!=''" @init="onInit" @decode="onDecode">
                        <div v-if="!cameraReady" class="spinner-border text-primary m-5" role="status">
                            <span class="visually-hidden">Waiting for camera ...</span>
                        </div>
                    </qrcode-stream>
                    <qrcode-drop-zone @decode="onDecode" class="p-5 mb-3 text-center shadow"><h5>... or drop image here</h5></qrcode-drop-zone>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { QrcodeStream, QrcodeDropZone } from 'vue3-qrcode-reader'
import { useToast } from "vue-toastification";
import { Modal } from 'bootstrap';

export default {
    name: 'ScanModal',
    props: {
        scan: String
    },
    components: {
        QrcodeStream,
        QrcodeDropZone
    },
    data() {
        return {
            toast: useToast(),
            cameraReady: false,
            modal: null
        }
    },
    mounted() {
        this.modal = new Modal(document.getElementById('scan-modal'));
    },
    methods: {
        async onInit (promise) {
            try {
                await promise
                this.cameraReady = true
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    this.toast.error("ERROR: you need to grant camera access permission")
                } else if (error.name === 'NotFoundError') {
                    this.toast.error("ERROR: no camera on this device")
                } else if (error.name === 'NotSupportedError') {
                    this.toast.error("ERROR: secure context required (HTTPS, localhost)")
                } else if (error.name === 'NotReadableError') {
                    this.toast.error("ERROR: is the camera already in use?")
                } else if (error.name === 'OverconstrainedError') {
                    this.toast.error("ERROR: installed cameras are not suitable")
                } else if (error.name === 'StreamApiNotSupportedError') {
                    this.toast.error("ERROR: Stream API is not supported in this browser")
                } else if (error.name === 'InsecureContextError') {
                    this.toast.error('ERROR: Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.')
                } else {
                    this.toast.error(`${error}`);
                }
            }
        },
        onDecode(decodedString) {
            
            try{

                if (this.scan == 'file') {
                    const credential = JSON.parse(decodedString);
                    if (Array.isArray(credential)) {
                        this.$store.dispatch("addCredentials", credential);
                    } else {
                        this.$store.dispatch("addCredential", credential);
                    }

                    this.$router.push({ path: '/verify' })

                } else if (this.scan == 'credid') {

                    this.$router.push({ path: '/verify', query: { credentialId: encodeURIComponent(decodedString) } })

                } else {

                    this.$router.push({ path: '/verify', query: { subjectId: encodeURIComponent(decodedString) } })

                }

                this.modal.hide()
                // modal backdrop does not disappear on hide ....
                document.getElementsByClassName('modal-backdrop').forEach((el) => el.remove());

            } catch (error) {
                this.toast.warning(`Error reading the credential/s!\n${error}`);
            }
        },
        getRequestType() {
            if (this.scan == 'file') return 'Credential';
            if (this.scan == 'credid') return 'Credential Id'
            return 'Subject Id'
        }
    }
}
</script>