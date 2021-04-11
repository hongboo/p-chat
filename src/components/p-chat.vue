<template>
  <div>
    <div class="dialog-box">
      <div class="left">
        <a-alert
          message="please select talk user"
          banner
          v-if="!currentDialogUser.userId"
        />
        <div class="top" v-else>
          Talking with
          {{ currentDialogUser.nickName }}
        </div>
        <div class="up">
          <div
            :class="user.userId === item.userId ? 'owner' : 'other'"
            v-for="(item, idx) in currentDialogDataArr"
            :key="idx"
          >
            <span>{{ item.dateTime }}</span
            >{{ item.talkContent }}
          </div>
        </div>
        <div class="middle">
          <textarea v-model="talkContent" @keydown.enter="handleSubmit" />
        </div>
        <div class="down">
          <button @click="handleSubmit">send</button>
        </div>
      </div>
      <div class="right">
        <div class="">Talk List</div>
        <div
          :class="(idx + 1) % 2 !== 0 ? 'list-1' : 'list-2'"
          v-for="(item, idx) in userMap.values()"
          :key="idx"
          @click="selectUser(item)"
          @dblclick="editNickNameSwitch(item)"
        >
          <a-input
            :id="'_' + item.userId"
            class="a-input"
            placeholder="给自己改个昵称"
            v-show="item.editSwitch"
            @blur="editNickName(item)"
            @keydown.enter="editNickName(item)"
          />
          <span v-show="!item.editSwitch">{{ item.nickName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import dateUitls from "@/util/utils.js";
export default {
  name: "PChat",
  components: {},
  data() {
    return {
      dialogMap: new Map(),
      talkContent: "",
      websock: null,
      user: {
        // 自己
        userId: "",
        nickName: "",
      },
      // userId: null, // 自己的ID
      userMap: new Map(), // 用户ID与用户的对应关系
      // userList: [], // 用户列表
      currentDialogUser: {}, // 当前对话用户    // 改到这里了。。。。。
      currentDialogDataArr: null, // 当前对话数据
    };
  },
  watch: {
    currentDialogUser() {
      this.currentDialogDataArr = this.dialogMap.get(
        this.currentDialogUser.userId
      );
    },
  },
  computed: {},
  methods: {
    handleSubmit() {
      if (!this.currentDialogUser.userId) {
        return;
      }
      if (!this.talkContent.trim()) {
        return;
      }

      let talkContent = this.talkContent;
      let talkData = {
        dataType: 2,
        userId: this.user.userId, // 发送者
        currentDialogUserId: this.currentDialogUser.userId, // 接收者
        talkContent: talkContent,
      };

      this.websocketsend(JSON.stringify(talkData));
    },
    handleChange(e) {
      this.talkContent = e.target.value;
    },
    ////////
    initWebSocket() {
      //初始化weosocket
      const wsuri = "ws://127.0.0.1:8081/websocket/" + this.user.userId;
      // const wsuri = "ws://wwww.alemonice.com:8081/websocket/" + this.user.userId;
      // const wsuri = "ws://47.106.120.208:8081/websocket/" + this.user.userId;
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen() {
      //连接建立之后执行send方法发送数据
      let data = {
        dataType: 1,
        status: 1, // 在线
        user: this.user,
      };
      this.websock.send(JSON.stringify(data));
    },
    websocketonerror() {
      //连接建立失败重连
      this.initWebSocket();
    },
    websocketonmessage(e) {
      //数据接收
      const redata = JSON.parse(e.data);
      if (redata.dataType === 1) {
        // 用户信息推送
        if (redata.user.userId === this.user.userId) {
          return;
        }
        let userMap = new Map([...this.userMap]);
        if (redata.status === 1) {
          userMap.set(redata.user.userId, redata.user);
          this.$message.success(`${redata.user.nickName} 进入了房间`);
        } else if (redata.status === 2) {
          userMap.delete(redata.user.userId);
          this.$message.warning(`${redata.user.nickName} 离开了房间`);
        }
        this.userMap = userMap;
      } else if (redata.dataType === 2) {
        // 文本信息推送
        this.currentDialogUser = this.userMap.get(redata.sendId); ///////////
        let comments = this.getDialogDataArr(this.currentDialogUser.userId);
        comments.push({
          userId: redata.sendId,
          talkContent: redata.talkContent,
          dateTime: redata.dateTime,
        });
        this.currentDialogDataArr = comments;
      }
    },
    getDialogDataArr(currentDialogUserId) {
      let comments = this.dialogMap.get(currentDialogUserId);
      if (!comments) {
        comments = [];
        this.dialogMap.set(currentDialogUserId, comments);
      }
      return comments;
    },
    websocketsend(data) {
      //数据发送
      this.websock.send(data);
      let comments = this.getDialogDataArr(this.currentDialogUser.userId);
      comments.push({
        userId: this.user.userId,
        talkContent: this.talkContent,
        dateTime: dateUitls.simpleDateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
      this.currentDialogDataArr = comments;
      this.talkContent = "";
    },
    websocketclose(e) {
      //关闭
      let data = {
        dataType: 1,
        status: 2, // 离线
        user: this.user,
      };
      this.websock.send(JSON.stringify(data));
      console.log("断开连接", e);
    },
    selectUser(user) {
      this.currentDialogUser = user;
    },
    editNickNameSwitch(user) {
      if (user.userId !== this.user.userId) {
        return;
      }
      this.$set(user, "editSwitch", true);
      this.$nextTick(() => {
        document.querySelector('#_' + user.userId).focus()
      })
    },
    editNickName(user) {
      user.editSwitch = false;
      let nickNameValue = document.querySelector("#_" + user.userId).value;
      if (nickNameValue && nickNameValue.trim()) {
        user.nickName = nickNameValue;
        let data = {
          dataType: 1,
          status: 1, // 在线
          user: user,
        };
        this.websock.send(JSON.stringify(data));
      }
    },
    getUser() {
      let user = sessionStorage.getItem("user");
      if (user) {
        this.user = JSON.parse(user);
        this.userMap = new Map([[this.user.userId, this.user]]);
        console.log("当前用户ID", this.user.userId);
        this.initWebSocket();
      } else {
        this.postRequest("/user/getUserId").then((resp) => {
          if (resp.data.userId) {
            this.user = {
              userId: resp.data.userId,
              nickName: resp.data.userId,
            };
            this.userMap = new Map([
              [this.user.userId, this.user],
              ...this.userMap,
            ]);
            sessionStorage.setItem("user", JSON.stringify(this.user));
            console.log("当前用户ID", this.user.userId);
            this.initWebSocket();
          }
        });
      }
    },
    getUserMap() {
      this.postRequest("/user/getUserMap").then((resp) => {
        if (resp.data.userMap) {
          let userMap = new Map(Object.entries(resp.data.userMap));
          // userMap.delete(this.user.userId);
          this.userMap = new Map([...this.userMap, ...userMap]);
          // this.userMap = userMap;
          let that = this;
        }
      });
    },
  },
  created() {
    this.getUser();
    this.getUserMap();
  },
  mounted() {},
  destroyed() {
    this.websock.close(); //离开路由之后断开websocket连接
  },
};
</script>
<style lang="scss" scoped>
.dialog-box {
  width: 60%;
  height: 800px;
  border: 1px solid;
  display: inline-block;
  position: relative;
  top: 50px;
  font-size: 16px;
  // box-shadow: #66a 0px 0px 10px;
  &:hover {
    -webkit-transform: translateY(-3px);
    -ms-transform: translateY(-3px);
    transform: translateY(-3px);
    -webkit-box-shadow: 0 0 6px #999;
    box-shadow: #66a 0px 0px 10px;
    -webkit-transition: all 0.5s ease-out;
    transition: all 0.5s ease-out;
  }
  .left {
    border-right: 1px solid;
    width: 75%;
    height: 100%;
    float: left;
    .top {
      height: 5%;
      border-bottom: 1px solid;
      line-height: 35px;
    }
    .up {
      height: 60%;
      border-bottom: 1px solid;
      overflow-y: auto;
      div {
        min-height: 50px;
        line-height: 50px;
      }
      .owner {
        padding: 0 0 0 20px;
        text-align: left;
        color: #8eec68;
      }
      .other {
        padding: 0 20px 0 0;
        text-align: right;
        color: #8cb0e6;
      }
      .owner,
      .other {
        border-bottom: 1px dotted;
        span {
          margin: 0px 20px 0 0;
        }
      }
    }
    .middle {
      height: 30%;
      border-bottom: 1px solid;
      textarea {
        width: 100%;
        height: 100%;
        resize: none;
        padding: 15px;
        border: none;
      }
    }
    .down {
      button {
        float: right;
        right: 10px;
        margin: 5px 15px;
        padding: 2px 20px;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
  .right {
    display: inline-block;
    width: 25%;
    height: 100%;
    div {
      margin: 10px;
    }
    .list-1 {
      input.a-input.ant-input {
        background: #eaf5ec;
      }
      background: #eaf5ec;
    }
    .list-2 {
      input.a-input.ant-input {
        background: #f7efd2;
      }
      background: #f7efd2;
    }
    .list-1,
    .list-2 {
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>