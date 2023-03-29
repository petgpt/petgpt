import { defineStore } from "pinia";
import {sleep} from "../utils/common";

interface TitleState {
    title: string
}

export const useTitleStore = defineStore('title', {
    state: (): TitleState => ({
        title: ''
    }),
    getters: {// 类似computed
        getTitle: (state): string => state.title,
        getTitle2(): string {
            return this.title; // 可以使用 this 访问整个store实例
        },
    },
    actions: {// 同步异步都可以
        async changeTitleAsync(name: string): Promise<void> {
            this.title = name
            await sleep(1000);
        },
        changeTitle(name: string): void {
            this.title = 'title!!!'
        },
    }
});
