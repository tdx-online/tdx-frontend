<template>
  <router-view/>
</template>

<script setup>
import axios from "axios";
import {ElMessage} from "element-plus";
//本地部署
axios.defaults.baseURL = "http://localhost:8780";
// axios.defaults.baseURL = "http://localhost:8081";
// axios.defaults.baseURL = "http://localhost:8083/product-service";
axios.defaults.withCredentials = true;
if (localStorage.getItem("token") !== null) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("token");
}
//服务器部署
// axios.defaults.baseURL = '/store';

axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 403) {
        // 处理 403 错误，清除本地存储的 token
        if (localStorage.getItem("token") !== null) {
          localStorage.removeItem('token');
          axios.defaults.headers.common["Authorization"] = "";
          ElMessage.warning('登录状态已过期，请重新登录');
        }
      }
      return Promise.reject(error);
    }
);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
