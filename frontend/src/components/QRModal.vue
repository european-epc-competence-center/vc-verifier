<template>
    <div class="modal fade" :id="id" aria-hidden="true" :aria-labelledby="value.type[1]" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5 text-primary">{{ value.type[1] }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-vue v-if="qrSize > 0" :value="qrValue" :margin="1"
                        :size="qrSize" level="M" class="m-3" :id="'canvas-' + id" />
                    <h5 v-else class="text-danger">Credential too large for display!</h5>
                </div>
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-outline-primary" @click="downloadQR()"><i class="bi-download"
                            role="img" aria-label="QR Download"></i> Download QR-Code</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
import { getJWTMetadata } from '../utils.js'

export default {
    name: 'QRModal',
    props: {
        id: String,
        value: Object
    },
    components: {
        QrcodeVue
    },
    computed: {
        qrValue() {
            // Check if this is a JWT credential using our metadata system
            const jwtMetadata = getJWTMetadata(this.value.id);
            if (jwtMetadata && jwtMetadata.isJWTCredential) {
                // Use the original JWT for QR code
                return jwtMetadata.originalJWT;
            }
            // Use JSON stringified credential for regular credentials
            return JSON.stringify(this.value);
        },
        qrSize() {
            // Check size limit for display - JWT tokens are typically longer than JSON
            return this.qrValue.length < 2334 ? 300 : 0;
        }
    },
    data() {
        return {

        }
    },
    methods: {
        downloadQR() {
            var link = document.createElement('a');
            link.download = 'credential' + this.id.substring(5) + '.png';
            link.href = document.getElementById('canvas-' + this.id).toDataURL('image/png')
            link.click();
        }
    }
}
</script>