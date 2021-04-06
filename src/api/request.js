import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

let baseURL = '/api/';

let getAxios = Vue.axios.create({
  method: 'GET',
  baseURL: baseURL,
})

let postAxios = Vue.axios.create({
  method: 'POST',
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' }
})

export let getRequest = function (url, data) {
  return getAxios({ url, params: { ...data } });
}

export let postRequest = function (url, data) {
  return postAxios({ url, data: { ...data } })
}
