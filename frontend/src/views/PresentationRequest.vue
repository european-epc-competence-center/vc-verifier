<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-3 pb-1">
            <router-link to="/"><i id="backbutton" style="font-size: 2rem;" class="bi-arrow-left-square-fill mx-3 my-1"
                    role="img" aria-label="API Docs"></i></router-link>
            <h3 class="mb-0 mx-5">Presentation Request</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img"
                    aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/openid/swagger/"><i class="bi-filetype-doc mx-3" role="img"
                    aria-label="API Docs"></i></a>
            <a href="https://id.eecc.de"><img id="logo" src="@/assets/img/logo.png" /></a>
        </div>
        <div class="card-body" style="overflow-y: scroll;">
            <div class="row mx-md-3">
                <div class="col-12">
                    <p>Define which credentials you want to have presented</p>
                </div>
            </div>
            <div class="row mx-md-3">
                <div class="col-md-4">
                    <select v-model="credentialType" id="credentialType" class="form-select" aria-label="Credential Type">
                        <option selected :value="undefined">All</option>
                        <option value="ProductPassportCredential">Product Passport Credential</option>
                        <option value="GS1GLNCredential">GS1 GLN Credential</option>
                    </select>
                    <label for="credentialType" class="form-label text-muted ms-1"><small>Credential type</small></label>
                </div>
            </div>
            <PresentationRequest :credentialType="credentialType" />
        </div>
    </div>
</template>
<script>
import PresentationRequest from '@/components/PresentationRequest.vue';

export default {
    name: 'PresentationRequestView',
    data() {
        return {
            credentialType: undefined,
        }
    },
    components: {
        PresentationRequest
    },
    methods: {

    }
}
</script>