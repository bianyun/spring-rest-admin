/**
var expr1 = new Expr('#realname').or('#keyword');
var expr2 = new Expr('#birthday1').and('#birthday2');
var expr = new Expr('[name="dep.id"]').and(expr1).or('#realname').or('#keyword').or(expr2).or('x=1', true);
var result = Expr.eval(expr);
*/
export function Expr(expr) {
    this.value = Expr.eval(expr);

    /**
     * 表达式追加 && 关系
     * @param  {String | Expr} expr [表达式或者css选择器]
     * @param  {Boolean} flag [当值为true时，表明expr参数本身为表达式]
     * @return {Expr}
     */
    this.and = function(expr, flag = false) {
        const res = flag ? expr : Expr.eval(expr);
        if (res) {
            if (this.value) {
                this.value += ' && ' + res;
            } else {
                this.value = res;
            }
        }
        return this;
    }

    /**
     * 表达式追加 || 关系
     * @param  {String} expr [表达式或者css选择器]
     * @param  {Boolean} flag [当值为true时，表明expr参数本身为表达式]
     * @return {Expr}
     */
    this.or = function(expr, flag) {
        const res = flag ? expr : Expr.eval(expr);
        if (res) {
            if (this.value) {
                this.value += ' || ' + res;
            } else {
                this.value = res;
            }
        }
        return this;
    }
}

Expr.eval = function(expr) {
    if (!expr) {
        return '';
    }
    if (expr.constructor === Expr) {
        return expr.value ? '(' + expr.value + ')' : '';
    }

    const getbaseexp = function(el) {
        if (hasClass(el, "date-range-picker")) {
            return evalDateRangePicker(el);
        } else if (hasClass(el, "year-month-range-picker")) {
            return evalYearMonthRangePicker(el);
        } else if (el.type === "select-one") {
            return evalSelectOneExprs(el);
        } else if (el.value && el.type==='text' && el.getAttribute("or-names")) {
            return evalMultiOrColumnExprs(el);
        } else if (el.name && (el.value || el.getAttribute("selectedValue"))) {
            const elemValue = el.getAttribute("selectedValue") || el.value

            let extraOrCondition = el.getAttribute("extraOrCondition");
            if (extraOrCondition) {
                return `(${el.name} ${el.getAttribute('op') || '='} '${elemValue}' || ${extraOrCondition})`;
            } else {
                return `${el.name} ${el.getAttribute('op') || '='} '${elemValue}'`;
            }
        }
        return '';
    };
    const evalSelectOneExprs = function(elem) {
        if (elem.type !== "select-one" || !elem.name || elem.selectedIndex <= 0) {
            return '';
        }

        let extraOrCondition = elem.getAttribute("extraOrCondition");
        let value = elem.options[elem.selectedIndex].value;

        let result;
        if (extraOrCondition) {
            result = `(${elem.name} ${elem.getAttribute('op') || '='} '${value}' || ${extraOrCondition})`;
        } else {
            result = `${elem.name} ${elem.getAttribute('op') || '='} '${value}'`;
        }
        return result;
    };

    const evalMultiOrColumnExprs = function (elem) {
        let pieces = elem.getAttribute("or-names").split(/\s*,\s*/);
        pieces = pieces.filter(function (piece) {
            return piece.trim() !== "";
        });
        let exprArr = [];
        for (let piece of pieces) {
            exprArr.push(`${piece} ${elem.getAttribute('op') || '='} '${elem.value}'`);
        }
        let resultExpr = '';
        if (exprArr.length > 0) {
            resultExpr += `(${exprArr.join(' || ')})`;
        }
        return resultExpr;
    };
    const evalDateRangePicker = function(elem) {
        const elemId = elem.id
        if (elemId) {
            const startValue = elem.querySelector("div.start-date input[type='text']").value;
            const endValue = elem.querySelector("div.end-date input[type='text']").value;
            if (startValue && endValue) {
                return `${elemId} >= '${startValue} 00:00:00' && ${elemId} <= '${endValue} 23:59:59.999'`;
            } else if (startValue && !endValue) {
                return `${elemId} >= '${startValue} 00:00:00'`;
            } else if (!startValue && endValue) {
                return `${elemId} <= '${endValue} 23:59:59.999'`;
            }
        }
        return '';
    };
    const evalYearMonthRangePicker = function(elem) {
        const elemId = elem.id
        if (elemId) {
            const startValue = elem.querySelector("div.start-year-month input[type='text']").value.replace("-", "");
            const endValue = elem.querySelector("div.end-year-month input[type='text']").value.replace("-", "");

            if (startValue && endValue) {
                return `${elemId} >= '${startValue}' && ${elemId} <= '${endValue}'`;
            } else if (startValue && !endValue) {
                return `${elemId} >= '${startValue}'`;
            } else if (!startValue && endValue) {
                return `${elemId} <= '${endValue}'`;
            }
        }
        return '';
    };
    const hasClass = (function(){
        const div = document.createElement("div") ;
        if( "classList" in div && typeof div.classList.contains === "function" ) {
            return function(elem, className){
                return elem.classList.contains(className);
            } ;
        } else {
            return function(elem, className){
                const classes = elem.className.split(/\s+/) ;
                for(let i= 0 ; i < classes.length ; i ++) {
                    if( classes[i] === className ) {
                        return true ;
                    }
                }
                return false ;
            } ;
        }
    })() ;

    let res = '';
    const els = document.querySelectorAll(expr);

    switch (els.length) {
        case 0: // 选取的元素不存在
            // throw new Error(`选择器 ${expr} 不存在`);
            break;
        case 1: // 单个元素
            res = getbaseexp(els[0]);
            break;
        default: {
            let arr = [];
            for (let i = 0, el; (el = els[i]); i++) {
                if (!el.name || ((el.type === 'radio' || el.type === 'checkbox') && !el.checked)) {
                    continue;
                }
                arr.push(getbaseexp(el));
            }
            arr = arr.filter(item => item && item.trim() !== "");
            if (arr.length) {
                res += `(${arr.join(' || ')})`;
            }
        }
    }
    return res;
}
