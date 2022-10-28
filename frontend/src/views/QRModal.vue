<template>
    <div class="modal fade" :id="id" aria-hidden="true" :aria-labelledby="value.type[1]" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalToggleLabel">Modal 1</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <qrcode-vue :value="JSON.stringify(value)" :size="500" level="H" />
                </div>
                <div class="modal-footer">
                    Footer
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
}
</script>