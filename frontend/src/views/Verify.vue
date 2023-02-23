<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-3 pb-1">
            <router-link to="/"><i id="backbutton" style="font-size: 2rem;" class="bi-arrow-left-square-fill mx-3 my-1"
                    role="img" aria-label="API Docs"></i></router-link>
            <h3 class="mb-0 mx-5">Verifiable Credential Verifier</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img"
                    aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/verifier/swagger/"><i class="bi-filetype-doc mx-3" role="img"
                    aria-label="API Docs"></i></a>
            <a href="https://id.eecc.de"><img id="logo" src="@/assets/img/logo.png" /></a>
        </div>
        <div class="card-body p-3" style="overflow-y: scroll;">
            <div class="alert alert-primary m-3 mb-5 text-center" role="alert">
                <p class="m-0" v-html="getInfoString"></p>
                <Transition name="fade">
                    <div v-if="progress < verifiables.length + 1" class="text-center px-5 mt-3">
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped" role="progressbar"
                                aria-label="Verification progress"
                                :style="'width: ' + progress / (verifiables.length + 1) * 100 + '%;'"
                                :aria-valuenow="progress" aria-valuemin="0" :aria-valuemax="verifiables.length + 1">
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
            <Passport :credentials="credentials" />
            <h5 v-if="!credentialId" class="mx-3 px-3">Included Credentials</h5>
            <Credential v-for="credential in getOrderedCredentials" :credential="credential" :key="credential.id" />
        </div>
    </div>
</template>

<script>
import { useToast } from "vue-toastification";
import { Tooltip } from 'bootstrap';
import { getVerifiableType, VerifiableType, getContext } from '../utils.js';


import Passport from "@/components/Passport.vue";
import Credential from "@/components/Credential.vue";

