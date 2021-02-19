import { isNotBlankString, isNullOrUndefined } from '@/utils/validator'
import { randomInt } from '@/utils/core'
import { assertPositiveInteger } from '@/utils/validator/assert'

export function resolveDialogWidth(widthInDesktop, widthInMobile = '95%') {
  return window.innerWidth > 1200 ? widthInDesktop : widthInMobile
}

export function resolveDynamicRatioWidth(fixedWidthPixels) {
  const pixelsIntValue = parseIntValueFromPixelsStr(fixedWidthPixels)
  const ratio = Math.min(95, pixelsIntValue * 100 / window.innerWidth)
  return ratio.toFixed(0) + '%'
}

export function parseIntValueFromPixelsStr(pixelsStr) {
  return parseInt(pixelsStr.slice(0, -2))
}

export function resolveDialogMarginTop(mobileMarginTop, desktopMarginTop = '15vh') {
  return window.innerWidth < 1200 ? mobileMarginTop : desktopMarginTop
}

export function needPageFooter() {
  return process.env.VUE_APP_FOOTER_INFO_COPYRIGHT ||
    process.env.VUE_APP_FOOTER_INFO_ICP_BEIAN ||
    process.env.VUE_APP_FOOTER_INFO_POLICE_BEIAN
}

export function bytesToHumanReadableSize(bytes) {
  if (!bytes) {
    return "0 B";
  }
  const k = 1024,
    unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  const fractionDigits = i > 2 ? 1 : 0;
  return (bytes / Math.pow(k, i)).toFixed(fractionDigits) + " " + unit[i];
}

export function secondsToHour(totalSeconds) {
  if (totalSeconds === undefined || totalSeconds === null) {
    return "--:--:--";
  } else if (totalSeconds <= 0) {
    return "00:00:00";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  let seconds = totalSeconds - (hours * 3600) - (minutes * 60);
  seconds = Math.round(seconds * 100) / 100;  // round seconds

  let result = (hours < 10 ? "0" + hours : hours);
  result += ":" + (minutes < 10 ? "0" + minutes : minutes);
  result += ":" + (seconds < 10 ? "0" + seconds : seconds);
  return result;
}

export function convertByRatio(originalValue, convertionRatio) {
  assertPositiveInteger(convertionRatio, "单位换算比率");
  return originalValue / convertionRatio;
}

export function convertCentsToYuan(originalValue) {
  return convertByRatio(originalValue, 100).toFixed(2);
}

export function convertGramsToKilogram(originalValue) {
  return convertByRatio(originalValue, 1000);
}

export function convertObjectByMapper(obj, mapper) {
  const result = {};
  const entries = Object.entries(mapper);
  for (const [key, value] of entries) {
    result[value] = obj[key];
  }
  return result;
}

export function convertObjectArrayByMapper(objArray, mapper) {
  const result = [];

  for (const obj of objArray) {
    const entries = Object.entries(mapper);
    const newObj = {};
    for (const [key, value] of entries) {
      newObj[value] = obj[key];
    }
    result.push(newObj);
  }

  return result;
}

export function isObjectValuesAllNullOrUndefined(obj) {
  const values = Object.values(obj);
  for (const value of values) {
    if (!isNullOrUndefined(value)) {
      return false;
    }
  }
  return true;
}

export function firstNonBlankString(defaultValue, ...args) {
  return args.find(arg => isNotBlankString(arg)) || defaultValue;
}

export function genRandomString(prefix) {
  return (prefix || "random") + "-" + randomInt(10000);
}
