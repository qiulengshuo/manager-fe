/**
 * 工具函数封装
 */
export default {
  formateDate(date, rule) {
    let fmt = rule || 'yyyy-MM-dd hh:mm:ss';
    // 年份特殊处理，肯定有四位
    const regY = /(y+)/;
    if (regY.test(fmt)) {
      fmt = fmt.replace(regY, date.getFullYear());
    }
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
    };
    for (const k in o) {
      const reg = new RegExp(`(${k})`);
      if (reg.test(fmt)) {
        const val = o[k] + '';
        // 其他格式按传入的来，否则一位默认在前面加0
        fmt = fmt.replace(reg, (res, $1) => {
          return $1.length === 1 ? val : ('00' + val).slice(val.length);
        });
      }
    }
    return fmt;
  },
  generateRoute(menuList) {
    const routes = [] as any;
    const deepList = (list) => {
      while (list.length) {
        const item = list.pop();
        if (item.action) {
          routes.push({
            name: item.component,
            path: item.path,
            meta: {
              title: item.menuName,
            },
            component: item.component,
          });
        }
        if (item.children && !item.action) {
          deepList(item.children);
        }
      }
    };
    deepList(menuList);
    return routes;
  },
};
