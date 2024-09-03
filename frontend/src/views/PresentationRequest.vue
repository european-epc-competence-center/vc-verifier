<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-1 p-md-3 pb-1">
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
                    
                    <input type="radio" class="btn-check" name="options-credentials" id="any-credential-outlined" autocomplete="off" checked 
                        value="any" v-model="selectedCredential">
                    <label class="btn btn-outline-primary" for="any-credential-outlined">Any Credential</label>

                    <input type="radio" class="btn-check" name="options-credentials" id="custom-credential-outlined" autocomplete="off" 
                        value="custom" v-model="selectedCredential">
                    <label class="btn btn-outline-primary" for="custom-credential-outlined">Custom Credential</label>

                    <input v-if="selectedCredential === 'custom'" v-model="customCredentialType" id="credentialType" type="text" class="form-control" 
                        placeholder="CustomCredential" aria-label="credentialType">

                    <!-- <input v-if="enableCustomCredentialType" v-model="custom-credential-outlined" id="credentialType" type="text"
                        class="form-control" placeholder="CustomCredential" aria-label="credentialType"> -->
                    <!-- <input v-if="enableCustomCredentialType" v-model="customCredentialType" id="credentialType" type="text"
                        class="form-control" placeholder="CustomCredential" aria-label="credentialType">
                    <select v-else v-model="credentialType" id="credentialType" class="form-select"
                        aria-label="Credential Type">
                        <option selected :value="undefined">All</option>
                        <option value="ProductPassportCredential">Product Passport Credential</option>
                    </select> -->
                    <label for="credentialType" class="form-label text-muted ms-1">
                        <div class="form-check form-switch">
                            <input v-model="enableCustomCredentialType" class="form-check-input" type="checkbox"
                                id="customCredentialTypeSwitch">
                            <label class="form-check-label" for="customCredentialTypeSwitch"><small>Custom credential
                                    type</small></label>
                        </div>
                    </label>
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
            selectedCredential: 'any',
            // credentialType: undefined,
            customCredentialTypes: [""],
            enableCustomCredentialType: false,
            customChangeTimeout: undefined
        }
    },
    components: {
        PresentationRequest
    },
    watch: {
        customCredentialType() {
            this.setCustomCredentialType();
        },
        enableCustomCredentialType(newValue) {
            if (newValue && this.customCredentialType) this.credentialType = this.customCredentialType;
            else this.credentialType = undefined;
        }
    },
    methods: {
        setCustomCredentialType() {
            if (this.customChangeTimeout) clearTimeout(this.customChangeTimeout);
            this.customChangeTimeout = setTimeout(() => this.credentialType = this.customCredentialType, 500);
        }
    }
}
</script>