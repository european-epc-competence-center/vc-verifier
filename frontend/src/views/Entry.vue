<template>
    <div class="card m-auto shadow" style="min-width: 80%">
        <div class="card-header text-center p-3">
            <h3>Credential Selector</h3>
            <a href="https://eecc.info"><img id="logo" src="/logo.png"/></a>
        </div>
        <div class="card-body m-3">
            <p>Select the credential/s using one of the options below.</p>
            <!--By json file-->
            <div class="card mb-3 p-3 shadow">
                <h5>Credential File</h5>
                <form v-on:submit.prevent="submitFile">
                    <div class="input-group">
                        <input v-on:change="onFileChange" id="credentialId" type="file" class="form-control" placeholder="credential.json" aria-label="Credential" aria-describedby="credentialHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Upload a credential in json format</div>
                </form>
            </div>
            <!--By credential id-->
            <div class="card mb-3 p-3 shadow">
                <h5>Credential Id</h5>
                <form v-on:submit.prevent="submitId">
                    <div class="input-group">
                        <input v-model="credentialId" id="credentialId" type="text" class="form-control" placeholder="https://registry.org/vc/uuid" aria-label="Credential Id" aria-describedby="credentialIdHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Provide the credential's id</div>
                </form>
            </div>
            <!--By subject id-->
            <div class="card mb-3 p-3 shadow">
                <h5>Subject Id</h5>
                <form v-on:submit.prevent="submitSubject">
                    <div class="input-group">
                        <input v-model="subjectId" id="credentialId" type="text" class="form-control" placeholder="https://gs1.org/123455" aria-label="Subject Id" aria-describedby="subjectIdHelp">
                        <button class="btn btn-outline-primary" type="submit">Verify</button>
                    </div>
                    <div class="form-text">Provide the subject id for which the credentials shall be queried</div>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
  import { useToast } from "vue-toastification";
  export default {
  name: 'Entry',
  components: {
    
  },
  data() {
    return {
        toast: useToast(),
        credentialFile: undefined,
        credentialId: '',
        subjectId: ''
    }
  },
  methods: {
    onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
        this.credentialFile = files[0];
        if (this.credentialFile.type != 'application/json') this.toast.warning('Credential must be provided as a json file!');
        console.log(this.credentialFile);
        this.toast.warning('Not implemented!');
    },
    submitFile() {

    },
    submitId() {
        this.$router.push({ path: '/verify', query: { credentialId: encodeURIComponent(this.credentialId) } })
    },
    submitSubject() {
        this.$router.push({ path: '/verify', query: { subjectId: encodeURIComponent(this.subjectId) } })
    }
  }
}
</script>