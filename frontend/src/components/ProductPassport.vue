<template>
    <div class="card border-success m-3 mb-5 shadow">
        <div class="card-header text-success p-3">
            <div class="row justify-between align-items-center">
                <div class="col-9">
                    <h5 class="mb-0">Verified Product Passport</h5>
                </div>
                <div class="col-3 text-end">
                    <button @mouseover="hoverdownload = true" @mouseleave="hoverdownload = false" :disabled="renderingPDF"
                        @click="downloadProductPassportPDF" class="btn btn-sm btn-outline-success">
                        <div v-if="renderingPDF" class="spinner-border text-secondary" role="status"
                            style="width: 1rem; height: 1rem;">
                            <span class="visually-hidden">Verifying...</span>
                        </div>
                        <i v-else :class="[hoverdownload ? 'bi-cloud-download' : 'bi-filetype-pdf']" role="img"
                            aria-label="PDF Download"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body p-3">
            <div class="row mb-3">
                <div class="col-md-8">
                    <h3 v-if="properties.product" class="ms-3 mb-3">{{ properties.product }}</h3>
                    <TransitionGroup name="list" tag="ul" class="list-group">
                        <li v-for="(value, key) in getMainProps" :key="key" class="list-group-item">
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>{{ mainProps[key] }}</strong>
                                </div>
                                <div class="col-md-6">
                                    <a v-if="$isURL($getCredentialValue(value))" :href="$getCredentialValue(value)">{{
                                        $getCredentialValue(value)
                                    }}</a>
                                    <p v-else class="m-0">{{ $getCredentialValue(value) }}</p>
                                </div>
                            </div>
                        </li>
                    </TransitionGroup>
                </div>
                <div class="col-md-4 mt-md-0 mt-3">
                    <Transition name="slide-fade">
                        <img v-if="properties.product_img" class="rounded" id="productpassportimg"
                            :src="properties.product_img" :alt="properties.product_img" />
                    </Transition>
                </div>
            </div>
            <div class="accordion" id="productpassportacc">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="productpassportacchead">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#productpassportdetails" aria-expanded="false"
                            aria-controls="productpassportdetails">
                            Details
                        </button>
                    </h2>
                    <div id="productpassportdetails" class="accordion-collapse collapse"
                        aria-labelledby="productpassportacchead" data-bs-parent="productpassportacc">
                        <div class="accordion-body p-0">
                            <div class="table-responsive">
                                <table class="table table-striped mb-1">
                                    <TransitionGroup name="list" tag="tbody">
                                        <tr v-for="(value, key) in properties" :key="key">
                                            <td><strong>{{ key }}</strong> <a v-if="context.get(key)"
                                                    :href="context.get(key)['@id']" tabindex="0"
                                                    style="display: inline-block;" type="button" target="_blank"
                                                    data-bs-container="body" data-bs-toggle="tooltip"
                                                    :data-bs-title="context.get(key)['@id']">
                                                    <small>
                                                        <i class="bi bi-info-circle text-primary"></i>
                                                    </small>
                                                </a></td>
                                            <td>
                                                <a v-if="$isURL($getCredentialValue(value))"
                                                    :href="$getCredentialValue(value)">{{
                                                        $getCredentialValue(value)
                                                    }}</a>
                                                <p v-else class="m-0">{{ $getCredentialValue(value) }}</p>
                                            </td>
                                        </tr>
                                    </TransitionGroup>
                                </table>
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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { productPassportPDF } from '../pdf.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
export default {
    name: 'ProductPassport',
    props: {
        properties: Object,
        credentials: [Object],
        context: Map
    },
    data() {
        return {
            toast: useToast(),
            hoverdownload: false,
            renderingPDF: false,
            mainProps: {
                'brand': 'Brand',
                'model': 'Model',
                'country_of_origin': 'Made in',
                'clockworkType': 'Clockwork',
                'caseMaterial': 'Case Material',
                'production_date': 'Production date',
                'product_website': 'Product website'
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
    },
    methods: {
        downloadProductPassportPDF() {
            this.renderingPDF = true;
            // var win = window.open('', '_blank');
            productPassportPDF(this.properties, this.credentials)
                .then((pdf) => {
                    // return pdfMake.createPdf(pdf).open({}, win);
                    return pdfMake.createPdf(pdf).download('vpp-' + this.properties.model || 'undefined' + '.pdf');
                })
                .catch((error) => {
                    this.toast.error(`Something went wrong creating the pdf!\n${error}`);
                }).finally(() => {
                    this.renderingPDF = false;
                });
        },
    }
}
</script>