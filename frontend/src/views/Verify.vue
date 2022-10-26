<template>
    <div class="card m-auto shadow" style="min-width: 80%">
        <div class="card-header text-center p-3">
            <h3>Credential Verifier</h3>
            <a href="https://eecc.info"><img id="logo" src="/logo.png"/></a>
        </div>
        <div class="card-body p-3">
            <div v-if="credentialId" class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0">Verifying single credential <a :href="credentialId" target="_blank">{{credentialId}}</a></p>
            </div>
            <div v-for="credential in credentials" :key="credential.id" class="card shadow m-3">
                <div class="card-header p-3">
                    <div class="row justify-content-between align-items-center">
                        <div class="col-md-6">
                            <h5 class="mb-0 text-primary">{{credential.type[1]}}</h5>
                        </div>
                        <div class="col-md-6 text-end">
                            <i v-if="credential.verified==true" style="font-size: 1.25rem;" class="bi bi-check-circle-fill text-success" role="img" aria-label="Verified"></i>
                            <i v-else-if="credential.verified==false" style="font-size: 1.25rem;" class="bi bi-x-circle-fill text-danger" role="img" aria-label="Unverified"></i>
                            <div v-else class="spinner-border text-secondary" role="status" style="width: 1.25rem; height: 1.25rem;">
                                <span class="visually-hidden">Verifying...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-3">
                    <div class="row justify-content-between mb-3">
                        <div class="col-md-6 text-secondary">
                            Issuer: <span class="badge text-bg-primary text-white">{{credential.issuer}}</span>
                        </div>
                        <div class="col-md-6 text-end text-secondary">
                            Date: <span class="badge text-bg-primary text-white">{{credential.issuanceDate}}</span>
                        </div>
                    </div>
                    <div class="accordion" :id="getCredCompId('acc', credential.id)">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="getCredCompId('#item', credential.id)" aria-expanded="true" :aria-controls="getCredCompId('item', credential.id)">
                                Details
                            </button>
                            </h2>
                            <div :id="getCredCompId('item', credential.id)" class="accordion-collapse collapse" aria-labelledby="headingOne" :data-bs-parent="getCredCompId('#acc', credential.id)">
                            <div class="accordion-body">
                                <ul class="list-group">
                                    <li v-for="(value, key) in credential.credentialSubject" :key="key" class="list-group-item">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <strong>{{key}}</strong>
                                            </div>
                                            <div class="col-md-6">
                                                {{value}}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from "vue-toastification";
import 'bootstrap/js/dist/collapse'
export default {
    name: 'Verify',
    components: {

    },
    data() {
    return {
        toast: useToast(),
        credentials: [],
        credentialId: decodeURIComponent(this.$route.query.credentialId)
    }
    },
    mounted() {
        this.fetchData()
                .then(() => {
                    this.verify()
                 })
                 .catch((error) => {
                    this.toast.error(`Something went wrong fetching the credential!\n${error}`);
                 }).finally(() => {
                     //Perform action in always
                 });
    },
    methods: {
        getCredCompId(type, id) {
            return type + '-' + id.substr(id.length - 5, id.length)
        },
        async fetchData() {

            if (this.$route.query.credentialId) {
                const res = await fetch(this.credentialId);
                this.credentials.push(await res.json())
            }

        },
        async verify() {

            try {

                // verifies all at once -> TODO make verification sequential Promise.all()
                const res = await this.$api.post('/vc', this.credentials)

                for (const [i, value] of res.data.entries()) {
                    this.credentials[i]['verified'] = value.verified
                }

                this.toast.success('All credentials could be verified!');

            } catch (error) {
                this.toast.error(`Something went wrong verifying the credentials!\n${error}`);
            }
           
        }
    }
}
</script>