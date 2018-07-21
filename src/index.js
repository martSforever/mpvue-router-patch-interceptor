/*
*   creator:      weishengjian
*   time:         2018.7.15  16:41
*/

import MpvueRouterPatch from 'mpvue-router-patch'

let $router;                                  //mpvue-router-patch插件注册的$router对象
let $push;                                    //mpvue-router-patch插件注册的$router.push方法
let everyMiddlewares = [];                    //全局中间件，拦截所有路由跳转
let matchMiddlewares = {};                    //路由地址匹配中间件，key为匹配路径的正则表达式字符串、value为中间件数组

/*
* 页面跳转中间件，执行页面跳转动作
*/
async function pushMiddware(...args) {
    // console.log('into original push middlewares')
    $push(...args);
}

/*
* 合并异步中间件方法
*/
function compose(middlewares) {               //异步中间件同步方法
    return function (...args) {
        function dispatch(i) {
            let fn = middlewares[i];
            if (!fn) {
                return Promise.resolve();
            }
            else {
                return Promise.resolve(fn(
                    ...args,
                    function next() {
                        return dispatch(i + 1)
                    }
                ))
            }
        }

        return dispatch(0);
    }
}

function getMatchMiddlewares(path) {
    let ret = [];
    for (let regexp in matchMiddlewares) {
        // console.log(regexp, path, new RegExp(regexp).test(path))
        if (new RegExp(regexp).test(path))
            ret.pushArray(matchMiddlewares[regexp])
    }
    return ret;
}

let MpvueRouterPatchInterceptor = {
    install(Vue, {every, match}) {
        Vue.use(MpvueRouterPatch);
        console.log('Vue.prototype.$router', Vue.prototype.$router)
        $router = Vue.prototype.$router
        $push = $router.push
        everyMiddlewares.pushArray(every)
        matchMiddlewares = Object.assign({}, match)

        /*重写mpvue-router-patch的$router.push方法*/
        $router.push = async (...args) => {
            // console.log('push start-->>', args)
            let option = typeof args[0] === 'string' ? {path: args[0]} : args[0]
            let fn = compose(everyMiddlewares.concat(getMatchMiddlewares(option.path)).concat([pushMiddware]));
            fn(option);
            // console.log('push end')
        }
    },
    every(everyMiddleware) {
        everyMiddlewares.push(everyMiddleware)
    },
    match(regexp, middleware) {
        (!matchMiddlewares[regexp]) && (matchMiddlewares[regexp] = [])
        matchMiddlewares[regexp].push(middleware)
    },
}

export default MpvueRouterPatchInterceptor
