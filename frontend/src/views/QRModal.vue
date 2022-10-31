<template>
    <div class="modal fade" :id="id" aria-hidden="true" :aria-labelledby="value.type[1]" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5 text-primary" id="exampleModalToggleLabel">{{value.type[1]}}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <qrcode-vue :value="JSON.stringify(value)" :size="300" level="M" class="m-3"/>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary"><i class="bi-download" role="img" aria-label="JSON Download"></i></button>
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