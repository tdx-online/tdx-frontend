<template>
  <div id="header">
    <Header></Header>
  </div>

  <div id="login">
    <div class="container">
      <el-form class="form-wrap" label-width="60px">
        <h2 align="center">登录</h2>
        <el-form-item class="label" label="用户名" prop="username">
          <el-input v-model.trim="username" clearable required @keyup.enter="submitForm"></el-input>
        </el-form-item>
        <el-form-item class="label" label="密码" prop="password">
          <el-input v-model.trim="password" clearable required show-password type="password"
                    @keyup.enter="submitForm"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="submitForm">登录</el-button>
        </el-form-item>
        <el-form-item>
          <router-link class="register" to="/user/register">没有账号？注册新账号</router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>

  <div id="footer">
    <Footer></Footer>
  </div>
</template>

<script setup>
import axios from "axios";
import Header from "@/components/user-facing/header-footer/LoginAndRegisterHeader.vue";
import Footer from "@/components/user-facing/header-footer/FooterComponent.vue";
import {onMounted, ref} from "vue";
import {ElButton, ElForm, ElFormItem, ElInput, ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

const store = useStore();
const urlPrefix = store.getters['urlStore/urlPrefix'];
//本地部署true，服务器部署false
axios.defaults.withCredentials = true;

const router = useRouter();
const username = ref("");
const password = ref("");

function submitForm() {

  if (username.value === "" || password.value === "") {
    ElMessage({
      message: '用户名或密码不能为空!',
      type: 'error',
      duration: 2 * 1000
    });
    return false;
  }

  store.dispatch('userStore/login', {
    username: username.value,
    password: password.value
  }).then((res) => {
    // console.log(res)
    if (res.data.flag) {
      ElMessage({
        message: '登录成功!',
        type: 'success',
        duration: 2 * 1000
      });
      axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("token");
      if (username.value === "admin") {
        router.push("/manage");
      } else {
        router.push('/');
      }
    } else {
      ElMessage({
        message: '登录失败，请重试!',
        type: 'error',
        duration: 2 * 1000
      });
      username.value = "";
      password.value = "";
    }
  }).catch(() => {
    ElMessage({
      message: '登录失败，请重试!',
      type: 'error',
      duration: 2 * 1000
    });
    username.value = "";
    password.value = "";
  });

  return false;
}

onMounted(() => {
  document.getElementById('login').style.backgroundImage = `url(${urlPrefix + "/login/login.png"})`;
});

</script>

<style scoped>
#header {
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 15px;
  overflow: hidden;
}

#login {
  height: 100vh;
  width: 90%;
  background-size: cover;
  background-repeat: no-repeat;
  margin-left: auto;
  margin-right: auto;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95%;
  float: right;
  width: 35%;
  margin-right: 2%;
}

.form-wrap {
  width: 400px;
  height: 300px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  padding: 40px;
}

h2 {
  margin-bottom: 16px;
}

.el-form-item__content > .el-input {
  width: 100%;
}

.el-button--danger {
  width: 100%;
  margin-top: 10px;
}

.el-button--danger:hover {
  background-color: #ee0c63;
}

.register {
  text-align: right;
}

.label {
  font-weight: bold;
}
</style>