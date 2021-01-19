import { hasPerm } from '@/utils/permission'

function checkPermission(el, binding) {
  const { value } = binding

  if (value) {
    if (!hasPerm(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`指令 v-perm 的取值不能为空"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
