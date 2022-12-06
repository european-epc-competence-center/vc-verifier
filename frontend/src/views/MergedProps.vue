<template>
    <div class="card border-success m-3 mb-5 shadow">
        <div class="card-header text-success p-3">
            <h5>Merged verified properties</h5>
        </div>
        <div class="card-body p-3">
            <TransitionGroup name="list" tag="ul" class="list-group">
                <li v-for="(value, key) in properties" :key="key" class="list-group-item">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>{{key}}</strong>
                        </div>
                        <div class="col-md-6">
                            <a v-if="$isURL($getCredentialValue(value))" :href="$getCredentialValue(value)">{{$getCredentialValue(value)}}</a>
                            <p v-else class="m-0">{{$getCredentialValue(value)}}</p>
                        </div>
                    </div>
                </li>
            </TransitionGroup>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MergedProps',
    props: {
        properties: Object,
    },
    data() {
        return {
            
        }
    },
}
</script>