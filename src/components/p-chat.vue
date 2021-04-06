<template>
  <div>
    <div class="dialog-box">
      <div class="left">
        <a-alert
          message="please select talk user"
          banner
          v-if="!currentDialogUser"
        />
        <div class="top" v-else>Talking with {{ currentDialogUser }}</div>
        <div class="up">
          <div
            :class="userId === item.userId ? 'owner' : 'other'"
            v-for="(item, idx) in comments"
            :key="idx"
          >
            <span>{{ item.dateTime }}</span
            >{{ item.talkContent }}
          </div>
        </div>
        <div class="middle">
          <textarea
            v-model="talkContent"
            autofocus
            @keydown.enter="handleSubmit"
          />
        </div>
        <div class="down">
          <button @click="handleSubmit">send</button>
        </div>
      </div>
      <div class="right">
        <div class="">Talk List</div>
        <div
          :class="(idx + 1) % 2 !== 0 ? 'list-1' : 'list-2'"
          v-for="(item, idx) in userList"
          :key="item"
          @click="selectUser(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import {
//   smileEmoji,
//   CEmoji,
//   DisplayInfoWithEmoji,
//   EmojiItem,
//   convertEmoji2Str,
//   convertStr2Emoji,
// } from "w-vue-emoji";
import dateUitls from "@/util/utils.js";
export default {
  name: "PChat",
  components: {
    // CEmoji,
    // DisplayInfoWithEmoji,
    // EmojiItem,
  },
  data() {
    return {
      comments: [],
      talkContent: "",
      websock: null,
      userId: null,
      userList: [],
      currentDialogUser: null,
    };
  },
  methods: {
    handleSubmit() {
      if (!this.currentDialogUser) {
        return;
      }
      if (!this.talkContent.trim()) {
        return;
      }

      let talkContent = this.talkContent;
      let talkData = {
        userId: this.userId, // 发送者
        currentDialogUser: this.currentDialogUser, // 接收者
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
      const wsuri = "ws://127.0.0.1:9001/websocket/" + this.userId;
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen() {
      //连接建立之后执行send方法发送数据
    },
    websocketonerror() {
      //连接建立失败重连
      this.initWebSocket();
    },
    websocketonmessage(e) {
      //数据接收
      const redata = JSON.parse(e.data);
      this.currentDialogUser = redata.sendId;
      this.comments.push({
        userId: redata.sendId,
        talkContent: redata.talkContent,
        dateTime: redata.dateTime,
      });
    },
    websocketsend(data) {
      //数据发送
      this.comments.push({
        userId: this.userId,
        talkContent: this.talkContent,
        dateTime: dateUitls.simpleDateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
      this.websock.send(data);
      this.talkContent = "";
    },
    websocketclose(e) {
      //关闭
      console.log("断开连接", e);
    },
    selectUser(user) {
      this.currentDialogUser = user;
    },
    getUserId() {
      this.userId = sessionStorage.getItem("userId");
      console.log(this.userId);
      if (!this.userId) {
        this.postRequest("/user/getUserId", { userId: this.userId }).then(
          (resp) => {
            if (resp.data.userId) {
              this.userId = resp.data.userId;
              sessionStorage.setItem("userId", this.userId);
              this.initWebSocket();
            }
          }
        );
      } else {
        this.initWebSocket();
      }
    },
    getUserList() {
      this.postRequest("/user/getUserList").then((resp) => {
        if (resp.data.userList) {
          let userList = [];
          for (let userId of resp.data.userList) {
            if (userId !== this.userId) {
              userList.push(userId);
            }
          }
          this.userList = userList;
        }
      });
    },
  },
  created() {
    this.getUserId();
    this.getUserList();
  },
  destroyed() {
    // this.websock.close(); //离开路由之后断开websocket连接
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
      background: #eaf5ec;
    }
    .list-2 {
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
</style> scoped>

</style>