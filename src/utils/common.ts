import { isReactive, isRef, toRaw, unref } from 'vue'
import {IStringKeyMap, SendResponseOptions} from "./types/types";

export const getRawData = (args: any): any => {
    if (Array.isArray(args)) {
        const data = args.map((item: any) => {
            if (isRef(item)) {
                return unref(item)
            }
            if (isReactive(item)) {
                return toRaw(item)
            }
            return getRawData(item)
        })
        return data
    }
    if (typeof args === 'object') {
        const data = {} as IStringKeyMap
        Object.keys(args).forEach(key => {
            const item = args[key]
            if (isRef(item)) {
                data[key] = unref(item)
            } else if (isReactive(item)) {
                data[key] = toRaw(item)
            } else {
                data[key] = getRawData(item)
            }
        })
        return data
    }
    return args
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isNumber<T extends number>(value: T | unknown): value is number {
    return Object.prototype.toString.call(value) === '[object Number]'
}

export function isString<T extends string>(value: T | unknown): value is string {
    return Object.prototype.toString.call(value) === '[object String]'
}

export function isNotEmptyString(value: any): boolean {
    return typeof value === 'string' && value.length > 0
}

export function isBoolean<T extends boolean>(value: T | unknown): value is boolean {
    return Object.prototype.toString.call(value) === '[object Boolean]'
}

export function isFunction<T extends (...args: any[]) => any | void | never>(value: T | unknown): value is T {
    return Object.prototype.toString.call(value) === '[object Function]'
}

export function sendResponse<T>(options: SendResponseOptions<T>) {
    if (options.type === 'Success') {
        return Promise.resolve({
            message: options.message ?? null,
            data: options.data ?? null,
            status: options.type,
        })
    }

    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
        message: options.message ?? 'Failed',
        data: options.data ?? null,
        status: options.type,
    })
}
