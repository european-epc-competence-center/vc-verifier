<template>
    <div class="card m-auto shadow" style="min-width: 80%; height: 90vh; overflow-y: scroll;">
        <div class="card-header text-center p-3">
            <h3>Verifiable Credential Verifier</h3>
            <a href="https://eecc.info"><img id="logo" src="./logo.png"/></a>
        </div>
        <div class="card-body p-3">
            <div v-if="credentialId" class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0">{{getVerifyString}} single credential <a :href="credentialId" target="_blank">{{credentialId}}</a> {{verified ? '' : '...'}}</p>
            </div>
            <div v-else-if="subjectId" class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0">{{getVerifyString}} {{credentials.length}} credential{{credentials.length == 1 ? '' : 's'}} of <a :href="subjectId" target="_blank">{{subjectId}}</a> {{verified ? '' : '...'}}</p>
            </div>
            <div v-else class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0">{{getVerifyString}} {{credentials.length}} single credential{{credentials.length == 1 ? '' : 's'}} {{verified ? '' : '...'}}</p>
            </div>
            <div v-if="subjectId && Object.keys(verifiedProperties).length > 0" class="card border-success m-3 mb-5">
                <div class="card-header text-success p-3">
                    <h5>Merged verified properties</h5>
                </div>
                <div class="card-body p-3">
                    <ul class="list-group">
                        <li v-for="(value, key) in verifiedProperties" :key="key" class="list-group-item">
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
            <h5 v-if="!credentialId" class="mx-3">Included Credentials</h5>
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
                            <h2 class="accordion-header" :id="getCredCompId('itemhead', credential.id)">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="getCredCompId('#item', credential.id)" aria-expanded="false" :aria-controls="getCredCompId('item', credential.id)">
                                Details
                            </button>
                            </h2>
                            <div :id="getCredCompId('item', credential.id)" class="accordion-collapse collapse" :aria-labelledby="getCredCompId('itemhead', credential.id)" :data-bs-parent="getCredCompId('#acc', credential.id)">
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
            credentialId: this.$route.query.credentialId ? decodeURIComponent(this.$route.query.credentialId) : undefined,
            subjectId: this.$route.query.subjectId ? decodeURIComponent(this.$route.query.subjectId) : undefined,
            verified: false
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
    computed: {
        verifiedProperties() {
            var verifiedProps = {};
            this.credentials.forEach( credential => {
                if (credential.verified) {
                    verifiedProps = Object.assign(verifiedProps, credential.credentialSubject)
                }
            });
            return verifiedProps
        },
        getVerifyString() {
            return this.verified ? 'Verified' : 'Verifying'
        }
    },
    methods: {
        getCredCompId(type, id) {
            return type + '-' + id.substr(id.length - 5, id.length)
        },
        async fetchData() {

            if (this.credentialId) {
                const res = await fetch(this.credentialId);
                this.credentials.push(await res.json());
                return
            }

            if (this.subjectId) {
                const res = await fetch(this.$store.state.VC_REGISTRY + encodeURIComponent(this.subjectId));
                this.credentials = await res.json();
                return
            }

            if (this.$store.state.credentials.length > 0) {
                this.credentials = this.$store.state.credentials;
                return
            }

            this.toast.error('No credentials provided!');

        },
        async verify() {

            try {

                // verifies all at once -> TODO make verification sequential Promise.all()
                const res = await this.$api.post('/vc', this.credentials)

                var all_verified = true

                for (const [i, value] of res.data.entries()) {
                    this.credentials[i]['verified'] = value.verified

                    if (!value.verified) {
                        this.toast.warning(`Verification of ${this.credentials[i].type[1]} failed!`);
                        all_verified = false
                    }
                }

                if (all_verified) this.toast.success('All credentials could be verified!');

                this.verified = true

            } catch (error) {
                this.toast.error(`Something went wrong verifying the credentials!\n${error}`);
            }
           
        }
    }
}
</script>