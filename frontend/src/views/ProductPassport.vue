<template>
    <div class="card border-success m-3 mb-5 shadow">
        <div class="card-header text-success p-3">
            <h5>Verified Product Passport</h5>
        </div>
        <div class="row m-3">
            <div class="col-md-8">
                <h5>{{properties.product}}</h5>
            </div>
            <div class="col-md-4 pe-0">
                <img class="rounded" id="productpassportimg" :src="properties.product_img" :alt="properties.product_img"/>
            </div>
        </div>
        <div class="card-body p-3">
            <h5 class="ms-3">Details</h5>
            <TransitionGroup name="list" tag="ul" class="list-group">
                <li v-for="(value, key) in properties" :key="key" class="list-group-item">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>{{key}}</strong>
                        </div>
                        <div class="col-md-6">
                            {{value}}
                        </div>
                    </div>
                </li>
            </TransitionGroup>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProductPassport',
    props: {
        properties: Object,
    },
    data() {
        return {
            
        }
    },
}
</script>