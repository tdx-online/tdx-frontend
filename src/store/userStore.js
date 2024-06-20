import axios from 'axios';

export default {
    namespaced: true,
    state: {
        token: localStorage.getItem('token') || ''
    },
    mutations: {
        setToken(state, token) {
            // console.log('setToken', token);
            state.token = token;
            localStorage.setItem('token', token);
        },
        clearToken(state) {
            state.token = '';
            localStorage.removeItem('token');
        }
    },
    actions: {
        login({commit}, credentials) {
            return axios.post('/user/login', credentials)
                .then(response => {
                    const token = response.headers['authorization']; // 从响应头中获取 token
                    // console.log('login', token);
                    // console.log(response.headers.hasAuthorization('Authorization'))
                    if (token) {
                        // alert(token)
                        commit('setToken', token.replace('Bearer ', '')); // 去掉 'Bearer ' 前缀
                        // axios.defaults.headers.common['Authorization'] = token;
                        // axios.defaults.headers.put['Authorization'] = token;
                    }
                    return response
                });
        },
        logout({commit}) {
            return axios.get("/user/logout")
                .then(res => {
                    if (res.data.flag) {
                        commit('clearToken');
                        delete axios.defaults.headers.common['Authorization'];
                    }
                    return res
                })
        }
    }
};
