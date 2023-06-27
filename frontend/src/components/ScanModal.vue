<template>
    <div class="modal" id="scan-modal" aria-hidden="true" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalToggleLabel">Scan {{getRequestType()}}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-stream v-if="scan!='' && !cameraFailed && !showDragDrop" @init="onInit" @decode="onDecode" :camera="camera">
                        <div v-if="!cameraReady" class="spinner-border text-primary m-5" role="status">
                            <span class="visually-hidden">Waiting for camera ...</span>
                        </div>
                    </qrcode-stream>
                    <qrcode-drop-zone v-if="showDragDrop" @dragover="onDragOver" @detect="onDetect" class="text-center shadow">
                        <div class="drop-area align-content-center text-primary" :class="{ 'dragover': dragover }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-file-earmark-image mx-auto mb-3" viewBox="0 0 16 16">
                                <path d="M6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                <path d="M14 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5V14zM4 1a1 1 0 0 0-1 1v10l2.224-2.224a.5.5 0 0 1 .61-.075L8 11l2.157-3.02a.5.5 0 0 1 .76-.063L13 10V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4z"/>
                            </svg>
                            DROP IMAGES HERE
                        </div>
                    </qrcode-drop-zone>
                    <div v-if="!cameraFailed">
                        <button v-if="showDragDrop" @click="showDragDrop=false" class="btn btn-outline-primary mt-3">Scan <i class="bi bi-file-earmark-image"></i></button>
                        <button v-else @click="showDragDrop=true" class="btn btn-outline-primary mt-3">Upload <i class="bi bi-file-earmark-image"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { QrcodeStream, QrcodeDropZone } from "vue3-qrcode-reader";
import { useToast } from "vue-toastification";
import { Modal } from "bootstrap";

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
            dragover: false,
            showDragDrop: false,
            cameraFailed: false
        }
    },
    computed: {
        camera() {
            if(this.scan == '') return ''
            return 'auto'
        }
    },
    methods: {
        onDragOver (isDraggingOver) {
            this.dragover = isDraggingOver
        },
        async onInit (promise) {
            try {
                await promise

            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    this.toast.warning("You need to grant camera access permission")
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
                this.cameraFailed = true
                this.showDragDrop = true
            } finally {
                this.cameraReady = true
            }
        },
        async onDetect (promise) {
            try {
                const { content } = await promise

                this.onDecode(content)

            } catch (error) {
                if (error.name === 'DropImageFetchError') {
                    this.toast.error('Sorry, you can\'t load cross-origin images :/')
                } else if (error.name === 'DropImageDecodeError') {
                    this.toast.error(this.error = 'Ok, that\'s not an image. That can\'t be decoded.')
                } else {
                    this.toast.error(this.error = 'Ups, what kind of error is this?! ' + error.message)
                }
            }
        },
        onDecode(decodedString) {

            try{

                if (decodedString.length > 0) {

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

                    // hide modal after scan
                    Modal.getInstance('#scan-modal').hide();

                }
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