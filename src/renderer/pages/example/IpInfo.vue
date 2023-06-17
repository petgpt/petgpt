<template>
	<button @click="proxyTest" class="btn-info btn">click to get ip info</button>
	<dialog class="modal" :class="{ 'modal-open': visible }">
		<form method="dialog" class="modal-box">
			<h3 class="text-lg font-bold">Ip信息</h3>
			<div>
				<div class="bg-info">ip info from cip.cc :</div>
				{{ ipInfoFromCip }}
			</div>
			<div>
				<div class="bg-info">ip info from ipinfo :</div>
				{{ ipInfoFromIpInfo }}
			</div>
			<div class="modal-action">
				<button class="btn">Close</button>
			</div>
		</form>
	</dialog>
</template>

<script setup lang="ts">
// 【start】----------- ip信息获取 -----------【start】
import { ref } from 'vue'
import HttpsProxyAgent from 'https-proxy-agent'
// import fetch from "node-fetch";
import { logger } from '../../utils/common'

const visible = ref(false)
const ipInfoFromCip = ref('fetching...')
const ipInfoFromIpInfo = ref('fetching...')
async function proxyTest() {
	visible.value = true
	getProxyIpInfoFromCip().then(res => {
		ipInfoFromCip.value = res
	})
	getProxyIpInfoFromIpInfo().then(res => {
		ipInfoFromIpInfo.value = JSON.stringify(res, null, 2)
	})
}
async function getProxyIpInfoFromIpInfo() {
	const fetchParam = {
		method: 'GET',
		agent: HttpsProxyAgent(import.meta.env.VITE_HTTPS_PROXY), // 短时间ip不会变，只能用HTTPS的Agent
	}
	const res = await fetch('https://ipinfo.io/json?token=', fetchParam)
	if (!res.ok) {
		const reason = await res.text()
		const msg = `error ${res.status || res.statusText}: ${reason}`
		throw new Error(msg)
	}

	let response = await res.json()

	logger(`response: `, response)
	return response
}
/**
 * 这个受clash规则的影响，也就是说rule模式，查出来是国内的ip。global就是和前面的ipinfo查出来一样
 */
async function getProxyIpInfoFromCip() {
	const fetchParam = {
		method: 'GET',
		agent: HttpsProxyAgent(import.meta.env.VITE_HTTPS_PROXY), // 短时间ip不会变，只能用HTTPS的Agent
	}
	const res = await fetch('http://cip.cc', fetchParam)
	if (!res.ok) {
		const reason = await res.text()
		const msg = `error ${res.status || res.statusText}: ${reason}`
		throw new Error(msg)
	}

	let response = await res.text()

	let first = response.indexOf('<pre>IP\t: ')
	let second = response.indexOf('</pre>')
	let ip = response.substring(first + 5, second)
	logger(ip)
	return ip
}

function handleClose() {
	visible.value = false
}
// 【end】----------- ip信息获取 -----------【end】
</script>

<style scoped lang="less"></style>
