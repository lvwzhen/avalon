/**
 * ------------------------------------------------------------
 * diff 对比新旧两个虚拟DOM树,根据directive中的diff方法为新虚拟DOM树
 * 添加change, afterChange更新钩子
 * ------------------------------------------------------------
 */
var emptyArr = []
// 防止被引用
var emptyObj = function () {
    return {
        children: [], props: {}
    }
}
var directives = avalon.directives
var rbinding = require('../seed/regexp').binding

function diff(current, previous, steps) {
    
    for (var i = 0; i < current.length; i++) {
        var cur = current[i]
        var pre = previous[i] || emptyObj()
        switch (cur.nodeType) {
            case 3:
                if (!cur.skipContent) {
                    directives.expr.diff(cur, pre, steps)
                }
                break
            case 8:
                if (cur.directive === 'for') {
                    var forDiff = directives['for'].diff(current, previous, steps, i)
                    if (forDiff === true) {
                        i = i + 1
                    }
                } else if (cur.directive) {//if widget
                    directives[cur.directive].diff(cur, pre, steps)
                }
                break
            default:
                
                if (Array.isArray(cur)) {
                    diff(cur, pre || emptyArr, steps)
                } else {
                    if (!cur.skipAttrs) {
                        diffProps(cur, pre, steps)
                    }
                    if (!cur.skipContent) {
                        diff(cur.children, pre.children || emptyArr, steps)
                    }
                }

                break
        }
    }
}

function diffProps(current, previous, steps) {
    if (current.order) {
        var directiveType
        try {
            current.order.replace(/([^;]+)/g, function (name) {
                var match = name.match(rbinding)
                var type = match && match[1]
                directiveType = type
                if (directives[type]) {
                    directives[type].diff(current, previous || emptyObj(), steps, name)
                }
                return name
            })
        } catch (e) {
            avalon.log(directiveType, e, e.message, 'diffProps error')
        }
    }


}
avalon.diffProps = diffProps
module.exports = diff
