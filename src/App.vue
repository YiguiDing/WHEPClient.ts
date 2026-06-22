<script setup lang="ts">
import WHEPClient from "@/lib/WHEPClient"
import { onMounted, ref } from "vue";

const url = ref("http://localhost:8889/camera_01/whep")
const wrapper = ref<HTMLDivElement>()
const client: WHEPClient = new WHEPClient(url.value)

function connect() {
  client.setUrl(url.value)
  client.init()
}
onMounted(() => {
  wrapper.value?.appendChild(client.dom())
})
</script>

<template>
  <div class="container">
    <div class="toolbar">
      <input v-model="url" class="url-input" placeholder="WHEP URL" @keyup.enter="connect" />
      <button class="btn" @click="connect">连接</button>
    </div>
    <div class="wrapper">
      <div ref="wrapper" class="video-wrapper" />
    </div>
  </div>
</template>

<style>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.url-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #2a2a2a;
  color: #eee;
  font-size: 14px;
  outline: none;
}

.url-input:focus {
  border-color: #4a9eff;
}

.btn {
  padding: 6px 20px;
  border: none;
  border-radius: 4px;
  background: #4a9eff;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover {
  background: #3a8eef;
}

.wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #444;
  overflow: hidden;
}

.video-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
