import {
  isArray,
  isBoolean,
  isObject,
  isFunction,
  isInteger,
  isNumber,
  isNormalIntegerString,
  isNotBlankString,
  isNullOrUndefined,
} from '@/utils/validator'

function throwError(errorMsg, logPrefix) {
  let fullErrorMsg = isNullOrUndefined(logPrefix) ? errorMsg : logPrefix + errorMsg
  throw new Error(fullErrorMsg)
}

export function assertTrue(condition, errorMsg) {
  if (!isBoolean(condition)) {
    throwError('condition must be type of Boolean')
  }
  if (!condition) {
    throwError(errorMsg)
  }
}

export function assertNotBlankString(value, paramName) {
  assertTrue(isNotBlankString(value), paramName + ' 必须为字符串类型且不能为空')
}

export function assertNotNullObject(value, paramName) {
  assertTrue(isObject(value), paramName + ' 必须为对象类型且不能为 null 或 undefined')
}

export function assertNormalIntegerString(value, paramName) {
  assertTrue(isNormalIntegerString(value), paramName + ' 必须为整数类型的字符串且不能为空')
}

export function assertNotNullNumber(value, paramName) {
  assertTrue(isNumber(value), paramName + ' 必须为数值类型且不能为 null 或 undefined')
}

export function assertNotNullArray(value, paramName) {
  assertTrue(isArray(value), paramName + ' 必须为数组类型且不能为 null 或 undefined')
}

export function assertNotEmptyArray(value, paramName) {
  assertTrue(isArray(value) && value.length > 0, paramName + ' 必须为数组类型且不能为 空数组 或 null 或 undefined')
}

export function assertNotNullBoolean(value, paramName) {
  assertTrue(isBoolean(value), paramName + ' 必须为 boolean 类型且不能为 null 或 undefined')
}

export function assertNotNullOrUndefined(value, paramName) {
  assertTrue(!isNullOrUndefined(value), paramName + ' 不能为 null 或 undefined')
}

export function assertInteger(value, paramName) {
  assertTrue(isInteger(value), paramName + ' 必须为整数类型')
}

export function assertPositiveInteger(value, paramName) {
  assertTrue(isInteger(value) && value > 0, paramName + ' 必须为正整数')
}

export function assertNegativeInteger(value, paramName) {
  assertTrue(isInteger(value) && value < 0, paramName + ' 必须为负整数')
}

export function assertNonPositiveInteger(value, paramName) {
  assertTrue(isInteger(value) && value <= 0, paramName + ' 必须为非正整数')
}

export function assertNonNegativeInteger(value, paramName) {
  assertTrue(isInteger(value) && value >= 0, paramName + ' 必须为非负整数')
}

export function assertFunction(value, paramName) {
  assertTrue(isFunction(value), paramName + ' 必须为函数类型')
}

