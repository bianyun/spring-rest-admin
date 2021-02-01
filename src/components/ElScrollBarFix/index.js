import ElScrollBarFix from './src/main';

/* istanbul ignore next */
ElScrollBarFix.install = function(Vue) {
  Vue.component(ElScrollBarFix.name, ElScrollBarFix);
};

export default ElScrollBarFix;
