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
        <div class="card-body" >
            <div class="row mx-md-3">
                <div class="col-12">
                    <p>Define which credentials you want to have presented</p>
                </div>
            </div>
            <div class="row mx-md-3">
                <div class="col-md-4">

                    <input type="radio" class="btn-check" name="options-credentials" id="any-credential-outlined"
                        autocomplete="off" checked value="any" v-model="selectedCredential">
                    <label class="btn btn-outline-primary" for="any-credential-outlined">Any Credential</label>

                    <input type="radio" class="btn-check" name="options-credentials" id="custom-credential-outlined"
                        autocomplete="off" value="custom" v-model="selectedCredential">
                    <label class="btn btn-outline-primary" for="custom-credential-outlined">Custom Credential</label>

                </div>
            </div>
            <div v-if="selectedCredential === 'custom'">
                <div class="row mx-md-3" v-for="(l, i) in customCredentialTypes" :key="i">
                    <div class="col-6">
                        <input v-model="customCredentialTypes[i]" type="text" class="form-control"
                            placeholder="CustomCredentialType" aria-label="credentialType">
                    </div>
                    <div class="col-1" v-if="i === customCredentialTypes.length - 1">
                        <button class="btn btn-outline-success" @click="customCredentialTypes.push('')">
                            <i class="bi bi-plus-circle"></i>
                        </button>
                    </div>
                    <div class="col-1">
                        <button class="btn btn-outline-danger" @click="customCredentialTypes.splice(i, 1)">
                            <i class="bi bi-dash-circle"></i>
                        </button>
                    </div>
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
            customCredentialTypes: [""],
            customChangeTimeout: undefined
        }
    },
    components: {
        PresentationRequest
    }
}
</script>