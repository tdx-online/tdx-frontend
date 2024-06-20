<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useStore} from "vuex";

const store = useStore();
const router = useRouter();
const userCartCount = ref(0);
const userName = ref("");
const userId = ref("");
const isLogin = ref(false);


function login() {
  router.push("/user/login");
}

function register() {
  router.push("/user/register")
}

function logout() {
  store.dispatch("userStore/logout")
      .then((res) => {
        if (res.data.flag) {
          ElMessage.success("退出成功");
          isLogin.value = false;
          userName.value = "";
          userId.value = "";
          router.push("/");
        } else {
          ElMessage.error("退出失败");
        }
      })
      .catch(() => {
        ElMessage.error("退出失败");
      });
}

function getUserCartCount() {
  axios.get("/cart/getCount?id=" + userId.value)
      .then((res) => {
        if (res.data.flag) {
          userCartCount.value = res.data.data;
        }
      })
      .catch(() => {
        ElMessage.error("获取购物车数量失败");
      });
}

function checkLogin() {
  // if (localStorage.getItem("token") === null || localStorage.getItem("token") === ""
  //     || localStorage.getItem("token") === undefined || localStorage.getItem("token") === "undefined") {
  //   isLogin.value = false;
  //   return;
  // }

  // if (store.state["userStore/token"] === null || store.state["userStore/token"] === ""
  //     || store.state["userStore/token"] === undefined || store.state["userStore/token"] === "undefined") {
  //   isLogin.value = false;
  //   return;
  // }

  // alert(axios.defaults.headers.common["Authorization"])

  axios.get("user/getUser")
      .then((res) => {
        if (res.data.flag) {
          isLogin.value = true;
          userName.value = res.data.data.username;
          userId.value = res.data.data.id;
          // getUserGoods();
          getUserCartCount();
        } else {
          isLogin.value = false;
        }
        if (res.status === 403) {
          isLogin.value = false;
          store.commit("userStore/clearToken")
        }
      })
      .catch((e) => {
        if (e.response.status === 403) {
          isLogin.value = false;
          store.commit("userStore/clearToken")
        } else {
          ElMessage.error("检查登录状态失败");
        }
      });
}

function toCart() {
  router.push({
    path: "/user/cart",
    query: {
      id: userId.value
    }
  });
}

onMounted(() => {
  checkLogin();
});

function toOrder() {
  router.push({
    path: "/user/order",
    query: {
      id: userId.value
    }
  });
}

</script>

<template>
  <nav id="top" class="top">
    <div class="pull-left">
      <router-link to="/">
        <span class="glyphicon glyphicon-home redColor" style="color:#C40000;margin:0"></span>
        淘东夕首页
      </router-link>
      <span>Hi，欢迎来淘东夕</span>

      <a v-if="isLogin" href="#">{{ userName }}</a>
      <span v-if="isLogin" @click="logout" class="link">退出</span>

      <span v-if="!isLogin" @click="login" class="link">请登录</span>
      <span v-if="!isLogin" @click="register" class="link">免费注册</span>
    </div>


    <div v-if="isLogin" class="pull-right">
      <span style="cursor: pointer" @click="toOrder">我的订单</span>
      <span style="cursor: pointer" @click="toCart">
        <i aria-hidden="true" class="fa fa-shopping-cart"></i>
        购物车&nbsp;<strong>{{ userCartCount }}</strong>&nbsp;件
      </span>
    </div>
  </nav>
</template>

<style scoped>
#top {
  height: 40px;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.pull-left {
  margin-top: auto;
  margin-bottom: auto;
}

nav.top {
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #e7e7e7;
  margin-left: 5px;
  margin-right: 5px;
  margin-top: 0;
  display: flex;
  justify-content: space-between;
}

nav.top span {
  margin-right: 20px;
}

nav.top span, nav.top a {
  color: #999;
  margin: 0 10px 0 10px;
}

nav.top a:hover {
  color: #87CEEB;
}

nav a {
  text-decoration: none;
}

nav.top {
  background-color: #f2f2f2;
}

nav.top div.row div {
  margin: 5px 0;
}

nav.top div.row div {
  background-color: lightgray;
  border: 1px solid gray;
}

div.pull-left {
  margin-left: 10px;
}

div.pull-right {
  margin-right: 10px;
}

.link:hover {
  color: #87CEEB;
  cursor: pointer;
}

</style>
