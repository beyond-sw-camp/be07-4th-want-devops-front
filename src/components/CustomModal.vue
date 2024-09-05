<!-- src/components/CustomModal.vue -->
<template>
  <div v-if="modelValue" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-content-header">
        <span class="material-symbols-outlined closeMapBtn" @click="close">
          close
        </span>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    close() {
      this.$emit('update:modelValue', false);
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 1000px;
  width: 900px !important; /* 너비를 700px로 설정 */
  position: relative;
}
.modal-content-header {
  display: flex;
}
.modal-content-header .closeMapBtn {
  margin-left: auto;
}



</style>
