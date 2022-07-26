# 人体存在传感器

## 更新说明

2022年7月25日: 初次上传, bug多多

## 概述

本项目制作一个人体存在传感器, 以合宙ESP32-C3开发板和海凌科LD2410 24G雷达为核心, 可用于检测空间内是否走动或者静坐的人体.进而通过 MQTT 发送给 Home Assistant(以下简称HA), 与全屋其它智能家居联动.

### 特色说明 

相较于市面上相对便宜的人体移动传感器, 当您蹲坑, 玩手机, 玩电脑的时候, 它依旧能够检测到, 通过合理的设置, 它可以完美的做到"人来灯亮, 人走灯灭".

相较于市面上其它的人体存在传感器, 该设备在正式使用之前有一个"环境测定"的过程, 即在正式使用之前, 需要测试安静状态以及各种典型场景下的能量分布, 并因此设定阈值和延时参数. 进而达到最好的使用体验. 相应的, 这也是一种比较 geek 的玩法.

### 制作要求

本教程非保姆级教程, 因此制作本设备需要具备以下条件或技能:

- 基本的焊接技能: 设备制作过程中需要焊线和0603的电阻
- esp32程序的烧录: 程序基于platformIO 开发, 需要用vscode烧录
- 家里部署有HA控制中心, 并且知晓MQTT的使用方式.

如果以上技能点您均有涉猎, 并且想拥有一个成本又低(相对于市面上动辄2 300的人体存在传感器)自定义程度又高的人体存在传感器. 那么就接着往下看, 跟我一起制作吧. 相信在经历过最初的几个bug之后, 您会忍不住多做几个, 然后每个房间都放一个哦.

## 制作过程

### 材料准备

制作的bom清单如下

| 序号 | 物料名             | 数量 | 购买链接                                                     | 备注                                                         |
| ---- | ------------------ | ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | 合宙ESP32-C3开发板 | 1    | https://item.taobao.com/item.htm?spm=a1z09.2.0.0.2aec2e8dbS5kTJ&id=666974425430&_u=nb2r1tt4ddf | 如果是第一个建议购买标准版, 方便调试bug. 后续即可用简约版, 可以省3块钱 |
| 2    | LD2410 雷达模组    | 1    | https://detail.tmall.com/item.htm?id=676636157827&spm=a1z09.2.0.0.2aec2e8dbS5kTJ&_u=nb2r1ttcb52&skuId=5032266170747 | 如果只购买一个建议买带线版, 贵3块钱, 但是就不用买下面的线了  |
| 3    | 5pin 1.27排线      | 1    | https://item.taobao.com/item.htm?spm=a230r.1.14.58.6e8a313dAzXlvx&id=522088093369&ns=1&abbucket=14#detail |                                                              |
| 4    | 510K 0603 电阻     | 1    | https://item.taobao.com/item.htm?spm=a230r.1.14.23.3c594f192LvJEv&id=632537083461&ns=1&abbucket=14#detail |                                                              |
| 5    | GL5528 光敏电阻    | 1    | https://item.taobao.com/item.htm?spm=a1z09.2.0.0.2aec2e8dbS5kTJ&id=650736922312&_u=nb2r1tt5af2 | 一起买10个也就一块钱                                         |
| 6    | 10cm长细导线       | 2    |                                                              | 家里有啥剪啥                                                 |

以上链接仅为推荐链接, 旨在说明物料内容, 强烈建议自行比价, 寻找价格最低的购买

### 硬件连接

1. 用510K 0603电阻连接开发板的 3.3V 和 IO02 引脚

