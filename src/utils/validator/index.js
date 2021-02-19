import axis from 'axis.js'

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function isArray(param) {
  return Array.isArray(param)
}

export function isObject(param) {
  // noinspection JSUnresolvedFunction
  return axis.isObject(param)
}

export function isString(param) {
  return param && typeof param.valueOf() === 'string'
}

export function isDate(param) {
  // noinspection JSUnresolvedFunction
  return axis.isDate(param)
}

export function isRegExp(param) {
  // noinspection JSUnresolvedFunction
  return axis.isRegExp(param)
}

export function isFunction(param) {
  return param && typeof param === 'function'
}

export function isBoolean(param) {
  // noinspection JSUnresolvedFunction
  return axis.isBoolean(param)
}

export function isBooleanTrue(param) {
  // noinspection JSUnresolvedFunction
  return axis.isBoolean(param) && param
}

export function isBooleanFalse(param) {
  // noinspection JSUnresolvedFunction
  return axis.isBoolean(param) && !param
}

export function isNumber(param) {
  // noinspection JSUnresolvedFunction
  return axis.isNumber(param)
}

export function isInteger(param) {
  return Number.isInteger(param)
}

export function isNullOrUndefined(param) {
  return param === null || param === undefined
}


export function isPositiveInteger(param) {
  return isInteger(param) && param > 0
}

export function isNegativeInteger(param) {
  return isInteger(param) && param < 0
}

export function isNormalInteger(param) {
  return isInteger(param) && param >= 0
}

export function isNormalIntegerString(param) {
  const n = Math.floor(Number(param))
  return n !== Infinity && String(n) === param && n >= 0
}

export function isIntegerString(param) {
  return isString(param) && /^((0)|([+-]?[1-9]\d*))$/.test(param)
}

export function isPositiveIntegerString(param) {
  return isString(param) && /^[+]?[1-9]\d*$/.test(param)
}

export function isNegativeIntegerString(param) {
  return isString(param) && /^-[1-9]\d*$/.test(param)
}

export function isNumberString(param) {
  return isFloatString(param) || isIntegerString(param)
}

export function isNegativeNumberString(param) {
  return isNegativeFloatString(param) || isNegativeIntegerString(param)
}

export function isPositiveNumberString(param) {
  return isPositiveFloatString(param) || isPositiveIntegerString(param)
}

export function isFloatString(param) {
  return isPositiveFloatString(param) || isNegativeFloatString(param) || isZeroFloatString(param)
}

export function isZeroFloatString(param) {
  return isString(param) && /^0\.0+$/.test(param)
}

export function isPositiveFloatString(param) {
  return isString(param) && /^[+]?(0\.((\d*[1-9])|([1-9]\d*)))|([1-9]\d*\.\d+)$/.test(param)
}

export function isNegativeFloatString(param) {
  return isString(param) && /^-(0\.((0[1-9]+)|([1-9]\d*)))|([1-9]\d*\.\d+)$/.test(param)
}

export function isBooleanString(param) {
  return isString(param) && /^((true)|(TRUE)|(True)|(false)|(FALSE)|(False))$/.test(param)
}

export function isEmptyObject(param) {
  return isObject(param) && JSON.stringify(param) === '{}'
}

export function isEmptyArray(param) {
  return isArray(param) && param.length === 0
}

export function isNotEmptyArray(param) {
  return isArray(param) && param.length > 0
}

export function isBlankString(param) {
  return isString(param) && param.trim() === ''
}

export function isBooleanStringTrue(param) {
  return isString(param) && /^((true)|(TRUE)|(True))$/.test(param)
}

export function isBooleanStringFalse(param) {
  return isString(param) && /^((false)|(FALSE)|(False))$/.test(param)
}

export function isNotBlankString(param) {
  return isString(param) && param.trim() !== ''
}

export function isJsonString(param) {
  try {
    JSON.parse(param)
    return true
  } catch (err) {
    return false
  }
}
