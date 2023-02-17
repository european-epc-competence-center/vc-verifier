<template>
    <span class="badge text-white" :class="['text-bg-' + color]" tabindex="0" style="display: inline-block;"
        type="button" data-bs-container="body" :data-bs-toggle="value.length > MAX_STRING_LENGTH ? 'tooltip' : ''"
        :data-bs-title="value" @click="copyToClipboard">{{
    trimString(value)
        }}</span>
</template>

<script>
import { useToast } from "vue-toastification";

export default {
    name: 'TrimmedBatch',
    props: {
        value: String,
        MAX_STRING_LENGTH: {
            default: 32,
            type: Number
        },
        color: {
            default: 'primary',
            type: String
        },
    },
    data() {
        return {
            toast: useToast(),
        }
    },
    methods: {
        trimString(string) {
            if (string.length < this.MAX_STRING_LENGTH) return string;
            return string.substring(0, this.MAX_STRING_LENGTH / 2 - 2) + "..." + string.substr(length - this.MAX_STRING_LENGTH / 2 + 2);
        },
        copyToClipboard() {
            navigator.clipboard.writeText(this.value);
            this.toast.info(`Copied "${this.value}" to clipboard!`);
        },
    }
}
</script>