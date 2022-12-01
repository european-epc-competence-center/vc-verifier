<template>
    <div class="card border-success m-3 mb-5 shadow">
        <div class="card-header text-success p-3">
            <h5>Verified Product Passport</h5>
        </div>
        <div class="card-body p-3">
        <div class="row mb-3">
            <div class="col-md-8">
                <h3 v-if="properties.product" class="ms-3 mb-3">{{properties.product}}</h3>
                <TransitionGroup name="list" tag="ul" class="list-group">
                    <li v-for="(value, key) in getMainProps" :key="key" class="list-group-item">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>{{mainProps[key]}}</strong>
                            </div>
                            <div class="col-md-6">
                                <span v-if="typeof value === 'object'" class="badge text-bg-primary text-white" 
                                data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="credential-tooltip" :data-bs-title="Object.entries(value).map(([k, v]) => `<b>${k}:</b> ${v}<br>`).join('')">
                                    {{value.value || value['@value']}}
                                </span>
                                <p class="m-0" v-else>{{value}}</p>
                            </div>
                        </div>
                    </li>
                </TransitionGroup>
            </div>
            <div class="col-md-4 mt-md-0 mt-3">
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
            mainProps: {
                'brand': 'Brand',
                'model': 'Model',
                'clockworkType': 'Clockwork',
                'caseMaterial': 'Case Material'
            }
        }
    },
    computed: {
        getMainProps() {
            return Object.keys(this.mainProps)
                            .filter((key) => Object.keys(this.properties).includes(key))
                            .reduce((obj, key) => {
                                return Object.assign(obj, {
                                [key]: this.properties[key]
                                });
                            }, {});
        }
    }
}
</script>