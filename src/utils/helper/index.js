
export function resolveDialogWidth(widthInDesktop, widthInMobile = '95%') {
  return window.innerWidth > 1200 ? widthInDesktop : widthInMobile
}

export function resolveDialogMarginTop(mobileMarginTop, desktopMarginTop = '15vh') {
  return window.innerWidth < 1200 ? mobileMarginTop : desktopMarginTop
}

export function needPageFooter() {
  return process.env.VUE_APP_FOOTER_INFO_COPYRIGHT || process.env.VUE_APP_FOOTER_INFO_BEIAN
}
