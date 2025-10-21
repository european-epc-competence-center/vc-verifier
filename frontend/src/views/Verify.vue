<template>
    <div id="maincard" class="card m-md-auto shadow">
        <div class="card-header text-center p-1 p-md-3 pb-1">
            <router-link to="/"><i id="backbutton" style="font-size: 2rem;" class="bi-arrow-left-square-fill mx-3 my-1"
                    role="img" aria-label="API Docs"></i></router-link>
            <h3 class="mb-0 mx-5">Verifiable Credential Verifier</h3>
            <a href="https://github.com/european-epc-competence-center/vc-verifier"><i class="bi-github mx-3" role="img"
                    aria-label="GitHub"></i></a>
            <a href="https://ssi.eecc.de/api/verifier/swagger/"><i class="bi-filetype-doc mx-3" role="img"
                    aria-label="API Docs"></i></a>
            <a href="https://id.eecc.de"><img id="logo" src="@/assets/img/logo.png" /></a>
        </div>
        <div class="card-body p-1 p-md-3" style="overflow-y: scroll;">
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
import { Tooltip } from "bootstrap";
import { getVerifiableType, VerifiableType, getContext, getHolder, isGs1Credential, isJWT, wrapJWTCredential, getJWTMetadata, clearAllJWTMetadata } from "../utils.js";


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
                this.verifyAll()
            })
            .catch((error) => {
                this.toast.error(`Something went wrong fetching the credential!\n${error}`);
            }).finally(() => {
                //Perform action in always
            });
    },
    computed: {
        authenctication() {
            return this.$store.state.authentication;
        },
        storeVerifiables() {
            return this.$store.state.verifiables;
        },
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
    watch: {
        storeVerifiables(newVerifiables) {
            if (newVerifiables.length > 0) {
                this.addVerifiables(newVerifiables);
            }
        }
    },
    methods: {
        addCredential(credential) {
            let existingCredentialIndex = this.credentials.findIndex(cred => cred.id == credential.id);
            if (existingCredentialIndex != -1) {
                // replace more valuable credentials
                const oldFields = Object.keys(this.credentials[existingCredentialIndex].credentialSubject);
                const newFields = Object.keys(credential.credentialSubject);
                if (oldFields.length < newFields.length) {
                    this.credentials[existingCredentialIndex] = credential;
                    this.toast.success(`Successfully disclosed ${newFields.filter(x => !oldFields.includes(x)).join(', ')}!`);
                } else this.toast.warning('No additional information was disclosed!')
            } else this.credentials.push(credential);
            this.getContext(credential)
                .then(context => {
                    // credential reference does not refer actual credentials -> find it from credentials
                    this.credentials.find(cred => cred.id == credential.id).context = context;
                })
                .catch((error) => { console.log(error) })
        },
        async addVerifiables(verifiables) {
            // this.verifiables = this.verifiables.concat(verifiables);
            this.$store.dispatch("resetVerifiables");
            
            // Clear any previous JWT metadata when starting new verification
            clearAllJWTMetadata();
            
            // Convert JWT strings to verifiable objects before processing
            const processedVerifiables = verifiables.map(v => {
                if (typeof v === 'string' && isJWT(v)) {
                    try {
                        return wrapJWTCredential(v);
                    } catch (error) {
                        this.toast.error(`Invalid JWT credential: ${error.message}`);
                        return null; // Filter out invalid JWTs
                    }
                }
                return v;
            }).filter(v => v !== null);
            
            processedVerifiables.map(async v => await this.verify(v));
        },
        async fetchAuth(url) {
            return this.authenctication ? await this.$api.post(url, { vp: this.authenctication }) : await this.$api.get(url);
        },
        async fetchData() {
            if (this.credentialId) {
                const res = await this.fetchAuth(this.credentialId);
                const data = res.data;
                // Convert JWT to verifiable object if needed
                let verifiable = data;
                if (typeof data === 'string' && isJWT(data)) {
                    try {
                        verifiable = wrapJWTCredential(data);
                    } catch (error) {
                        this.toast.error(`Invalid JWT credential: ${error.message}`);
                        return;
                    }
                }
                this.verifiables.push(verifiable);
                return
            }

            if (this.subjectId) {
                const res = await this.fetchAuth(this.$store.state.VC_REGISTRY + encodeURIComponent(this.subjectId));
                // Convert any JWT strings in the array to verifiable objects
                this.verifiables = res.data.map(item => {
                    if (typeof item === 'string' && isJWT(item)) {
                        try {
                            return wrapJWTCredential(item);
                        } catch (error) {
                            this.toast.error(`Invalid JWT credential: ${error.message}`);
                            return null;
                        }
                    }
                    return item;
                }).filter(item => item !== null);
                return
            }

            if (this.storeVerifiables.length > 0) {
                // Convert JWT strings from store to verifiable objects
                this.verifiables = this.storeVerifiables.map(item => {
                    if (typeof item === 'string' && isJWT(item)) {
                        try {
                            return wrapJWTCredential(item);
                        } catch (error) {
                            this.toast.error(`Invalid JWT credential: ${error.message}`);
                            return null;
                        }
                    }
                    return item;
                }).filter(item => item !== null);
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

                    if (result.statusResult.results) {

                        const failedStatuses = result.statusResult.results.filter(r => !r.verified)

                        if (failedStatuses.filter(fs => fs.credentialStatus.statusPurpose === 'suspension').length > 0) {

                            credentialResult.suspended = true;

                            message = 'Credential suspended!';

                        }

                        if (failedStatuses.filter(fs => fs.credentialStatus.statusPurpose === 'revocation').length > 0) {

                            credentialResult.revoked = true;

                            message = 'Credential revoked!';

                        }

                    } else {

                        if (credential.credentialStatus.statusPurpose && credential.credentialStatus.statusPurpose == 'suspension') {

                            credentialResult.suspended = true;

                            message = 'Credential suspended!';

                        } else {

                            credentialResult.revoked = true;

                            message = 'Credential revoked!';

                        }

                    }

                }

                if (result.error) {

                    message = result.error.name + '\n';

                    if (result.error.errors) result.error.errors.forEach((e) => {

                        message += e.message + '\n';

                    })

                }

                credentialResult.status = message;

                if (credentialResult.suspended) this.toast.warning(`${credential.type[1] || credential.type[0]} is suspended!`);
                else this.toast.error(`Verification of ${credential.type[1] || credential.type[0]} failed!\n${message}`);

            } else {
                credentialResult.status = 'Credential verified!';
            }

            Object.assign(credential, credentialResult);

        },
        async verify(verifiable) {

            let isGs1 = false;
            let apiPayload = verifiable;

            // Check if this is a JWT credential using our metadata system
            const jwtMetadata = getJWTMetadata(verifiable.id);
            if (jwtMetadata && jwtMetadata.isJWTCredential) {
                // Send the original JWT to the API for verification
                apiPayload = jwtMetadata.originalJWT;
                
                // For JWT credentials extract the actual credential for display
                isGs1 = isGs1Credential(verifiable);
                this.addCredential({ ...verifiable });
            } else if (getVerifiableType(verifiable) == VerifiableType.PRESENTATION) {
                const presentation = {
                    presentation:
                    {
                        holder: getHolder(verifiable),
                        challenge: Array.isArray(verifiable.proof) ? verifiable.proof[0].challenge : verifiable.proof.challenge,
                        domain: Array.isArray(verifiable.proof) ? verifiable.proof[0].domain : verifiable.proof.domain
                    }
                }

                if (Array.isArray(verifiable.verifiableCredential)) {
                    isGs1 = verifiable.verifiableCredential.some(cred => isGs1Credential(cred))
                    verifiable.verifiableCredential.forEach(
                        (credential) => this.addCredential({ ...credential, presentation })
                    );
                } 
                else  {
                    isGs1 = isGs1Credential(verifiable.verifiableCredential)
                    this.addCredential({ ...verifiable.verifiableCredential, presentation });
                }

            } else {
                isGs1 = isGs1Credential(verifiable)
                this.addCredential({ ...verifiable });
            }

            const res = await this.$api.post(isGs1 ? '/gs1' : '/', [apiPayload], { params: { challenge: this.$route.query.challenge } });

            const result = res.data[0];

            console.log(result)

            // Handle JWT credentials using metadata system
            if (jwtMetadata && jwtMetadata.isJWTCredential) {
                // JWT verification - assign result to the credential
                this.assignResult(verifiable.id, result);
                
                // Assign verified status to the verifiable object
                verifiable.verified = result.verified;
                return;
            }

            // Handle presentations
            if (getVerifiableType(verifiable) == VerifiableType.PRESENTATION) {

                // build presentation object with important properties for attaching to the credential
                var presentation = {
                    verified: result.verified,
                    presentationResult: isGs1 ? result.verified : result.presentationResult.verified,
                    holder: getHolder(verifiable),
                    challenge: Array.isArray(verifiable.proof) ? verifiable.proof[0].challenge : verifiable.proof.challenge,
                    domain: Array.isArray(verifiable.proof) ? verifiable.proof[0].domain : verifiable.proof.domain,
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
                if (Array.isArray(verifiable.verifiableCredential)) {
                    const credentialResults = isGs1 ? result.result : result.credentialResults;
                    verifiable.verifiableCredential.forEach(
                        credential => this.assignResult(
                            credential.id,
                            credentialResults.find(credRes => credRes.credentialId == credential.id),
                            presentation
                        ));
                }
                // contains single credential object
                else this.assignResult(verifiable.verifiableCredential.id, result[0], presentation);

            }
            // Handle regular credentials  
            else {
                this.assignResult(verifiable.id, result);
            }

            // Safe assignment of verified property
            verifiable.verified = result.verified;
        },
        async verifyAll() {

            if (this.verifiables.length == 0) {
                this.toast.warning('No verifiables provided for verification!');
                return
            }

            try {

                this.progress = 1

                // forEach throws 'cannot convert undefined to object' error
                const verifyTasks = Promise.all(this.verifiables.map(async (verifiable) => {

                    await this.verify(verifiable);

                    this.progress += 1

                }));

                // wait for all vcs to be verified
                await verifyTasks;

                if (this.numberVerified == this.credentials.length) this.toast.success('All credentials could be verified!');

                return

            } catch (error) {
                this.toast.error(error.response ? error.response.data : `Something went wrong verifying the credentials!\n${error}`);
            }

        }
    }
}
</script>