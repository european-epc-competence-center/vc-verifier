<template>
    <Transition name="slide-fade">
        <div v-if="Object.keys(verifiedProperties).length > 0">
            <ProductPassport v-if="isProductPassport()" :properties="verifiedProperties"/>
            <MergedProps v-else :properties="verifiedProperties"/>
        </div>
    </Transition>
</template>

<script>
import MergedProps from './MergedProps.vue'
import ProductPassport from './ProductPassport.vue';

export default {
    name: 'Passport',
    props: {
        credentials: Object,
    },
    components: {
        MergedProps,
        ProductPassport
    },
    data() {
        return {

        }
    },
    computed: {
        verifiedProperties() {
            var verifiedProps = {};
            var sortedCredentials = this.credentials;
            sortedCredentials = sortedCredentials.sort((a, b) => {
                let da = new Date(a.issuanceDate),
                    db = new Date(b.issuanceDate);
                return da - db;
            });
            sortedCredentials.forEach( credential => {
                if (credential.verified) {
                    verifiedProps = Object.assign(verifiedProps, credential.credentialSubject)
                }
            });
            return Object.keys(verifiedProps).sort().reduce((res, key) => (res[key] =  verifiedProps[key], res), {});
        },
    },
    methods: {
        isProductPassport() {
            if (this.credentials.length < 1) return false;
            return this.credentials.filter(function(credential) {
                return credential['@context'].some(c => typeof c  == 'string' && c.startsWith('https://ssi.eecc.de/api/registry/context/productpassport'))
            }).length > 0;
        }
    }
}
</script>