2. 适当剪短GL5528的引脚后, 用导线连接其中一个引脚和开发板上的IO02引脚, 再用另一根导线连接GL5528的另一个引脚和开发板上的GND(GL5528的两个引脚是无极性的, 随便焊)

   ![image-20220723184137614](https://github.com/circircir-circle/human_exist_device/blob/main/assets/image-20220723184137614.png)

3. 注意LD2410的引脚顺序如下:

   <img src="https://github.com/circircir-circle/human_exist_device/blob/main/assets/image-20220723184403998.png" alt="image-20220723184403998" style="zoom:50%;" />

   将您购买到的5pin 1.27连接线插入雷达模块, 然后按照下面连线表将LD2410和ESP32开发板连接起来

   | LD2410引脚编号 | 开发板引脚编号 | 功能              |
   | -------------- | -------------- | ----------------- |
   | 5              | +5V            | +5V               |
   | 4              | GND            | GND               |
   | 3              | IO00           | UART_TX(LD2410端) |
   | 2              | IO01           | UART_RX(LD2410端) |
   | 1              | 剪断           |                   |

### 结构安装

本人GL5528 和 雷达 使用热熔胶固定, ESP32开发板使用2mm厚度的双面胶固定. 您家里如果没有这些材料, 可以自行寻找合适的固定材料.

### 软件安装

1. ESP32程序: 您需要使用PlatformIO编译并下载, 由于软件指定使用4.2.0版本的内核, 因此可能会需要等待一段时间. (因为我使用更高版本的库有两个问题, 1: NVS库读写失败 2:编译出来的软件合宙的简约版烧录后不运行)
2. 微信小程序: 小程序尚未发布, 您需要扫码提交申请后使用. (如果您不决定做这个设备的话, 请不要随便扫着玩, 以免造成打扰)

## 使用说明

**重要提示: 本版本bug较多, 请仔细阅读下面的每一句话, 可以少踩几个坑**

**请多点耐心, 后面会慢慢修复的**

### 配网

1. 给设备上电后, 在2min内打开微信小程序, 进入配网页面, 应该可以看到 "蓝牙 已连接 HMConfigWifi-IDXXXXXXXXXXXX"(XXXX是该ESP32的MAC地址)(*注1*)
2. 接下来填写信息, 除了保证信息的正确性以外, 还有以下两个要求
   1. wifi必须为2.4G
   2. 信息长度不能超过20个字符, 尤其是wifi的ssid和密码
3. 填写完毕后, 点击写入设置, 稍等2秒后, 点击读取设置, 应该看到上面的信息栏没有任何变化(*注2*), 说明写入成功. 
4. 关闭设备, 重启微信小程序(点击右上角的三个小点, 在弹出菜单中选择"重新进入小程序"), 看到下面显示"蓝牙 已连接 usrname", 此时再给设备上电, 可以看到"蓝牙 已连接 HMConfigWifi-IDXXXXXXXXXXXX", 稍等5s后, 点击读取设置, 上面的信息栏应该回显出刚刚填写的信息(*注2*). 如果信息没有问题, 那么下面会显示"WiFi: 连接成功" "MQTT: 连接成功"等信息(*注3*). 

**有可能遇到的问题**

注1: 如果没看到, 请确保1: 设备已正确上电, 此时板卡上会有一个红色LED微亮  2: 微信小程序请求蓝牙权限时已通行. 3: 手机打开蓝牙功能 4: 设备上电后2min内打开了微信小程序

注2: 如果有变化, 请重新操作一次, 如果还是有变化, 则需要接入串口调试, 观看串口的打印信息

注3: 如果还是显示未连接, 请检查信息的正确性. 使用其它设备接入试试.

### 监控

完成配网后, 点击"监控"页面, 当看到跳跃的红色和蓝色两条线时, 恭喜您, 雷达已经开始工作啦.

首先, 我们认识一下界面:

![image-20220725201055766](https://github.com/circircir-circle/human_exist_device/blob/main/assets/image-20220725201055766.png)



接下来, 请将设备放置到您待监测的空间内(注1), 进行"环境测定"的工作来调整阈值, 放置设备需要遵循以下几个原则:

1. 不要对着玻璃
2. 尽量正对着人照射, 因为人呼吸时胸膛起伏较大, 比较好检测, 而背部相对容易误判
3. 空间内的移动物体将形成干扰源(如电风扇, 空调, 被风吹动的窗帘等)
4. ...

放好设备后, 人离开待监测空间, 让其处于一种"无人存在"的状态, 观察雷达采集到的能量值, 应该两条线都处于比较低的位置, 通常静止状态的整条曲线都处于20以下. 如果您的设备达不到这种状态, 请为设备选一个别的位置, 如果必须处于这个位置, 则说明环境比较差, 可能会影响效果. 确定好位置后, 调整两条线的阈值(注2), 使其保持高于当前状态的能量分布

然后人进入待监测空间, 模拟在其中"正常活动"的状态, 比如蹲坑, 做饭, 看书, 刷手机等(尽量保持正常状态, 没必要特意屏气特意考验雷达的能力), 查看雷达的能量分布. 此时应该有好几个点都高于"无人存在"状态. 则可以通过把那几个点对应的阈值调整到介于"无人存在"和"正常活动"状态的中间, 设备便依次判断是否有人存在.

接下来模拟"存在干扰"的状态, 比如在卫生间使用时, 如果人只是从卫生间门口经过肯定是不希望开灯的. 则不停的模拟人在卫生间门口经过的状态, 观察当前的能量分布, 然后调整阈值, 保证所有的阈值点都超过当前的能量分布.

总结:

1. 所有的阈值点都要高于"无人存在"状态
2. 一定要有阈值点稳定的介于"无人存在"和"正常活动"之间
3. 如果可以, 所有阈值点都高于"存在干扰"的状态, 如果与1, 2冲突, 那只能优先保证1 2

调整好后, 恭喜您, 您就得到一个专属于您当前环境的"人体存在传感器"啦

**有可能遇到的问题**

注1: 如果挪动空间需要把设备重新上电, 请遵循以下步骤:

		1. 设备断电
		2. 重启微信小程序(按照配网.4的步骤)
		3. 设备上电, 看到微信小程序下方显示 "蓝牙 已连接 HMConfigWifi-IDXXXXXXXXXXXX"
		4. 稍等5s后, 点击读取设置, 显示连接成功

注2: 调整过程中, 有可能出现手滑导致小圆点超出图表区, "不见了"的情况, 这时, 请点击右下方的"设置", 然后再点击"监控", 就会发现小圆点又回来了

### 设置

目前该页主要设置延时, 即以1秒10次的频率持续检测, 必须连续N次检测到当前状态后, 才会最终做出状态的判定. 该功能可以进一步排除一些偶发性干扰.

### 在HA中显示

在 configure.yaml 中, 添加代码如下:

``` yaml
sensor:
- platform: mqtt
    name: 'esp32_主卫_exist'
    state_topic: 'homeassistant/sensor/ESP32_IDXXXXXXXXXXXX/state'
    value_template: '{{ value_json.human_exist }}'
    unique_id: 'id_ESP32_human_exist_IDXXXXXXXXXXXX_t'
    value_template: >-
      {% set tt = value_json.human_exist %}
      {%- if tt == 2 -%}
        有人运动
      {%- elif tt == 1 -%}
        有人静止
      {%- elif tt == 0 -%}
        未检测到
      {%- else -%}
        未知状态
      {%- endif -%}
  - platform: mqtt
    name: 'esp32_主卫_ldr'
    state_topic: 'homeassistant/sensor/ESP32_IDXXXXXXXXXXXX/state'
    value_template: '{{ value_json.ldr_value }}'
    unique_id: 'id_ESP32_ldr_value_IDXXXXXXXXXXXX_t'
    unit_of_measurement: 'R'
```

把其中的 XXXX 换成您在微信小程序里看到的 "蓝牙 已连接 HMConfigWifi-IDXXXXXXXXXXXX" 中的12位代码(注1), name字段可以换成便于您识别的名称后, 保存.

回到HA, 点击"检查配置", 没有问题后, 点击下面的"手动配置的MQTT实体"

然后, 就可以在"实体注册表"页面, 看到您的设备啦.

**有可能遇到的问题**

注1: 如果您没有事先记录, 那么现在需要重启小程序才行

### 其它应该说明的问题



## 版本说明

### 已知的bug

以上所有的注, 皆是因为各种bug引起的. 包括

1. 设备重启后, 微信小程序不会重新连接设备, 需要手动重启微信小程序
2. 配网后, 需要重启设备, 设备才能使用新的网络信息尝试连接
3. 微信小程序离开"配网"页面后, 重新回到"配网"页面, 并不会显示原来的信息, 需要手动重启微信小程序
4. 进入监控页面后, 静止状态的阈值有时不能更新, 需要进入设置页面, 再重新进入监控页面
5. 在监控页面中, 小圆点拖出图表后便无法操作, 需要进入设置页面后再重新进入监控页面
6. 目前设备有**死机**(或者连不上网, 因为不知道当前状态)的情况, 时间12到72小时不等, 只能重启解决. 正在紧急修复中

### 下一个版本展望

低功耗处理, 使用电池供电





## 最后

1. 目前版本bug较多, 不着急的话, 可以等我修复bug后再复刻.

2. 诚邀一位有兴趣的微信小程序开发者, 帮我完善一下工程, 本人水平实在有限



## FAQ

