<script>
import axios from "axios";
// import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {mapGetters} from "vuex";

export default {
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  computed: {
    ...mapGetters('urlStore', ['urlPrefix'])
  },
  data() {
    return {
      show: false,
      tableData: [],
      summary: 0,
      total: 0,
      ids: [],
      selectedItems: [],
    }
  },
  methods: {
    handleSelectionChange(selection) {
      let sum = 0;
      let cnt = 0;
      this.ids = [];
      this.selectedItems = [];
      selection.forEach(item => {
        sum += item.count * item.product.promotePrice;
        cnt += item.count;
        this.ids.push(item.id);
        this.selectedItems.push({pid: item.pid, count: item.count});
      })
      this.summary = sum.toFixed(2);
      this.total = cnt;
    },
    getImagePath(image) {
      if (image === null)
        return "";
      if (image.singleSmall !== null)
        return image.singleSmall;
      else
        return this.urlPrefix + '/productSingleSmall/' + image.id + '.jpg';
    },
    async changeCount(cartId, count) {
      await axios.post('/cart/alterGoodsNumber', null, {
        params: {
          id: cartId,
          count: count
        }

      })
          .then(res => {
            if (res.status === 200 && res.data.flag) {
              ElMessage({
                message: '修改成功!',
                type: 'success',
                duration: 2 * 1000
              });
            } else {
              ElMessage({
                message: '修改失败!',
                type: 'error',
                duration: 2 * 1000
              });
            }
          })
          .catch(() => {
            ElMessage({
              message: '修改失败!',
              type: 'error',
              duration: 2 * 1000
            });
          })
    },
    deleteCart(cartId) {
      ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('/cart/deleteGoods', null, {
          params: {
            id: cartId
          }
        })
            .then(res => {
              if (res.status === 200 && res.data.flag) {
                ElMessage({
                  message: '删除成功!',
                  type: 'success',
                  duration: 2 * 1000
                });
                this.tableData = this.tableData.filter(item => item.id !== cartId);
              } else {
                ElMessage({
                  message: '删除失败!',
                  type: 'error',
                  duration: 2 * 1000
                });
              }
            })
            .catch(() => {
              ElMessage({
                message: '删除失败!',
                type: 'error',
                duration: 2 * 1000
              });
            })
      }).catch(() => {
      })
    },

    settlement() {
      ElMessageBox.confirm('确定要结算吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户点击了“确定”，执行结算操作
        const orderData = {
          uid: this.userId,
          orderItems: this.selectedItems
        }
        if(orderData.orderItems.length === 0){
          ElMessage({
            message: '请选择要结算的商品',
            type: 'warning',
            duration: 2 * 1000
          });
          return;
        }
        axios.post('/order/createOrder', orderData)
            .then(res => {
              if (res.status === 200 && res.data.flag) {
                ElMessage({
                  message: '结算成功',
                  type: 'success',
                  duration: 2 * 1000
                });
                //删除购物车中已经结算的商品
                axios.post('/cart/deleteGoodsByList', {
                  id: this.ids
                })
                    .then(res => {
                      if (res.status === 200 && res.data.flag) {
                        this.tableData = this.tableData.filter(item => !this.ids.includes(item.id));
                      }
                    })
                    .catch()
              } else {
                ElMessage({
                  message: '结算失败',
                  type: 'error',
                  duration: 2 * 1000
                });
              }
            })
            .catch(() => {
              ElMessage({
                message: '结算失败',
                type: 'error',
                duration: 2 * 1000
              });
            })
      }).catch(() => {
        // 用户点击了“取消”，不执行任何操作
      });
    },
    deleteCarts() {
      if (this.ids.length === 0) {
        ElMessage({
          message: '请选择要删除的商品',
          type: 'warning',
          duration: 2 * 1000
        });
        return;
      }
      ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('/cart/deleteGoodsByList', {
          id: this.ids
        })
            .then(res => {
              if (res.status === 200 && res.data.flag) {
                ElMessage({
                  message: '删除成功',
                  type: 'success',
                  duration: 2 * 1000
                });
                this.tableData = this.tableData.filter(item => !this.ids.includes(item.id));
              } else {
                ElMessage({
                  message: '删除失败',
                  type: 'error',
                  duration: 2 * 1000
                });
              }
            })
            .catch(() => {
              ElMessage({
                message: '删除失败',
                type: 'error',
                duration: 2 * 1000
              });
            })
      }).catch(() => {
      })
    }
  },
  mounted() {
    this.show = false;
    axios.get('/cart/show?id=' + this.userId)
        .then(res => {
          if (res.status === 200 && res.data.flag) {
            this.tableData = res.data.data;
          } else {
            ElMessage({
              message: '获取购物车失败!',
              type: 'error',
              duration: 2 * 1000
            });
            // useRouter().back();
          }
        })
        .catch(() => {
          ElMessage({
            message: '获取购物车失败!',
            type: 'error',
            duration: 2 * 1000
          });
          // useRouter().back();
        })
    this.show = true;
  }
}

</script>

<template>

  <div>
    <el-table
        v-if="show"
        :data="tableData"
        :header-cell-style="{'text-align':'center'}"
        stripe
        width="100%"
        @selection-change="handleSelectionChange"
        style="margin-left: 0;margin-right: 0"
    >
      <el-table-column align="center" fixed="left" type="selection" width="80"/>

      <el-table-column align="center" label="商品图片" prop="imageId" width="100">
        <template v-slot="scope">
          <el-image :src="getImagePath(scope.row.image)"></el-image>
        </template>
      </el-table-column>

      <el-table-column align="left" label="商品信息" prop="product.name" width="800"/>

      <el-table-column align="center" label="单价" prop="product.promotePrice" width="200">
        <template v-slot="scope">
          <span class="price-show">￥&nbsp;{{ scope.row.product.promotePrice }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="数量" prop="count" width="250">
        <template v-slot="scope">
          <el-input-number v-model="scope.row.count" :max="scope.row.product.stock" :min="1"
                           @change="changeCount(scope.row.id, scope.row.count)"></el-input-number>
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="总价" width="150">
        <template v-slot="scope">
          <span class="price-show">￥&nbsp;{{ (scope.row.product.promotePrice * scope.row.count).toFixed(2) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template #header>
          <el-button plain type="danger" @click="deleteCarts">批量删除</el-button>
        </template>
        <template v-slot="scope">
          <el-button plain type="danger" @click="deleteCart(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="show" id="summary-row">
      <span style="vertical-align: center">已选商品&nbsp;</span>
      <span class="price-show">{{ this.total }}</span>
      <span style="vertical-align: center">&nbsp;件，总价&nbsp;</span>
      <span class="price-show" style="font-size: 23px; font-weight: bold">￥&nbsp;{{ this.summary }}</span>
      <el-button id="settlement-button" type="danger" @click="settlement">结算</el-button>
    </div>
  </div>

</template>

<style scoped>

.price-show {
  color: #C60A0A;
}

.el-table_6_column_41 {
  color: #C60A0A;
}

#summary-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #e5e5e5;
  height: 60px;
  margin-top: 20px;
  border-radius: 10px;
  vertical-align: center;
  text-align: center;
}

#settlement-button {
  font-size: 16px;
  font-weight: bold;
  padding: 18px 26px;
  margin-left: 30px;
  margin-right: 30px;
}

</style>