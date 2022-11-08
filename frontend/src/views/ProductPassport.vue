<template>
    <div class="card border-success m-3 mb-5 shadow">
        <div class="card-header text-success p-3">
            <h5>Verified Product Passport</h5>
        </div>
        <div class="card-body p-3">
        <div class="row mb-3">
            <div class="col-md-8">
                <h3 class="ms-3 mb-3">{{properties.product}}</h3>
                <ul class="list-group">
                    <Transition name="list">
                        <li v-if="properties.brand" class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Brand</strong>
                                </div>
                                <div class="col-md-6">
                                    {{properties.brand}}
                                </div>
                            </div>
                        </li>
                    </Transition>
                    <Transition name="list">
                        <li v-if="properties.model" class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Model</strong>
                                </div>
                                <div class="col-md-6">
                                    {{properties.model}}
                                </div>
                            </div>
                        </li>
                    </Transition>
                    <Transition name="list">
                        <li v-if="properties.production_date" class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Production date</strong>
                                </div>
                                <div class="col-md-6">
                                    {{properties.production_date}}
                                </div>
                            </div>
                        </li>
                    </Transition>
                </ul>
            </div>
            <div class="col-md-4">
                <Transition name="slide-fade">
                    <img v-if="properties.product_img" class="rounded" id="productpassportimg" :src="properties.product_img" :alt="properties.product_img"/>
                </Transition>
            </div>
        </div>
            <div class="accordion" id="productpassportacc">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="productpassportacchead">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#productpassportdetails" aria-expanded="false" aria-controls="productpassportdetails">
                        Details
                    </button>
                    </h2>
                    <div id="productpassportdetails" class="accordion-collapse collapse" aria-labelledby="productpassportacchead" data-bs-parent="productpassportacc">
                    <div class="accordion-body">
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
                </div>
            </div>
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