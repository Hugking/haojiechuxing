// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  let startname = event.startname
  let endname = event.endname
  let night = event.night
  let cost = null;
  const fun20_15 = () => {if (night) { cost = 20; } else { cost = 15; }; if (cost) { cost = cost.toString(); return {cost: cost } } else { cost = null; return { cost: cost }}}
  const funnull_70 = () => { if (night) { cost = null; } else { cost = 70; }; if (cost) { cost = cost.toString(); return { cost: cost } } else { cost = null; return { cost: cost } } }
  const funnull_75 = () => { if (night) { cost = null; } else { cost = 75; }; if (cost) { cost = cost.toString(); return { cost: cost } } else { cost = null; return { cost: cost } } }
  const funnull_80 = () => { if (night) { cost = null; } else { cost = 80; }; if (cost) { cost = cost.toString(); return { cost: cost } } else { cost = null; return { cost: cost } } }
  const fun105_85 = () => { if (night) { cost = 105; } else { cost = 85; }; if (cost) { cost = cost.toString(); return { cost: cost } } else { cost = null; return { cost: cost } } }
  const actions = new Map([
    [{ startname: "平顶山学院", endname: "平顶山站" }, fun20_15()],
    [{ startname: "平顶山学院", endname: "平顶山汽车站" }, fun20_15()],
    [{ startname: "平顶山学院", endname: "平顶山长途汽车站" }, fun20_15()],
    [{ startname: "平顶山学院", endname: "平顶山西站" }, fun20_15()],
    [{ startname: "平顶山学院", endname: "郑州地铁站" }, funnull_70()],
    [{ startname: "平顶山学院", endname: "漯河西站" }, funnull_70()],
    [{ startname: "平顶山学院", endname: "许昌东站" }, funnull_75()],
    [{ startname: "平顶山学院", endname: "郑州站" }, funnull_80()],
    [{ startname: "平顶山学院", endname: "郑州东站" }, fun105_85()],
    [{ startname: "平顶山学院", endname: "郑州新郑国际机场" }, fun105_85()],
    [{ startname: "平顶山学院医学院", endname: "平顶山站" }, fun20_15()],
    [{ startname: "平顶山学院医学院", endname: "平顶山汽车站" }, fun20_15()],
    [{ startname: "平顶山学院医学院", endname: "平顶山长途汽车站" }, fun20_15()],
    [{ startname: "平顶山学院医学院", endname: "平顶山西站" }, fun20_15()],
    [{ startname: "平顶山学院医学院", endname: "郑州地铁站" }, funnull_70()],
    [{ startname: "平顶山学院医学院", endname: "漯河西站" }, funnull_70()],
    [{ startname: "平顶山学院医学院", endname: "许昌东站" }, funnull_75()],
    [{ startname: "平顶山学院医学院", endname: "郑州站" }, funnull_80()],
    [{ startname: "平顶山学院医学院", endname: "郑州东站" }, fun105_85()],
    [{ startname: "平顶山学院医学院", endname: "郑州新郑国际机场" }, fun105_85()],
    [{ startname: "河南城建学院西门", endname: "平顶山站" }, fun20_15()],
    [{ startname: "河南城建学院西门", endname: "平顶山汽车站" }, fun20_15()],
    [{ startname: "河南城建学院西门", endname: "平顶山长途汽车站" }, fun20_15()],
    [{ startname: "河南城建学院西门", endname: "平顶山西站" }, fun20_15()],
    [{ startname: "河南城建学院西门", endname: "郑州地铁站" }, funnull_70()],
    [{ startname: "河南城建学院西门", endname: "漯河西站" }, funnull_70()],
    [{ startname: "河南城建学院西门", endname: "许昌东站" }, funnull_75()],
    [{ startname: "河南城建学院西门", endname: "郑州站" }, funnull_80()],
    [{ startname: "河南城建学院西门", endname: "郑州东站" }, fun105_85()],
    [{ startname: "河南城建学院西门", endname: "郑州新郑国际机场" }, fun105_85()],
    [{ startname: "河南城建学院北门", endname: "平顶山站" }, fun20_15()],
    [{ startname: "河南城建学院北门", endname: "平顶山汽车站" }, fun20_15()],
    [{ startname: "河南城建学院北门", endname: "平顶山长途汽车站" }, fun20_15()],
    [{ startname: "河南城建学院北门", endname: "平顶山西站" }, fun20_15()],
    [{ startname: "河南城建学院北门", endname: "郑州地铁站" }, funnull_70()],
    [{ startname: "河南城建学院北门", endname: "漯河西站" }, funnull_70()],
    [{ startname: "河南城建学院北门", endname: "许昌东站" }, funnull_75()],
    [{ startname: "河南城建学院北门", endname: "郑州站" }, funnull_80()],
    [{ startname: "河南城建学院北门", endname: "郑州东站" }, fun105_85()],
    [{ startname: "河南城建学院北门", endname: "郑州新郑国际机场" }, fun105_85()],
    [{ startname: "平顶山站", endname: "平顶山学院" }, fun20_15()],
    [{ startname: "平顶山站", endname: "平顶山学院医学院" }, fun20_15()],
    [{ startname: "平顶山站", endname: "河南城建学院西门" }, fun20_15()],
    [{ startname: "平顶山站", endname: "河南城建学院北门" }, fun20_15()],
    [{ startname: "平顶山长途汽车站", endname: "平顶山学院" }, fun20_15()],
    [{ startname: "平顶山长途汽车站", endname: "平顶山学院医学院" }, fun20_15()],
    [{ startname: "平顶山长途汽车站", endname: "河南城建学院西门" }, fun20_15()],
    [{ startname: "平顶山长途汽车站", endname: "河南城建学院北门" }, fun20_15()],
    [{ startname: "平顶山汽车站", endname: "平顶山学院" }, fun20_15()],
    [{ startname: "平顶山汽车站", endname: "平顶山学院医学院" }, fun20_15()],
    [{ startname: "平顶山汽车站", endname: "河南城建学院西门" }, fun20_15()],
    [{ startname: "平顶山汽车站", endname: "河南城建学院北门" }, fun20_15()],
    [{ startname: "平顶山西站", endname: "平顶山学院" }, fun20_15()],
    [{ startname: "平顶山西站", endname: "平顶山学院医学院" }, fun20_15()],
    [{ startname: "平顶山西站", endname: "河南城建学院西门" }, fun20_15()],
    [{ startname: "平顶山西站", endname: "河南城建学院北门" }, fun20_15()],
    [{ startname: "郑州东站", endname: "平顶山学院" }, fun105_85()],
    [{ startname: "郑州东站", endname: "平顶山学院医学院" }, fun105_85()],
    [{ startname: "郑州东站", endname: "河南城建学院西门" }, fun105_85()],
    [{ startname: "郑州东站", endname: "河南城建学院北门" }, fun105_85()],
    [{ startname: "郑州新郑国际机场", endname: "平顶山学院" }, fun105_85()],
    [{ startname: "郑州新郑国际机场", endname: "平顶山学院医学院" }, fun105_85()],
    [{ startname: "郑州新郑国际机场", endname: "河南城建学院西门" }, fun105_85()],
    [{ startname: "郑州新郑国际机场", endname: "河南城建学院北门" }, fun105_85()],
    [{ startname: "郑州地铁站", endname: "平顶山学院" }, funnull_70()],
    [{ startname: "郑州地铁站", endname: "平顶山学院医学院" }, funnull_70()],
    [{ startname: "郑州地铁站", endname: "河南城建学院西门" }, funnull_70()],
    [{ startname: "郑州地铁站", endname: "河南城建学院北门" }, funnull_70()],
    [{ startname: "漯河西站", endname: "平顶山学院" }, funnull_70()],
    [{ startname: "漯河西站", endname: "平顶山学院医学院" }, funnull_70()],
    [{ startname: "漯河西站", endname: "河南城建学院西门" }, funnull_70()],
    [{ startname: "漯河西站", endname: "河南城建学院北门" }, funnull_70()],
    [{ startname: "郑州站", endname: "平顶山学院" }, funnull_80()],
    [{ startname: "郑州站", endname: "平顶山学院医学院" }, funnull_80()],
    [{ startname: "郑州站", endname: "河南城建学院西门" }, funnull_80()],
    [{ startname: "郑州站", endname: "河南城建学院北门" }, funnull_80()],
    [{ startname: "许昌东站", endname: "平顶山学院" }, funnull_75()],
    [{ startname: "许昌东站", endname: "平顶山学院医学院" }, funnull_75()],
    [{ startname: "许昌东站", endname: "河南城建学院西门" }, funnull_75()],
    [{ startname: "许昌东站", endname: "河南城建学院北门" }, funnull_75()],
  ])
  let action = [...actions].filter(([key, value]) => (key.startname == startname && key.endname == endname))
  return {
    event,
    action
  }
}