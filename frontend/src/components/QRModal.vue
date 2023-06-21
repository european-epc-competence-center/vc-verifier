<template>
    <div class="modal fade" :id="id" aria-hidden="true" :aria-labelledby="value.type[1]" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5 text-primary">{{ value.type[1] }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-vue v-if="JSON.stringify(value).length < 2334" :value="JSON.stringify(value)" :margin="1"
                        :size="300" level="M" class="m-3" :id="'canvas-' + id" />
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

export default {
    name: 'QRModal',
    props: {
        id: String,
        value: Object
    },
    components: {
        QrcodeVue
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