export default {
    name: 'Verify',
    components: {
        Passport,
        Credential
    },
    data() {
        return {
            toast: useToast(),
            verifiables: [],
            credentials: [],
            credentialId: this.$route.query.credentialId ? decodeURIComponent(this.$route.query.credentialId) : undefined,
            subjectId: this.$route.query.subjectId ? decodeURIComponent(this.$route.query.subjectId) : undefined,
            progress: 0,
            getContext: getContext
        }
    },
    mounted() {

        new Tooltip(document.body, {
            selector: "[data-bs-toggle='tooltip']"
        })

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
        getOrderedCredentials() {
            return [...this.credentials].sort((a, b) => {
                let da = new Date(a.issuanceDate),
                    db = new Date(b.issuanceDate);
                return db - da;
            });
        },
        numberVerified() {
            return this.verifiables.filter(function (verifiable) { return verifiable.verified }).length
        },
        getInfoString() {
            if (this.credentialId) {
                return `${this.progress < this.credentials.length ? 'Verifying' : 'Verified'} single credential <a href="${this.credentialId}" target="_blank">${this.credentialId}</a>`
            }
            else if (this.subjectId) {
                return `Verified ${this.numberVerified}/${this.credentials.length} credential${this.credentials.length == 1 ? '' : 's'} of <a href="${this.subjectId}" target="_blank">${this.subjectId}</a>`
            }
            else if (this.verifiables.length > 0 && this.verifiables.some((verifiable => getVerifiableType(verifiable) == VerifiableType.PRESENTATION))) {
                return `Verified ${this.numberVerified}/${this.verifiables.length} presentations${this.verifiables.length == 1 ? '' : 's'} with ${this.credentials.length} credential${this.credentials.length == 1 ? '' : 's'}`
            }
            else if (this.credentials.length > 0) {
                return `Verified${this.credentials.length > 1 ? ' ' + this.numberVerified + '/' + this.credentials.length : ''} single credential${this.credentials.length == 1 ? '' : 's'}`
            }
            else return 'Loading credentials ...'
        }
    },
    methods: {
        addCredential(credential) {
            this.credentials.push(credential);
            this.getContext(credential)
                .then(context => {
                    credential.context = context;
                })
                .catch(() => { })
        },
        async fetchData() {

            if (this.credentialId) {
                const res = await this.$api.get(this.credentialId);
                this.verifiables.push(res.data);
                return
            }

            if (this.subjectId) {
                const res = await this.$api.get(this.$store.state.VC_REGISTRY + encodeURIComponent(this.subjectId));
                this.verifiables = res.data
                return
            }

            if (this.$store.state.verifiables.length > 0) {
                this.verifiables = this.$store.state.verifiables;
                this.$store.dispatch("resetVerifiables");
                return
            }

            this.toast.error('No credentials provided!');
            return;

        },
        assignResult(credentialId, result, presentation) {

            var credentialResult = { verified: result.verified, presentation: presentation };

            var credential = this.credentials.find(credential => credential.id == credentialId)

            if (!result.verified) {

                var message;

                if (result.statusResult && !result.statusResult.verified) {

                    credentialResult.revoked = true;

                    message = 'Credential revoked!';

                }

                if (result.error) {

                    message = 'Credential\n' + result.error.name + ': ';

                    if (result.error.errors) result.error.errors.forEach((e) => {

                        message += e.message + '\n';

                    })

                }

                credentialResult.status = message;

                if (credentialResult.revoked) this.toast.warning(`${credential.type[1] || credential.type[0]} is revoked!`);
                else this.toast.error(`Verification of ${credential.type[1] || credential.type[0]} failed!\n${message}`);

            } else {
                credentialResult.status = 'Credential verified!';
            }

            Object.assign(credential, credentialResult);

        },
        async verify() {

            if (this.verifiables.length == 0) {
                this.toast.warning('No verifiables provided for verification!');
                return
            }

            try {

                this.progress = 1

                // forEach throws 'cannot convert undefined to object' error
                const verifyTasks = Promise.all(this.verifiables.map(async (verifiable) => {

                    if (getVerifiableType(verifiable) == VerifiableType.PRESENTATION) {

                        const presentation = {
                            holder: verifiable.holder,
                            challenge: verifiable.proof.challenge,
                            domain: verifiable.proof.domain
                        }

                        if (Array.isArray(verifiable.verifiableCredential)) this.credentials = this.credentials.concat(verifiable.verifiableCredential.map((credential) => { return { ...credential, presentation } }));
                        else this.addCredential({ ...verifiable.verifiableCredential, presentation });

                    } else {
                        this.addCredential(verifiable);
                    }

                    const res = await this.$api.post('/', [verifiable]);

                    const result = res.data[0];

                    // verifiable is a presentations
                    if (getVerifiableType(verifiable) == VerifiableType.PRESENTATION) {

                        // build presentation object with important properties for attaching to the credential
                        var presentation = {
                            verified: result.verified,
                            presentationResult: result.presentationResult.verified,
                            holder: verifiable.holder,
                            challenge: verifiable.proof.challenge,
                            domain: verifiable.proof.domain,
                            status: 'verified!'
                        }

                        if (presentation.presentationResult && !presentation.verified) {
                            presentation.status = 'partially verified!'
                            this.toast.warning(`Presentation${presentation.holder ? ' of holder ' + presentation.holder.id || presentation.holder + ' ' : ' '}contains invalid credentials!`);
                        }

                        if (result.error) {

                            presentation.status = result.error.name + ': ';

                            if (result.error.errors) result.error.errors.forEach((e) => {

                                presentation.status += e.message + '\n';

                            })

                            this.toast.error(`Verification of presentation${presentation.holder ? ' of holder ' + presentation.holder.id || presentation.holder + ' ' : ' '} failed!\n${presentation.status}`);

                        }

                        // contains array of credentials
                        if (Array.isArray(verifiable.verifiableCredential))
                            verifiable.verifiableCredential.forEach(
                                credential => this.assignResult(
                                    credential.id,
                                    result.credentialResults.find(credRes => credRes.credentialId == credential.id),
                                    presentation
                                ));

                        // contains single credential object
                        else this.assignResult(verifiable.verifiableCredential.id, result[0], presentation);

                    }

                    else this.assignResult(verifiable.id, result)

                    verifiable.verified = result.verified;

                    this.progress += 1

                }));

                // wait for all vcs to be verified
                await verifyTasks;

                if (this.numberVerified == this.credentials.length) this.toast.success('All credentials could be verified!');

                return

            } catch (error) {
                this.toast.error(`Something went wrong verifying the credentials!\n${error}`);
            }

        }
    }
}
</script>