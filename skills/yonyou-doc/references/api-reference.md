# API 对象 · 离线全量正文

> 来源：https://developer.yonyou.com/docs/Client-API/API （一页内联全部 API）
> 快照：2026-10-22，共 **415** 个章节，由 `scripts/sync_docs.py` 生成，请勿手工编辑。

> 定位：`scripts/fetch_doc.py /docs/Client-API/API <锚点或方法名>` 会优先读本文件；不改脚本时也可直接在本文件里搜方法名。索引见 `api-objects.md`。

---

## 概述
<!-- anchor: 概述 -->

api 对象是您入门 YonBuilder移动开发平台 必须了解和熟练掌握的一个基础对象。api 对象提供了构建应用程序所需要的一些基本的方法[Method]，如窗口操作、相册和网络数据访问等；以及一些常见的属性[Attribute]，如屏幕宽度（screenWidth），系统类型（systemType）等；还有一些常用事件[Event]，如电量低（batterylow）事件、应用进入后台（pause）事件。api 对象不需要 require 引用，可以直接在 js 中使用。

## appId
<!-- anchor: appid -->

应用的 ID，可以在网站控制台概览里面查看，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
示例代码
var appId = api.appId; //比如： A6980386445546

## appName
<!-- anchor: appname -->

应用在桌面显示名称，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var appName = api.appName; //比如： AppLoader

## appVersion
<!-- anchor: appversion -->

应用版本号，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var appVersion = api.appVersion; // 比如： 1.0.0

## systemType
<!-- anchor: systemtype -->

系统类型，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围：
ios //iOS系统
android //Android系统
win //Windows系统
wp //Windows Phone系统
示例代码
var systemType = api.systemType; // 比如： ios

## systemVersion
<!-- anchor: systemversion -->

手机平台的系统版本，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var systemVersion = api.systemVersion; // 比如： 8.0

## version
<!-- anchor: version -->

引擎版本信息，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var version = api.version; //比如： 1.0.0

## language
<!-- anchor: language -->

当前系统语言，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的3.0.13及更高版本
可提供的3.0.13及更高版本
示例代码
var language = api.language; //比如： zh-cn

## deviceId
<!-- anchor: deviceid -->

设备唯一标识，字符串类型
因系统限制，iOS系统上面无法获取设备唯一标识udid、IMEI号、Mac地址等信息，这里返回的是与证书相关联的uuid，即使应用卸载了重新安装值也不会变化。
安卓部分系统也存在限制，一些设备上无法获取IMEI号、Mac地址等信息：安卓9.0及之前的系统中，在动态申请“获取手机信息”权限后，可获得IMEI号，而安卓10及以上版本，系统则完全禁止获取IMEI。因此，综合安卓系统的实际情况，deviceId的返回值优先级如下：若当前设备能正常获取IMEI，则返回IMEI号；若IMEI号异常，则返回系统安全码ANDROID_ID；若ANDROID_ID异常，则返回设备MAC地址；若MAC地址异常，则返回设备序列号；若序列号异常，则随机生成一个UUID。该UUID的生命周期自生成起，直至APP被卸载，若APP在同一个设备中被重新安装，将生成新的UUID。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var deviceId = api.deviceId; //比如： FC408F8B-9598-48B6-A740-B9037ADCXXXE

## deviceToken
<!-- anchor: devicetoken -->

iOS中用于推送的DeviceToken，如果未添加相关推送插件，或者云编译的mobileprovision证书未开启推送功能，则可能会返回空字符串，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.1.0及更高版本
示例代码
var deviceToken = api.deviceToken; //比如： a22241adab6c68b3687a9f0f086c540341f4b3f010546d4af4834ada32281615

## deviceModel
<!-- anchor: devicemodel -->

设备型号，字符串类型
注：对于2017年秋之前发布的iOS设备，引擎对原始的型号值做了映射，比如iPhone 7上面会直接返回iPhone 7；而对于2017年秋及之后发布的iOS设备，返回的值则是原始的设备型号值，比如在iPhone 8上面返回的可能是iPhone10,1而不是iPhone 8。可以在 https://www.theiphonewiki.com/wiki/Models 查询iOS设备型号。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var deviceModel = api.deviceModel; // 比如iPhone X的型号： iPhone10,3

## deviceName
<!-- anchor: devicename -->

设备名称，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var deviceName = api.deviceName; // 比如：“柚子”的 iPhone

## uiMode
<!-- anchor: uimode -->

设备类型，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.10及更高版本
可提供的1.2.10及更高版本
取值范围:
pad
phone
tv
car
desk
watch
示例代码
var uiMode = api.uiMode; // 比如：phone

## platform
<!-- anchor: platform -->

当前运行平台，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.3.68及更高版本
可提供的1.3.68及更高版本
取值范围:
app // 表示当前运行环境为 App 端
web // 表示当前运行环境为 Web 端
mp // 表示当前运行环境为小程序端
示例代码
var platform = api.platform; // 比如：app

## operator
<!-- anchor: operator -->

运营商名称，若未获取到则返回none，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
示例代码
var operator = api.operator; // 比如：中国移动

## connectionType
<!-- anchor: connectiontype -->

当前网络连接类型，如 2g、3g、4g、wifi 等，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围：
unknown //未知
ethernet //以太网
wifi //wifi
2g //2G网络
3g //3G网络
4g //4G网络
none //无网络
示例代码
var connectionType = api.connectionType; //比如： wifi

## fullScreen
<!-- anchor: fullscreen -->

应用是否全屏，布尔类型，只支持iOS
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
示例代码
var fullScreen = api.fullScreen; // 比如： true

## screenWidth
<!-- anchor: screenwidth -->

屏幕分辨率宽，数字类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
示例代码
var screenWidth = api.screenWidth; // 比如： 640

## screenHeight
<!-- anchor: screenheight -->

屏幕分辨率高，数字类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
示例代码
var screenHeight = api.screenHeight; // 比如： 960

## winName
<!-- anchor: winname -->

当前 window 名称，字符串类型
该属性值为 openWin() 时传递的 name 参数值，注意首页的名称为 root
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var winName = api.winName; //比如： root

## winWidth
<!-- anchor: winwidth -->

当前 window 宽度，数字类型
此属性值不同于屏幕的分辨率，比如 iPhone 5 的分辨率为 640*1136，但是其 winWidth 为 320，因此前端需根据 winWidth 和 winHeight 来进行布局
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var winWidth = api.winWidth; // 比如： 320

## winHeight
<!-- anchor: winheight -->

当前 window 高度，数字类型
此属性值不同于屏幕的分辨率，比如 iPhone 5 的分辨率为 640*1136，但是其 winHeight 为 568（若不使用iOS7风格则为 548），因此前端需根据 winWidth 和 winHeight 来进行布局
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var winHeight = api.winHeight; // 比如： 568

## frameName
<!-- anchor: framename -->

frame 名称，字符串类型
若当前环境为 window 中，则该属性值为空字符串
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var frameName = api.frameName; //比如： trans-con

## frameWidth
<!-- anchor: framewidth -->

frame 宽度，数字类型
若当前环境为 window 中，则值和 winWidth 相同
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var frameWidth = api.frameWidth; // 比如： 320

## frameHeight
<!-- anchor: frameheight -->

frame 高度，数字类型
若当前环境为 window 中，则值和 winHeight 相同
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var frameHeight = api.frameHeight; // 比如： 504

## safeArea
<!-- anchor: safearea -->

页面不被其它内容（如状态栏）遮住的区域，JSON对象
通过safeArea能够知道当前页面哪些地方被遮住，从而做出相应的调整，保证页面重要元素不被遮挡住。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.33及更高版本
可提供的1.2.33及更高版本
比如应对顶部header被状态栏遮住一部分，可以为header增加一个paddingTop，如：
header.style.paddingTop = api.safeArea.top + 'px';
在比如在iPhone X上面，底部的导航菜单会被虚拟Home键遮住一部分，可以为footer增加一个paddingBottom，如：
footer.style.paddingBottom = api.safeArea.bottom + 'px';
内部字段：
{
top: // 安全区域上边缘，对于沉浸式下window中该值通常为状态栏高度，全屏或非沉浸式下为0（iPhone X竖屏时全屏状态下也为44）
left: // 安全区域左边缘，通常为0（iPhone X横屏时为44）
bottom: // 安全区域下边缘，通常为0（iPhone X竖屏时为34，横屏时为21）
right: // 安全区域右边缘，通常为0（iPhone X横屏时为44）
}
示例代码
var safeArea = api.safeArea; // JSON对象，如{top:20, left:0, bottom:0, right:0}

## pageParam
<!-- anchor: pageparam -->

页面参数，JSON 对象类型
用于获取页面间传递的参数值，为 openWin()、openFrame() 等方法中的 pageParam 参数对应值
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var pageParam = api.pageParam; //比如： {"name" : "tans-con"}

## wgtParam
<!-- anchor: wgtparam -->

widget 参数，JSON 对象类型
用于获取 widget 间传递的参数值，为 openWidget() 方法中的 wgtParam 参数对应值
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var wgtParam = api.wgtParam; //比如： {"name": "API Demo"}

## appParam
<!-- anchor: appparam -->

当应用被第三方应用打开时，传递过来的参数，字符串类型
建议通过appintent事件监听应用被第三方应用调起，并在事件回调里面获取参数进行处理。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var appParam = api.appParam; //比如： {"name": "API Demo"}

## statusBarAppearance
<!-- anchor: statusbarappearance -->

当前应用状态栏是否支持沉浸式效果，布尔类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
示例代码
var statusBarAppearance = api.statusBarAppearance; // 比如： true

## wgtRootDir
<!-- anchor: wgtrootdir -->

widget: //协议对应的真实目录，即 widget 网页包的根目录，字符串类型
注意该目录为只读，不要往该目录下面写文件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var wgtRootDir = api.wgtRootDir;
/*
比如：
/private/var/mobile/Containers/Bundle/Application/56218B5B-1B59-48CD-8080-DAC54DB46446/UZApp.app/widget
*/

## fsDir
<!-- anchor: fsdir -->

fs: //协议对应地真实目录，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var fsDir = api.fsDir;
/*
比如：
/var/mobile/Containers/Data/Application/4E376FDE-D595-4E08-B0A4-A06561B31000/Documents/uzfs/A123456789
*/

## cacheDir
<!-- anchor: cachedir -->

cache://协议对应的真实目录，字符串类型
iOS 平台下载的文件一般存放于该目录下，否则提交 AppStore 审核时可能会不通过，且此目录下的内容在手机备份时不会被备份
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var cacheDir = api.cacheDir;
/*
比如：
/var/mobile/Containers/Data/Application/4E376FDE-D595-4E08-B0A4-A06561B31000/Library/Caches/YonBuilder/Cache/XXXXXX
*/

## boxDir
<!-- anchor: boxdir -->

box://协议对应的真实目录，字符串类型
iOS上面在应用Documents下，安卓上面在系统为app分配的沙箱下，root或者越狱的手机可看到。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
示例代码
var boxDir = api.boxDir;
/*
比如：
/var/mobile/Containers/Data/Application/4E376FDE-D595-4E08-B0A4-A06561B31000/Documents/uzfs/box
*/

## debug
<!-- anchor: debug -->

获取config.xml配置的debug字段的值。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
var debug = api.debug; // 比如： true

## channel
<!-- anchor: channel -->

渠道号，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
示例代码
var channel = api.channel; //如：Apple App Store

## jailbreak
<!-- anchor: jailbreak -->

设备是否越狱，布尔类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
示例代码
var jailbreak = api.jailbreak; //如：false

## isRecoveryMode
<!-- anchor: isrecoverymode -->

使用WKWebView加载页面时，若配置了WKWebView渲染进程崩溃后刷新当前页面，则刷新后该属性值为true。只支持iOS，布尔类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.9及更高版本
可提供的1.2.9及更高版本
示例代码
if (api.isRecoveryMode) {
// to do
}

## getAppInformation
<!-- anchor: getappinformation -->

获取应用信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
packageName
string
应用包名
示例代码
api.getAppInformation({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getSystemInfo
<!-- anchor: getsysteminfo -->

获取系统信息。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
brand
string
设备品牌
model
string
设备型号
pixelRatio
number
设备像素比
screenWidth
number
屏幕宽度
screenHeight
number
屏幕高度
windowWidth
number
可使用窗口宽度
windowHeight
number
可使用窗口高度
statusBarHeight
number
状态栏高度
language
string
当前设置的语言
version
string
应用版本号
system
string
操作系统及版本
platform
string
客户端平台
SDKVersion
string
基础库版本
safeArea
object
安全区域
theme
string
系统当前主题
enableDebug
boolean
是否已打开调试
deviceOrientation
string
设备方向
platform 说明
值
说明
ios
iOS 平台
android
Android 平台
safeArea 说明
值
类型
说明
left
number
安全区域左上角横坐标
right
number
安全区域右下角横坐标
top
number
安全区域左上角纵坐标
bottom
number
安全区域右下角纵坐标
width
number
安全区域的宽度
height
number
安全区域的高度
theme 说明
值
说明
light
浅色主题
dark
深色主题
deviceOrientation 说明
值
说明
portrait
竖屏
landscape
横屏
示例代码
api.getSystemInfo({
success: function(res) {
console.log(res.platform);
}
});
toast位置
传感器类型
错误码
电话类型
定位精度
动画类型
动画曲线类型
动画子类型
进度提示框动画类型
进度提示框风格
媒体类型
拾取器类型
图片编码类型
图片数据格式
图片源类型
网络类型
文件操作错误码
系统类型
下载状态
异步请求错误类型
异步请求返回数据类型
异步请求方法类型
状态栏样式
屏幕旋转方向
上传状态
键盘弹出页面调整方式
缓存策略

## toast位置
<!-- anchor: toast位置 -->

toast 位置，字符串类型
用于 toast() 方法中 location 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
top //顶部
middle //中间
bottom //底部

## 传感器类型
<!-- anchor: 传感器类型 -->

传感器类型，字符串类型
用于 startSensor() 方法中 type 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
accelerometer //加速计
gyroscope //陀螺仪
magnetic_field //地磁传感器
proximity //近接传感器

## 错误码
<!-- anchor: 错误码 -->

错误码，数字类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
0 //错误
1 //没有指定插件
2 //没有指定方法
3 //参数不匹配
4 //没有权限

## 电话类型
<!-- anchor: 电话类型 -->

电话类型，字符串类型
用于 call() 方法中 type 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
tel //直接拨打电话。注：由于系统限制，iOS 10.2以上系统仍会弹出提示框
tel_prompt //拨打电话之前会弹出提示框
facetime //facetime通话，Android不支持

## 定位精度
<!-- anchor: 定位精度 -->

定位精度，字符串类型
根据需要来选择适当的精度来进行定位，用于 startLocation() 方法中 accuracy 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
10m //精度在10米范围内
100m //精度在100米范围内
1km //精度在1千米范围内
3km //精度在3千米范围内

## 动画类型
<!-- anchor: 动画类型 -->

打开 window 或打开 widget 时的动画类型，Android 部分动画不支持，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本(flip，ripple，curl，un_curl，suck，cube 类型不支持)
可提供的1.0.0及更高版本
取值范围
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果

## 动画曲线类型
<!-- anchor: 动画曲线类型 -->

动画曲线类型，指定动画开始和结束时的快慢，字符串类型
用于 animation() 方法中 curve 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
ease_in_out //开始和结束时慢
ease_in //开始时慢
ease_out //结束时慢
linear //整个动画过程速率一样

## 动画子类型
<!-- anchor: 动画子类型 -->

动画子类型，字符串类型
部分动画如 fade 可能没有过渡方向
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本（仅限于from_right，from_left）
可提供的1.0.0及更高版本
取值范围
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画

## 进度提示框动画类型
<!-- anchor: 进度提示框动画类型 -->

进度提示框动画类型，字符串类型
用于 showProgress() 方法中 animationType 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
fade //渐隐渐现
zoom //缩放

## 进度提示框风格
<!-- anchor: 进度提示框风格 -->

进度提示框风格，字符串类型
用于 showProgress() 方法中 style 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
default //默认

## 媒体类型
<!-- anchor: 媒体类型 -->

媒体类型，字符串类型
用于 getPicture() 方法中 mediaValue 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
pic //图片
video //视频
all //图片和视频，Android不支持

## 拾取器类型
<!-- anchor: 拾取器类型 -->

拾取器类型，字符串类型
用于 openPicker() 方法中 type 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
date //日期
time //时间
date_time //日期和时间，Android不支持

## 图片编码类型
<!-- anchor: 图片编码类型 -->

图片编码类型，字符串类型
用于 getPicture() 方法中 encodingType 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
jpg //指定图片格式为jpg
png //指定图片格式为png

## 图片数据格式
<!-- anchor: 图片数据格式 -->

图片数据格式，字符串类型
用于 getPicture() 方法中 destinationType 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
base64 //指定返回数据为base64编码后内容
url //指定返回数据为选取的图片地址

## 图片源类型
<!-- anchor: 图片源类型 -->

图片源类型，字符串类型
用于 getPicture() 方法中 sourceType 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
library //图片库
camera //相机
album //相册

## 网络类型
<!-- anchor: 网络类型 -->

网络类型，字符串类型
用于 connectionType 属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
unknown //未知
ethernet //以太网
wifi //wifi
2g //2G网络
3g //3G网络
4g //4G网络
none //无网络

## 文件操作错误码
<!-- anchor: 文件操作错误码 -->

文件操作错误码，数字类型
指定 readFile()、writeFile() 方法返回错误时的错误类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
0 //没有错误
1 //找不到文件错误
2 //不可读取错误
3 //编码格式错误
4 //无效操作错误
5 //无效修改错误
6 //磁盘溢出错误
7 //文件已存在错误

## 系统类型
<!-- anchor: 系统类型 -->

系统类型，字符串类型
用于 systemType 属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
ios //iOS系统
android //Android系统
win //Windows系统
wp //Windows Phone系统

## 下载状态
<!-- anchor: 下载状态 -->

下载状态，数字类型
用于 download() 方法返回值中的 state 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
0 //下载中
1 //下载完成
2 //下载失败

## 异步请求错误类型
<!-- anchor: 异步请求错误类型 -->

异步请求错误类型，数字类型
用于 ajax() 方法返回错误时的 code 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
0 //连接错误
1 //超时
2 //授权错误
3 //数据类型错误

## 异步请求返回数据类型
<!-- anchor: 异步请求返回数据类型 -->

异步请求返回数据类型，字符串类型
用于 ajax() 方法中 dataType 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
json //返回数据为 JSON 对象
text //返回数据为字符串类型

## 异步请求方法类型
<!-- anchor: 异步请求方法类型 -->

异步请求方法类型，字符串类型
用于 ajax() 方法中 method 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
get
post
put
delete
head

## 状态栏样式
<!-- anchor: 状态栏样式 -->

状态栏样式，字符串类型
用于 setStatusBarStyle() 方法中 style 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
取值范围
dark //状态栏字体为黑色，适用于浅色背景
light //状态栏字体为白色，适用于深色背景

## 屏幕旋转方向
<!-- anchor: 屏幕旋转方向 -->

指定屏幕旋转到特定方向，或根据重力感应自动旋转，字符串类型
用于 setScreenOrientation() 方法中 orientation 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
portrait_up //竖屏时，屏幕在home键的上面
portrait_down //竖屏时，屏幕在home键的下面，部分手机不支持
landscape_left //横屏时，屏幕在home键的左边
landscape_right //横屏时，屏幕在home键的右边
auto //屏幕根据重力感应在横竖屏间自动切换
auto_portrait //屏幕根据重力感应在竖屏间自动切换
auto_landscape //屏幕根据重力感应在横屏间自动切换

## 上传状态
<!-- anchor: 上传状态 -->

上传状态，数字类型
用于 ajax() 方法上传文件时返回值中的 status 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
0 //上传中
1 //上传完成
2 //上传失败

## 键盘弹出页面调整方式
<!-- anchor: 键盘弹出页面调整方式 -->

指定键盘弹出时，页面如何调整其内容，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
resize //若键盘盖住输入框，页面会自动上移
pan //若键盘盖住输入框，页面不会自动上移
auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize

## 缓存策略
<!-- anchor: 缓存策略 -->

缓存策略，字符串类型
用于 imageCache() 方法中的 policy 字段
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
取值范围
default //默认为 cache_else_network
cache_else_network //若服务器上没有更新，则使用缓存
no_cache //不使用缓存，始终从服务器获取
cache_only //当缓存存在时，只从缓存中读取
apiready
batterylow
batterystatus
keyback
keymenu
volumeup
volumedown
offline
online
pause
resume
active
inactive
scrolltobottom
backtotop
shake
takescreenshot
appidle
swipedown
swipeleft
swiperight
swipeup
tap
longpress
viewappear
viewdisappear
noticeclicked
appintent
smartupdatefinish
launchviewclicked
keyboardshow
keyboardhide
safeareachanged
interfacestylechanged
navtitle
navbackbtn
navitembtn
tabitembtn
tabframe

## apiready
<!-- anchor: apiready -->

此事件是在api对象准备完毕后产生，在每个Window或Frame的HTML代码中都需要监听此事件，以确定扩展对象已经准备完毕，可以调用了。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
示例代码
apiready = function() {
bMap = api.require("bMap");
}

## batterylow
<!-- anchor: batterylow -->

设备电池电量低事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret：
描述：返回电池电量和充电状态，不能为空
内部字段：
{
level:100, //电池电量（0-100）
isPlugged:true //是否连接电源
}
示例代码
api.addEventListener({
name: 'batterylow'
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## batterystatus
<!-- anchor: batterystatus -->

设备电池状态改变事件，如电量变化或正在充电，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：返回电池电量和充电状态，不能为空
内部字段：
{
level:100, //电池电量（0-100）
isPlugged:true //是否连接电源
}
示例代码
api.addEventListener({
name: 'batterystatus'
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## keyback
<!-- anchor: keyback -->

监听安卓设备 back 键被点击事件，以及 TabLayout 中的返回按钮点击事件，iOS 中可传入 slidBackIntercept 参数监听页面右滑返回事件。
该事件必须在 Window 中注册才有效，Frame 中注册无效，并且只在当前屏幕上的 window 才能收到回调。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：被点击的键值
内部字段：
{
keyCode:0 //被点击的按键，只 Android 有效
longPress:false //是否是长按，只 Android 有效
}
示例代码
api.addEventListener({
name: 'keyback',
extra:{
slidBackIntercept:false //打开页面时若 slidBackType 参数为 edge，可通过此参数设置是否拦截页面右滑返回，只 iOS 有效，默认值为 false，布尔类型
}
}, function(ret, err) {
api.alert({
msg: '触发了返回事件'
});
});

## keymenu
<!-- anchor: keymenu -->

设备 menu 键被点击事件，仅 Android 平台有效
该事件必须在 Window 中注册才有效，Frame 中注册无效，并且只在当前屏幕上的 window 才能收到回调。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：被点击的按键
内部字段：
{
keyCode:0 //被点击的按键
longPress:false //是否是长按
}
示例代码
api.addEventListener({
name: 'keymenu'
}, function(ret, err) {
api.alert({
msg: '按了菜单键'
});
});

## volumeup
<!-- anchor: volumeup -->

设备音量加键被点击事件，仅 Android 平台有效
该事件必须在 Window 中注册才有效，Frame 中注册无效，并且只在当前屏幕上的 window 才能收到回调。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.0及更高版本
callback(ret, err)
ret:
描述：被点击的按键
内部字段：
{
keyCode:0 //被点击的按键
longPress:false //是否是长按
}
示例代码
api.addEventListener({
name: 'volumeup'
}, function(ret, err) {
api.alert({
msg:'按了音量加键'
});
});

## volumedown
<!-- anchor: volumedown -->

设备音量减键被点击事件，仅 Android 平台有效
该事件必须在 Window 中注册才有效，Frame 中注册无效，并且只在当前屏幕上的 window 才能收到回调。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.0及更高版本
callback(ret, err)
ret:
描述：被点击的按键
内部字段：
{
keyCode:0 //被点击的按键
longPress:false //是否是长按
}
示例代码
api.addEventListener({
name:'volumedown'
}, function(ret, err){
api.alert({
msg:'按了音量减键'
});
});

## offline
<!-- anchor: offline -->

监听设备断开网络的事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'offline'
}, function(ret, err){
api.alert({
msg:'断网了'
});
});

## online
<!-- anchor: online -->

监听设备连接到网络的事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：监听到网络连接时的返回数据
内部字段：
{
connectionType:'' //当前网络连接类型，如2g、3g、4g、wifi等
}
示例代码
api.addEventListener({
name:'online'
}, function(ret, err){
api.alert({
msg:'已连接到网络'
});
});

## pause
<!-- anchor: pause -->

应用进入后台事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'pause'
}, function(ret, err){
api.alert({
msg:'应用进入后台'
});
});

## resume
<!-- anchor: resume -->

应用从后台回到前台事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'resume'
}, function(ret, err){
api.alert({
msg:'应用回到前台'
});
});

## active
<!-- anchor: active -->

应用成为活动状态的事件，活动状态表示应用能够接收用户事件，该事件只 iOS 有效。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.3.69及更高版本
示例代码
api.addEventListener({
name:'active'
}, function(ret, err){
api.alert({
msg:'应用处于活动状态'
});
});

## inactive
<!-- anchor: inactive -->

应用成为非活动状态的事件，例如应用退到后台、应用在前台时滑出控制中心或通知中心等，该事件只 iOS 有效。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.3.69及更高版本
示例代码
api.addEventListener({
name:'inactive'
}, function(ret, err){
api.alert({
msg:'应用处于非活动状态'
});
});

## scrolltobottom
<!-- anchor: scrolltobottom -->

Window 或者 Frame 页面滑动到底部事件，字符串类型
可用于实现滚动到底部，加载更多功能
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'scrolltobottom',
extra:{
threshold:0 //设置距离底部多少距离时触发，默认值为0，数字类型
}
}, function(ret, err){
api.alert({
msg:'已滚动到底部'
});
});

## backtotop
<!-- anchor: backtotop -->

iOS 点击状态栏页面回到顶部事件，字符串类型
注：只有当页面开启了点击状态栏回到顶部功能时才生效，参考 openWin、openFrame 等方法的 scrollToTop 参数；当页面没有滚动偏移时点击状态栏不会触发事件。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的3.0.24及更高版本
callback()
不能为空
示例代码
api.addEventListener({
name:'backtotop'
}, function(ret, err){
api.alert({
msg:'已回到顶部'
});
});

## shake
<!-- anchor: shake -->

设备摇动事件，字符串类型。设置该监听后，当前 APP 将立即开启摇动检测功能。
可用于实现摇一摇功能
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'shake'
}, function(ret, err){
api.alert({
msg:'触发了摇一摇事件'
});
});

## takescreenshot
<!-- anchor: takescreenshot -->

应用在前台运行期间，用户屏幕截图事件（比如同时按下了 home 键和电源键）。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'takescreenshot'
}, function(ret, err){
api.alert({
msg:'用户截屏了'
});
});

## appidle
<!-- anchor: appidle -->

应用多长时间不操作屏幕后触发的事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.34及更高版本
可提供的1.2.34及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'appidle',
extra:{
timeout:300 //设置经过多长时间不操作屏幕时触发，单位秒，数字类型
}
}, function(ret, err){
api.alert({
msg:'已闲置'
});
});

## swipedown
<!-- anchor: swipedown -->

Window 或者 Frame 的页面全局向下轻扫事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'swipedown'
}, function(ret, err){
api.alert({
msg:'向下轻扫'
});
});

## swipeleft
<!-- anchor: swipeleft -->

Window 或者 Frame 的页面全局向左轻扫事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'swipeleft'
}, function(ret, err){
api.alert({
msg:'向左轻扫'
});
});

## swiperight
<!-- anchor: swiperight -->

Window 或者 Frame 的页面全局向右轻扫事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'swiperight'
}, function(ret, err){
api.alert({
msg:'向右轻扫'
});
});

## swipeup
<!-- anchor: swipeup -->

Window 或者 Frame 的页面全局向上轻扫事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'swipeup'
}, function(ret, err){
api.alert({
msg:'向上轻扫'
});
});

## tap
<!-- anchor: tap -->

Window 或者 Frame 的页面全局单击事件，字符串类型。监听该事件后，点击 window 或者 frame 的任意位置，都将收到 tap 回调。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'tap'
}, function(ret, err){
api.alert({
msg:'点击了页面'
});
});

## longpress
<!-- anchor: longpress -->

Window 或者 Frame 的页面全局长按事件，字符串类型。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'longpress'
}, function(ret, err){
api.alert({
msg:'长按了页面'
});
});

## viewappear
<!-- anchor: viewappear -->

Window 显示到屏幕的事件，字符串类型。收到 viewappear 事件回调，即标识当前 Window 已经动画结束，并且完全显示到屏幕上。
该事件的作用对象为 Window，Frame 的显示不会收到事件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'viewappear'
}, function(ret, err){
api.alert({
msg:'window显示'
});
});

## viewdisappear
<!-- anchor: viewdisappear -->

Window 离开屏幕的事件，字符串类型。收到 viewdisappear 事件回调，即标识当前 Window 已经动画结束，并且完全从屏幕上移除。
该事件的作用对象为 Window，Frame 的隐藏不会收到事件
若是 Window 被关闭，此事件不会再回调
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
不能为空
示例代码
api.addEventListener({
name:'viewdisappear'
}, function(ret, err){
api.alert({
msg:'window消失'
});
});

## noticeclicked
<!-- anchor: noticeclicked -->

状态栏通知被用户点击后的回调，字符串类型。注意：该事件仅针对api.notification以及官方push插件发出的状态栏通知有效，无法接收第三方插件或者SDK发出的状态栏通知。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：通知被点击后的回调
内部字段：
{
type:0, //内容来源类型。取值范围：0-收到YonBuilder移动开发 push的推送内容，1-开发者自定义的
value:'' //内容，收到的推送内容或者由开发者发送通知时自行传入的，见notification接口中extra
}
示例代码
api.addEventListener({
name:'noticeclicked'
},function(ret,err){
api.alert({
msg: ret.value
});
});

## appintent
<!-- anchor: appintent -->

本应用被其他应用调起来时（Android 平台也可以通过 Activity 打开），收到相关数据的回调，字符串类型
在任意页面中注册该监听后，如果本应用被其他应用调起，将触发该监听函数，同时将传给该应用的数据回调给网页
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret:
描述：其他应用或 Activity 传给本应用的数据
内部字段：
{
iosUrl:'' //其他应用打开本应用的url，只iOS有效，字符串类型
sourceAppId:'' //其他应用的包名，iOS平台有可能为空字符串，字符串类型
appParam:{} //其他应用传递过来的参数，JSON或字符串类型
}
示例代码
api.addEventListener({
name:'appintent'
},function(ret,err){
var appParam = ret.appParam;
if(api.systemType == 'ios'){
var iosUrl = ret.iosUrl;
} else {
var sourceAppId = ret.sourceAppId;
}
});

## smartupdatefinish
<!-- anchor: smartupdatefinish -->

云修复使用静默修复时，更新完毕事件。可通过监听此事件来通知用户做是否强制重启应用等操作或者提示，以使更新生效，字符串类型
如果是提示修复，则不会触发该事件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
value:[{
extra:'' //在控制台云修复里面进行静默修复时填写的附加信息，字符串类型
}]
}
不能为空
示例代码
api.addEventListener({
name:'smartupdatefinish'
}, function(ret, err){
api.alert({
msg: '云修复完成'
});
});

## launchviewclicked
<!-- anchor: launchviewclicked -->

闪屏广告被用户点击后的回调，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
callback(ret, err)
ret:
描述：启动页被点击后的回调
内部字段：
{
value:'' //附加信息，字符串类型
}
示例代码
api.addEventListener({
name:'launchviewclicked'
},function(ret,err){
api.alert({
msg:ret.value
});
});

## keyboardshow
<!-- anchor: keyboardshow -->

系统键盘弹出的回调，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.23及更高版本
可提供的1.2.23及更高版本
callback(ret, err)
ret:
描述：键盘弹出的回调
内部字段：
{
h:260 //键盘高度，数字类型
}
示例代码
api.addEventListener({
name:'keyboardshow'
},function(ret, err){
api.alert({
msg:ret.h
});
});

## keyboardhide
<!-- anchor: keyboardhide -->

系统键盘隐藏的回调，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.23及更高版本
可提供的1.2.23及更高版本
callback(ret, err)
示例代码
api.addEventListener({
name:'keyboardhide'
},function(ret, err){
api.alert({
msg:'键盘隐藏'
});
});

## safeareachanged
<!-- anchor: safeareachanged -->

页面安全区域发生变化的回调，可以在回调里根据需要调整页面，只iOS 11及以上系统有效，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.33及更高版本
callback(ret, err)
ret:
描述：安全区域发生变化的回调
内部字段：
{
safeArea: {
top: // 安全区域上边缘，数字类型
left: // 安全区域左边缘，数字类型
bottom: // 安全区域下边缘，数字类型
right: // 安全区域右边缘，数字类型
}
}
示例代码
api.addEventListener({
name:'safeareachanged'
},function(ret, err){
var top = ret.safeArea.top;
api.alert({
msg: top
});
});

## interfacestylechanged
<!-- anchor: interfacestylechanged -->

用户外观设置发生变化事件，例如用户在系统设置开启了深色模式。只iOS 13及以上系统有效，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.3.29及更高版本
callback(ret, err)
ret:
描述：用户外观设置发生变化的回调
内部字段：
{
style: // 变化后的用户外观设置，取值范围dark、light
}
示例代码
api.addEventListener({
name:'interfacestylechanged'
},function(ret, err){
var msg = '当前设置为：' + ret.style;
api.alert({
msg: msg
});
});

## navtitle
<!-- anchor: navtitle -->

监听tabLayout中导航栏标题点击事件。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.3.37及更高版本
可提供的1.3.37及更高版本
示例代码
api.addEventListener({
name:'navtitle'
},function(){
api.alert({
msg: '点击了标题'
});
});

## navbackbtn
<!-- anchor: navbackbtn -->

监听tabLayout中导航栏默认返回按钮点击事件。点击返回按钮时默认会关闭当前window，如果监听了此事件则不会自动关闭。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
示例代码
api.addEventListener({
name:'navbackbtn'
},function(){
api.alert({
msg: '点击了返回按钮'
});
});

## navitembtn
<!-- anchor: navitembtn -->

监听tabLayout中导航栏左右两边自定义按钮点击事件，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
callback(ret, err)
ret:
描述：按钮点击事件的回调
内部字段：
{
index: //点击的按钮的索引，从0开始，数字类型
type: //点击的是左边还是右边的按钮，取值范围left|right，字符串类型
}
示例代码
api.addEventListener({
name:'navitembtn'
},function(ret, err){
api.alert({
msg: '点击了'+ret.type+'按钮'
});
});

## tabitembtn
<!-- anchor: tabitembtn -->

监听tabLayout中tabBar项的点击事件。默认点击每一项时会切换到对应的页面，如果监听了此事件则页面不会自动切换过去，可以通过setTabBarAttr设置选中项，字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
callback(ret, err)
ret:
描述：tabBar项点击事件的回调
内部字段：
{
index: //点击的项的索引，从0开始，数字类型
}
示例代码
api.addEventListener({
name:'tabitembtn'
},function(ret, err){
var index = ret.index + 1;
api.alert({
msg: '点击了第'+index+'项'
});
});

## tabframe
<!-- anchor: tabframe -->

监听tabLayout中有tabBar时frame项的切换事件。字符串类型
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.3.9及更高版本
可提供的1.3.9及更高版本
callback(ret, err)
ret:
描述：frame切换的回调
内部字段：
{
name: //当前显示frame名称，字符串类型
index: //当前显示frame索引，数字类型
}
示例代码
api.addEventListener({
name:'tabframe'
},function(ret, err){
api.alert({
msg: '当前显示frame：'+ret.name
});
});
窗口系统
openWin
closeWin
closeToWin
windows
setWinAttr
openFrame
closeFrame
frames
setFrameAttr
bringFrameToFront
sendFrameToBack
setFrameClient
animation
openFrameGroup
closeFrameGroup
setFrameGroupAttr
setFrameGroupIndex
openPopoverWin
closePopoverWin
openSlidLayout
openSlidPane
closeSlidPane
lockSlidPane
unlockSlidPane
openDrawerLayout
openDrawerPane
closeDrawerPane
loadData
execScript
setBlurEffect
removeLaunchView
showLaunchView
parseTapmode
chooseCity
commonReplyComponent
高级窗口
openTabLayout
setTabLayoutAttr
setNavBarAttr
getNavBarAttr
setTabBarAttr
setTabBarItemAttr
应用管理
installApp
uninstallApp
openApp
appInstalled
rebootApp
openWidget
closeWidget
网络通信
ajax
cancelAjax
download
cancelDownload
imageCache
applyCertificates
数据存储
setPrefs
getPrefs
removePrefs
setGlobalData
getGlobalData
clearCache
getCacheSize
getTotalSpace
getFreeDiskSpace
loadSecureValue
clearStorage
executeDBOperate
getStorage
removeStorage
setStorage
消息事件
addEventListener
removeEventListener
sendEvent
accessNative
notification
cancelNotification
设备访问
startSensor
stopSensor
call
sms
mail
openContacts
setFullScreen
setStatusBarStyle
setScreenOrientation
setKeepScreenOn
toLauncher
setScreenSecure
setAppIconBadge
getPhoneNumber
hasPermission
requestPermission
getInterfaceStyle
setInterfaceStyle
bindSensor
blueToothConnect
blueToothConnectState
blueToothDisConnect
blueToothPrint
blueToothScan
blueToothStopScan
closeConnect
collectRev
collectTmp
collectVib
connectBle
disconnectBle
getBindedSensor
getBlueToothState
getConnectStatus
getConnectedDevice
isSupportedBLE
printFile
printHTML
printPicture
registerConnectStatusListener
releaseBle
releaseYmPrinter
searchBleClient
searchDevices
stopCollect
stopSearch
getClipboardData
setClipboardData
createShortcut
jumpToSystemSetting
getNetworkType
offNetworkStatusChange
onNetworkStatusChange
rfidConnect
rfidDisconnect
startPDAScan
stopPDAScan
zebraPrintImage
zebraPrinterList
makePhoneCall
mdfChangeCustomScanMode
mdfChangeFlashLightStatus
mdfCustomScanQRCode
scanCode
toggleCamera
offUserCaptureScreen
onUserCaptureScreen
vibrateLong
vibrateShort
UI组件
alert
confirm
prompt
actionSheet
showProgress
hideProgress
toast
openPicker
setRefreshHeaderInfo
setCustomRefreshHeaderInfo
refreshHeaderLoading
refreshHeaderLoadDone
showFloatBox
setMenuItems
多媒体
getPicture
saveMediaToAlbum
screenCapture
startRecord
stopRecord
startPlay
pausePlay
stopPlay
openVideo
recordAudio
addImageWaterMark
chooseImage
chooseImageToServer
compressLocalImage
continuousShooting
continuousShootingLocal
deleteBase64Image
getBase64Image
loadImageFromLocal
previewImage
saveBase64Image
saveImageToLocal
chooseVideo
chooseVideoToServer
getVideoThumbnail
插件加载
require
WebApp历史
historyBack
historyForward
路由
navigateBack
navigateTo
reLaunch
redirectTo
位置
startLocation
stopLocation
getLocation
chooseLocation
getLocationInfo
getLocationUpdateInfo
mapLocationExtend
markAndNavigationDestination
startLocationUpdate
stopLocationUpdate
文件
readFile
writeFile
chooseFileFromLibrary
chooseLocalFileToServer
chooseLocalFiles
isFileExist
openDocument
previewDoc
previewFile
wpsPreview
支付
alipayPayment
getWechatBill
wxpayPayment
yonyouPay
yonyouPayQuery
转发
shareWithType
showShareMenu
开放接口
announceDetail
openAnnounceReply
writeAnnounceReply
appletFromQzId
configAppletMenu
enterApplet
getAppData
getAppletCapsuleParams
getAppletShareParams
getGzipAppData
getHhtQrCodeInfo
getOffLineOutSignPhoto
openAppSetting
openAppWithParams
openCustomSetting
openGzipApp
openPluginWithParams
openSearchAppList
openSignViewWithParams
setAppletCapsuleStyle
shareApplet
config
getOAuthCode
chooseChatFromContact
openChatByGroupId
openChatByUserId
sendImageMessages
checkCloudAlarm
operateCloudAlarm
chooseAllContacts
chooseContacts
chooseDepartment
chooseGroupContacts
chooseInsideGroup
chooseUserOrGroupFromChat
convertMemberIDs
openCreateSpace
viewUserInfo
chooseLibraryFiles
openLibraryFiles
openLiveFlow
sendMiniMail
checkMirrorStatus
closeMirrorScreen
startMirrorScreen
collectionData
configSkinAndTabbar
getComponentList
getMultiDataCenterConfig
mdfIsLoad
reloadWorkbenchPath
writeLocationLog
gainUserInfo
getUserAgent
getUserFontSize
getUserYHTInfo
createFeedComponent
createNewSchedule
getSchedulesFromMobile
openScheduleDetail
sendTodoReceipt
viewScheduleDetail
viewScheduleList
getToken
getU8DeviceInfo
u8DeleteAttachment
u8DownLoadAttachment
u8JudgeCacheAttachment
u8PreviewVoucherDetail
u8ScanCode
u8UploadAttachment
setGesturePassword
verifyGesturePassword
verifyLoginPassword
getWatermarkInfo
closeXYChatView
getXYVersion
openXYChatView
AI
faceCollect
faceCompare
faceDetect
smileDetect
startSpeechSyn
stopSpeechSyn
translateVoice
voiceToText
安全
decryptData
encryptData
其它
pageUp
pageDown
setFocus
agreedPrivacy

## openWin
<!-- anchor: openwin -->

打开window
若window已存在，则会把该window显示到最前面，同时若url有变化或者reload参数为true时，页面会重新加载。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
openWin({params})
参数
name：
类型：字符串
默认值：无
描述：window名字
url：
类型：字符串
默认值：无
描述：页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及 widget://、fs://等协议路径，也可以为远程地址。 当data参数不为空时，url将做为baseUrl，data中的html引用的资源文件根路径以该url为基础。
data：
类型：字符串
默认值：无
描述：（可选项）页面加载的数据内容，可以为html片段或者整张html文件的数据
headers：
类型：JSON 对象
默认值：无
描述：（可选项）请求头
singleInstance：
类型：布尔
默认值：false
描述：（可选项）设置该window是否为单例对象。若设置为单例对象，当调用closeWin方法关闭时，window将只是从屏幕移除而不会被销毁，下次再打开时将直接使用已存在的window，而不会再重新创建。
avm：
类型：布尔
默认值：若在config.xml里面配置了avm字段，则默认值为配置的值，否则为false
描述：（可选项）是否使用原生引擎来加载页面，页面必须是使用avm框架语法生成。
useWKWebView：
类型：布尔
默认值：false
描述：（可选项）是否使用WKWebView来加载页面。参考 WKWebView介绍 。
allowAccessFromFile：
类型：布尔
默认值：全局加密下为false
描述：（可选项）设置是否可以在本地页面中访问本地或远程资源，为保证代码安全，在开启全局加密情况下默认禁止访问。只在useWKWebView参数为true时有效。
historyGestureEnabled：
类型：布尔
默认值：false
描述：（可选项）是否可以通过手势来进行历史记录前进后退，只在useWKWebView参数为true时有效。
syncCookie：
类型：布尔
默认值：true
描述：（可选项）是否自动同步WKWebView外部如ajax产生的Cookie到WKWebView中，只在useWKWebView参数为true时有效。
pageParam：
类型：JSON 对象
默认值：无
描述：（可选项）页面参数，新页面中可以通过 api.pageParam 获取
bounces：
类型：布尔
默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为 false
描述：（可选项）页面是否弹动。注意如果页面使用了上拉、下拉刷新等功能，该属性可能会被刷新组件重新设置。
bgColor：
类型：字符串
默认值：若在 config.xml 里面配置了 windowBackground，则默认值为配置的值，否则透明
描述：（可选项）背景色，支持图片和颜色，格式为 #fff、#ffffff、rgba(r,g,b,a)等，图片路径支持 fs://、widget://等 Yonbuilder 移动开发平台自定义文件路径协议，同时支持相对路径
scrollToTop：
类型：布尔
默认值：false
描述：（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的 scrollToTop 属性为 true，则所有的都不会起作用。只 iOS 有效
scrollEnabled：
类型：布尔
默认值：true
描述：（可选项）页面内容超出后是否可以滚动，只支持iOS
vScrollBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示垂直滚动条
hScrollBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示水平滚动条
scaleEnabled：
类型：布尔
默认值：false
描述：（可选项）页面是否可以缩放
hideTopBar：
类型：布尔
默认值：无
描述：（可选项）是否隐藏原生navigationBar控件，该字段只 iOS 有效
hideBottomBar：
类型：布尔
默认值：无
描述：（可选项）是否隐藏原生tabBar控件，该字段只 iOS 有效
slidBackEnabled：
类型：布尔
默认值：true
描述：（可选项）是否支持滑动返回。iOS7.0及以上系统中，在新打开的页面中向右滑动，可以返回到上一个页面，该字段只 iOS 有效
slidBackType：
类型：字符串
默认值：full
描述：（可选项）当支持滑动返回时，设置手指在页面右滑的有效作用区域。取值范围（full:整个页面范围都可以右滑返回，edge:在页面左边缘右滑才可以返回），该字段只iOS有效
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时使用默认动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
（Android系统flip，ripple，curl，un_curl，suck，cube 类型不支持）
progress：
类型：JSON 对象
默认值：无
描述：（可选项）页面加载进度配置信息，若不传则无加载进度效果
内部字段：
{
type: //加载进度效果类型，默认值为 default，取值范围为 default|page，为 page 时，进度效果为仿浏览器类型，固定在页面的顶部
title: //type 为 default 时显示的加载框标题，字符串类型
text: //type 为 default 时显示的加载框内容，字符串类型
color: //type 为 page 时进度条的颜色，默认值为 #45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
height: //type 为 page 时进度条高度，默认值为3，数字类型
}
delay：
类型：数字
默认值：0
描述：（可选项）window 显示延迟时间，适用于将被打开的 window 中可能需要打开有耗时操作的插件时，可延迟 window 展示到屏幕的时间，保持 UI 的整体性
reload：
类型：布尔
默认值：false
描述：（可选项）页面已经打开时，是否重新加载页面，重新加载页面后 apiready 方法将会被执行
allowEdit：
类型：布尔
默认值：false
描述：（可选项）是否允许长按页面时弹出选择菜单
softInputMode：
类型：字符串
默认值：auto
描述：（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效，Android请在 config.xml 里面配置并云编译使用
取值范围：
resize //若键盘盖住输入框，页面会自动上移
pan //若键盘盖住输入框，页面不会自动上移
auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputDismissMode：
类型：字符串数组
默认值：['tap']
描述：（可选项）收起键盘的方式，只iOS有效。
取值范围：
tap //点击页面收起键盘，可以和drag或interactive同时使用
drag //拖拽页面时收起键盘，可以和tap同时使用
interactive //在键盘和页面交界处上下滑动收起键盘，可以和tap同时使用
softInputBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示键盘上方的工具条。只支持iOS
overScrollMode:
类型：字符串
默认值：never
描述：（可选项）设置页面滚动到头部或尾部时，显示回弹阴影效果的模式，仅Android有效。
取值范围：
never //永远不显示
always //总是显示
scrolls //只有当页面内容超出设备屏幕大小，发生滚动行为时显示，建议设置为该模式。
dragAndDrop：
类型：布尔
默认值：false
描述：（可选项）是否允许iOS 11及以上系统中页面元素默认的拖拽行为。只支持iOS
hideHomeIndicator：
类型：布尔
默认值：false
描述：（可选项）是否隐藏虚拟home键。设置为true时，虚拟home键会在屏幕没有触摸操作时自动隐藏，触摸后又会显示出来。只支持iOS
defaultRefreshHeader：
类型：字符串
默认值：pull
描述：（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader：
类型：字符串
默认值：无
描述：（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用 api.setCustomRefreshHeaderInfo 方法来使用自定义下拉刷新组件
示例代码
api.openWin({
name: 'page1',
url: './page1.html',
pageParam: {
name: 'test'
}
});
补充说明
窗口操作

## closeWin
<!-- anchor: closewin -->

关闭 window
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
closeWin({params})
参数
name：
类型：字符串
默认值：无
描述：（可选项）window 名字，不传时关闭当前 window，为 root 时无效
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时使用默认动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
示例代码
//关闭当前window，使用默认动画
api.closeWin();
//关闭指定window，若待关闭的window不在最上面，则无动画
api.closeWin({
name: 'page1'
});

## closeToWin
<!-- anchor: closetowin -->

关闭到指定 window，最上面显示的 window 到指定 name 的 window 间的所有 window 都会被关闭。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
closeToWin({params})
参数
name：
类型：字符串
默认值：无
描述：window 名字
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时使用默认动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
示例代码
api.closeToWin({
name: 'root'
});

## windows
<!-- anchor: windows -->

获取当前所有打开的window。该方法为同步方法。
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.95及更高版本
可提供的1.2.95及更高版本
windows()
return
类型：JSON对象数组
内部字段
[{
name:'', // window名字，字符串类型
children:[{ // window中的子window，如drawerLayout中的leftPane和rightPane，JSON对象数组类型
name:''
}]
}]
示例代码
var windows = api.windows();
api.alert({
msg:JSON.stringify(windows)
});

## setWinAttr
<!-- anchor: setwinattr -->

设置 window 属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setWinAttr({params})
参数
bounces：
类型：布尔
默认值：无
描述：（可选项）页面是否弹动
bgColor：
类型：字符串
默认值：无
描述：（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
scrollToTop：
类型：布尔
默认值：无
描述：（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。只iOS有效
scrollEnabled：
类型：布尔
默认值：无
描述：（可选项）页面内容超出后是否可以滚动，只支持iOS
vScrollBarEnabled：
类型：布尔
默认值：无
描述：（可选项）是否显示垂直滚动条
hScrollBarEnabled：
类型：布尔
默认值：无
描述：（可选项）是否显示水平滚动条
scaleEnabled：
类型：布尔
默认值：无
描述：（可选项）页面是否可以缩放
slidBackEnabled：
类型：布尔
默认值：无
描述：（可选项）是否支持滑动返回。iOS7.0及以上系统中，在新打开的页面中向右滑动，可以返回到上一个页面，该字段只iOS有效
hideHomeIndicator：
类型：布尔
默认值：无
描述：（可选项）是否隐藏虚拟home键。设置为true时，虚拟home键会在屏幕没有触摸操作时自动隐藏，触摸后又会显示出来。只支持iOS
allowEdit：
类型：布尔
默认值：无
描述：（可选项）是否允许长按页面时弹出选择菜单
softInputMode：
类型：字符串
默认值：无
描述：（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式；只iOS有效，Android请在 config.xml 里面配置并云编译使用
取值范围
resize //若键盘盖住输入框，页面会自动上移
pan //若键盘盖住输入框，页面不会自动上移
auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
示例代码
api.setWinAttr({
bounces: true
});

## openFrame
<!-- anchor: openframe -->

打开 frame
若 frame 已存在，则会把该窗口显示到最前面并显示，如果 url 和之前的 url 有变化，或者 reload 为 true 时，页面会刷新
此方法对 frameGroup 里面的 frame 不起作用
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openFrame({params})
参数
name：
类型：字符串
默认值：无
描述：frame 名字
url：
类型：字符串
默认值：无
描述：页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及 widget://、fs://等协议路径，也可以为远程地址。 当data参数不为空时，url将做为baseUrl，data中的html引用的资源文件根路径以该url为基础。
data：
类型：字符串
默认值：无
描述：（可选项）页面加载的数据内容，可以为html片段或者整张html文件的数据
headers：
类型：JSON 对象
默认值：无
描述：（可选项）请求头
avm：
类型：布尔
默认值：若在config.xml里面配置了avm字段，则默认值为配置的值，否则为false
描述：（可选项）是否使用原生引擎来加载页面，页面必须是使用avm框架语法生成。
useWKWebView：
类型：布尔
默认值：false
描述：（可选项）是否使用WKWebView来加载页面。参考 WKWebView介绍 。
allowAccessFromFile：
类型：布尔
默认值：全局加密下为false
描述：（可选项）设置是否可以在本地页面中访问本地或远程资源，为保证代码安全，在开启全局加密情况下默认禁止访问。只在useWKWebView参数为true时有效。
historyGestureEnabled：
类型：布尔
默认值：false
描述：（可选项）是否可以通过手势来进行历史记录前进后退，只在useWKWebView参数为true时有效。
syncCookie：
类型：布尔
默认值：true
描述：（可选项）是否自动同步WKWebView外部如ajax产生的Cookie到WKWebView中，只在useWKWebView参数为true时有效。
pageParam：
类型：JSON 对象
默认值：无
描述：（可选项）页面参数，在新页面通过 api.pageParam 获取
bounces：
类型：布尔
默认值：若在 config.xml 里面配置了 pageBounce，则默认值为配置的值，否则为 true
描述：（可选项）页面是否弹动。注意如果页面使用了上拉、下拉刷新等功能，该属性可能会被刷新组件重新设置。
bgColor：
类型：字符串
默认值：若在 config.xml 里面配置了 frameBackgroundColor，则默认值为配置的值，否则透明
描述：（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等 Yonbuilder 移动开发平台自定义文件路径协议，同时支持相对路径
scrollToTop：
类型：布尔
默认值：true
描述：（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的 scrollToTop 属性为 true，则所有的都不会起作用。只iOS有效
scrollEnabled：
类型：布尔
默认值：true
描述：（可选项）页面内容超出后是否可以滚动，只支持iOS
vScrollBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示垂直滚动条
hScrollBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示水平滚动条
scaleEnabled：
类型：布尔
默认值：false
描述：（可选项）页面是否可以缩放
fixedOn：
类型：字符串
默认值：若当前在 tabLayout 组件中为 ui_layout，否则为 ui_window
描述：（可选项）frame 所要添加到的目标页面。
取值范围：
ui_window //页面添加到当前 window 中。若当前在 tabLayout 组件中，页面只能添加到 navigationBar 和 tabBar 之间的区域，无法覆盖在 navigationBar、tabBar 之上。
ui_layout //页面添加到当前 tabLayout 中。此时页面能够添加到 tabLayout 中任意位置，能够覆盖在 navigationBar、tabBar 之上，只在 tabLayout 组件中有效。
ui_widget //页面添加到当前 widget 容器最上层，即使 window 切换时依然显示在最上层。
rect：
类型：JSON 对象
默认值：充满整个父页面
描述：（可选项）设置页面的位置和大小。如果要固定宽高则使用 x、y、w、h 等参数；如果要自适应状态栏高度变化、横竖屏切换等，则需要使用 margin 相关参数，不能使用 w、h 固定宽高。推荐使用 margin 相关参数来布局。
内部字段：
{
x:, //左上角x坐标，数字类型
y:, //左上角y坐标，数字类型
w:, //宽度，若传'auto'，页面从x位置开始自动充满父页面宽度，数字或固定值'auto'
h:, //高度，若传'auto'，页面从y位置开始自动充满父页面高度，数字或固定值'auto'
marginLeft:, //相对父页面左外边距的距离，数字类型
marginTop:, //相对父页面上外边距的距离，数字类型
marginBottom:, //相对父页面下外边距的距离，数字类型
marginRight: //相对父页面右外边距的距离，数字类型
}
progress：
类型：JSON 对象
默认值：无
描述：（可选项）页面加载进度配置信息，若不传则无加载进度效果
内部字段：
{
type: //加载进度效果类型，默认值为 default，取值范围为 default|page，为 page 时，进度效果为仿浏览器类型，固定在页面的顶部
title: //type 为 default 时显示的加载框标题，字符串类型
text: //type 为 default 时显示的加载框内容，字符串类型
color: //type 为 page 时进度条的颜色，默认值为 #45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
height: //type 为 page 时进度条高度，默认值为3，数字类型
}
reload：
类型：布尔
默认值：false
描述：（可选项）页面已经打开时，是否重新加载页面
allowEdit：
类型：布尔
默认值：false
描述：（可选项）是否允许长按页面时弹出选择菜单
softInputMode：
类型：字符串
默认值：auto
描述：（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式,只iOS有效，Android请在 config.xml 里面配置并云编译使用
softInputDismissMode：
类型：字符串数组
默认值：['tap']
描述：（可选项）收起键盘的方式，只iOS有效。
取值范围：
tap //点击页面收起键盘，可以和drag或interactive同时使用
drag //拖拽页面时收起键盘，可以和tap同时使用
interactive //在键盘和页面交界处上下滑动收起键盘，可以和tap同时使用
softInputBarEnabled：
类型：布尔
默认值：true
描述：（可选项）是否显示键盘上方的工具条。只支持iOS
overScrollMode:
类型：字符串
默认值：never
描述：（可选项）设置页面滚动到头部或尾部时，显示回弹阴影效果的模式，仅Android有效。
取值范围：
never //永远不显示
always //总是显示
scrolls //只有当页面内容超出设备屏幕大小，发生滚动行为时显示，建议设置为该模式。
dragAndDrop：
类型：布尔
默认值：false
描述：（可选项）是否允许iOS 11及以上系统中页面元素默认的拖拽行为。只支持iOS
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时无动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
defaultRefreshHeader：
类型：字符串
默认值：pull
描述：（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader：
类型：字符串
默认值：无
描述：（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用 api.setCustomRefreshHeaderInfo 方法来使用自定义下拉刷新组件
示例代码
api.openFrame({
name: 'page2',
url: './page2.html',
rect: {
x: 0,
y: 0,
w: 'auto',
h: 'auto'
},
pageParam: {
name: 'test'
}
});

## closeFrame
<!-- anchor: closeframe -->

关闭frame
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
closeFrame({params})
参数
name：
类型：字符串
默认值：无
描述：（可选项）frame 名字，不传时关闭当前 frame
示例代码
api.closeFrame({
name: 'page2'
});

## frames
<!-- anchor: frames -->

获取当前window中所有打开的frame（包括frameGroup中的frame）。该方法为同步方法。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.95及更高版本
可提供的1.2.95及更高版本
frames()
return
类型：JSON对象数组
内部字段
[{
name:'', // frame名字，字符串类型
parent:'' // 父窗口的名字，如果是frameGroup中的frame，该值为frameGroup的名字，字符串类型
}]
示例代码
var frames = api.frames();
api.alert({
msg:JSON.stringify(frames)
});

## setFrameAttr
<!-- anchor: setframeattr -->

设置frame属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setFrameAttr({params})
参数
name：
类型：字符串
默认值：无
描述：frame 名称
bounces：
类型：布尔
默认值：无
描述：（可选项）页面是否弹动
hidden：
类型：布尔
默认值：无
描述：（可选项）设置本 frame 是否隐藏，设置显示隐藏并不会改变frame在整个窗口系统之间的层级关系。
bgColor：
类型：字符串
默认值：无
描述：（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等 Yonbuilder 移动开发平台自定义文件路径协议，同时支持相对路径
scrollToTop：
类型：布尔
默认值：无
描述：（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的 scrollToTop 属性为 true，则所有的都不会起作用。只iOS有效
scrollEnabled：
类型：布尔
默认值：无
描述：（可选项）页面内容超出后是否可以滚动，只支持iOS
vScrollBarEnabled：
类型：布尔
默认值：无
描述：（可选项）是否显示垂直滚动条
hScrollBarEnabled：
类型：布尔
默认值：无
描述：（可选项）是否显示水平滚动条
scaleEnabled：
类型：布尔
默认值：无
描述：（可选项）页面是否可以缩放
allowEdit：
类型：布尔
默认值：无
描述：（可选项）是否允许长按页面时弹出选择菜单
rect：
类型：JSON 对象
默认值：无
描述：（可选项）窗口区域
内部字段：
{
x:0, //左上角x坐标
y:0, //左上角y坐标
w:320, //宽度，若传'auto'，页面从x位置开始自动充满父页面宽度
h:480 //高度，若传'auto'，页面从y位置开始自动充满父页面高度
}
softInputMode：
类型：字符串
默认值：无
描述：（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式,只iOS有效，Android请在 config.xml 里面配置并云编译使用
取值范围：
resize //若键盘盖住输入框，页面会自动上移
pan //若键盘盖住输入框，页面不会自动上移
auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
示例代码
api.setFrameAttr({
name: 'page2',
bounces: true
});
补充说明
设置 frame 属性

## bringFrameToFront
<!-- anchor: bringframetofront -->

调整 frame 到前面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
bringFrameToFront({params})
参数
from：
类型：字符串
默认值：无
描述：待调整显示顺序的 frame 名字
to：
类型：字符串
默认值：无
描述：（可选项）frame 名字，不传时调整 from 对应 frame 到最前面，否则调整 from 对应 frame 到此 frame 前面
示例代码
api.bringFrameToFront({
from: 'page1',
to: 'page2'
});
补充说明
调整 frame 到前面

## sendFrameToBack
<!-- anchor: sendframetoback -->

调整 frame 到后面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
sendFrameToBack({params})
参数
from：
类型：字符串
默认值：无
描述：frame 名字
to：
类型：字符串
默认值：无
描述：（可选项）frame 名字，不传时调整 from 对应 frame 到最后面，否则调整 from 对应 frame 到此 frame 后面
示例代码
api.sendFrameToBack({
from: 'page1',
to: 'page2'
});
补充说明
调整 frame 到后面

## setFrameClient
<!-- anchor: setframeclient -->

设置指定 frame 的页面加载监听，仅在 window 中调用生效，可以对多个 frame 进行监听。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
setFrameClient({params}, callback(ret, err))
参数
frameName：
类型：字符串
默认值：无
描述：frame 名字
callback(ret, err)
ret：
类型：JSON 对象
描述：frame 加载状态、加载进度等发生变化时的回调
内部字段：
{
state:0, //加载状态，数字类型，取值范围：0-开始加载；1-加载进度发生变化；2-结束加载；3-title发生变化；4-url发生变化
progress:0, //state为1时，页面的加载进度，数字类型，取值范围 0-100
title:'', //state为3时，页面当前的title，字符串类型
url:'' //state为0|2|4时，页面当前的url，字符串类型
}
示例代码
api.setFrameClient({
frameName: 'webpage'
}, function(ret, err) {
switch (ret.state) {
case 0:
break;
case 1:
break;
case 2:
break;
case 3:
break;
case 4:
break;
default:
break;
}
});

## animation
<!-- anchor: animation -->

frame 动画，支持平移，缩放，旋转和透明度变化
仅支持 frame，不支持 window 以及 frameGroup 里面的 frame
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
animation({params}, callback(ret, err))
参数
name：
类型：字符串
默认值：当前 frame
描述：frame 名字
delay：
类型：数字
默认值：0
描述：（可选项）动画延迟时间，单位毫秒，默认立即开始
duration：
类型：数字
默认值：0
描述：（可选项）动画过渡时间，单位毫秒
curve：
类型：字符串
默认值：ease_in_out
描述：（可选项）动画曲线类型，指定动画开始和结束时的快慢
取值范围
ease_in_out //开始和结束时慢
ease_in //开始时慢
ease_out //结束时慢
linear //整个动画过程速率一样
repeatCount：
类型：数字
默认值：0
描述：（可选项）动画次数，默认不重复，为-1时无限重复
autoreverse：
类型：布尔
默认值：false
描述：（可选项）一次动画结束后是否自动反转动画
alpha：
类型：数字
默认值：无
描述：（可选项）整个页面的透明度，介于0 1之间，Android 不支持
translation：
类型：JSON
默认值：无
描述：（可选项）位置平移参数
内部字段：
{
x: 0, //x轴方向上的平移距离，默认为0
y: 0, //y轴方向上的平移距离，默认为0
z: 0 //z轴方向上的平移距离，默认为0，Android不支持
}
scale：
类型：JSON
默认值：无
描述：（可选项）页面缩放参数，Android 不支持
内部字段：
{
x: 1, //x轴方向上的放大倍率，默认为1
y: 1, //y轴方向上的放大倍率，默认为1
z: 1 //z轴方向上的放大倍率，默认为1
}
rotation：
类型：JSON
默认值：无
描述：（可选项）页面旋转参数，Android 不支持
内部字段：
{
degree:0, //旋转角度，默认0
x: 0, //绕x轴旋转，默认为0
y: 0, //绕y轴旋转，默认为0
z: 1 //绕z轴旋转，默认为1
}
callback(ret, err)
动画结束后的回调
示例代码
api.animation({
name: 'page1',
delay: 1000,
duration: 3000,
curve: 'ease_in',
repeatCount: 2,
autoreverse: true,
alpha: 0.6,
translation: {
x: 0,
y: 100,
z: 0
},
scale: {
x: 1.2,
y: 1,
z: 1
},
rotation: {
degree: 45,
x: 0,
y: 0,
z: 1
}
}, function(ret, err) {
api.alert({
msg:'动画结束'
});
});

## openFrameGroup
<!-- anchor: openframegroup -->

打开frame组
若frame组已存在，则会把该frame组显示到最前面。frame组打开后，当前页面加载完成后，页面会预加载后面指定个数页面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openFrameGroup({params}, callback(ret, err))
参数
name：
类型：字符串
默认值：无
描述：frame 组名字
background：
类型：字符串
默认值：无
描述：（可选项）frame 组背景，颜色（#fff,#ffffff,rgba(r,g,b,a)）或图片（支持文件路径协议和相对路径）
scrollEnabled：
类型：布尔
默认值：true
描述：（可选项）frame 组是否能够左右滚动
fixedOn：
类型：字符串
默认值：若当前在 tabLayout 组件中为 ui_layout，否则为 ui_window
描述：（可选项）frameGroup 所要添加到的目标页面。
取值范围：
ui_window //页面添加到当前 window 中。若当前在 tabLayout 组件中，页面只能添加到 navigationBar 和 tabBar 之间的区域，无法覆盖在 navigationBar、tabBar 之上。
ui_layout //页面添加到当前 tabLayout 中。此时页面能够添加到 tabLayout 中任意位置，能够覆盖在 navigationBar、tabBar 之上，只在 tabLayout 组件中有效。
ui_widget //页面添加到当前 widget 容器最上层，即使 window 切换时依然显示在最上层。
rect：
类型：JSON 对象
默认值：充满整个父页面
描述：（可选项）设置 frameGroup 的位置和大小。如果要固定宽高则使用 x、y、w、h 等参数；如果要自适应状态栏高度变化、横竖屏切换等，则需要使用 margin 相关参数，不能使用 w、h 固定宽高。推荐使用 margin 相关参数来布局。
内部字段：
{
x:, //左上角x坐标，数字类型
y:, //左上角y坐标，数字类型
w:, //宽度，若传'auto'，页面从x位置开始自动充满父页面宽度，数字或固定值'auto'
h:, //高度，若传'auto'，页面从y位置开始自动充满父页面高度，数字或固定值'auto'
marginLeft:, //相对父页面左外边距的距离，数字类型
marginTop:, //相对父页面上外边距的距离，数字类型
marginBottom:, //相对父页面下外边距的距离，数字类型
marginRight: //相对父页面右外边距的距离，数字类型
}
index：
类型：数字
默认值：0
描述：（可选项）默认显示的页面索引
preload：
类型：数字
默认值：1
描述：（可选项）预加载的 frame 个数，默认加载当前页后面一个
frames：
类型：数组
默认值：无
描述：frame 数组
内部字段：
[{
name:'', //frame名字，字符串类型，不能为空字符串
url:'', //页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及 widget://、fs://等协议路径，也可以为远程地址。 当data参数不为空时，url将做为baseUrl，data中的html引用的资源文件根路径以该url为基础。字符串类型
data:'', //（可选项）页面加载的数据内容，可以为html片段或者整张html文件的数据
headers:{}, //（可选项）请求头
avm:false, //（可选项）是否使用原生引擎来加载页面，页面必须是使用avm框架语法生成。
useWKWebView:false, //（可选项）是否使用WKWebView来加载页面。参考[WKWebView介绍](https://community.yonyou.com/thread-151904-1-1.html)。
allowAccessFromFile:false, //（可选项）设置是否可以在本地页面中访问本地或远程资源，为保证代码安全，在开启全局加密情况下默认禁止访问。只在useWKWebView参数为true时有效。
historyGestureEnabled:false, //（可选项）是否可以通过手势来进行历史记录前进后退，只在useWKWebView参数为true时有效。
pageParam:{}, //（可选项）页面参数，页面中可以通过api.pageParam获取，JSON对象
bounces:true, //（可选项）是否弹动，布尔型，默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为true。注意如果页面使用了上拉、下拉刷新等功能，该属性可能会被刷新组件重新设置。
bgColor:'#fff', //（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
scrollToTop:true //（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。默认值：true。只iOS有效
scrollEnabled:true //（可选项）页面内容超出后是否可以滚动，默认为true，只支持iOS
vScrollBarEnabled:true, //（可选项）是否显示垂直滚动条，布尔型，默认值：true
hScrollBarEnabled:false, //（可选项）是否显示水平滚动条，布尔型，默认值：false
scaleEnabled:true, //（可选项）页面是否可以缩放，布尔型，默认值：false
allowEdit:false, //（可选项）是否允许长按页面时弹出选择菜单
softInputMode:'auto' //（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效。
//取值范围：
//resize //若键盘盖住输入框，页面会自动上移
//pan //若键盘盖住输入框，页面不会自动上移
//auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputBarEnabled:false, //（可选项）是否显示键盘上方的工具条，布尔型，默认值：true，只iOS有效
overScrollMode, //（可选项）设置页面滚动到头部或尾部时，显示回弹阴影效果的模式，仅Android有效。取值范围：never，always，scrolls
defaultRefreshHeader:'' //（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader:'' //（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用api.setCustomRefreshHeaderInfo方法来使用自定义下拉刷新组件
}]
callback(ret, err)
ret：
类型：JSON 对象
描述：当前显示在屏幕上的 frame 变化时会回调
内部字段：
{
name:'', //当前 frame 名称
index:0 //当前 frame 索引
}
示例代码
api.openFrameGroup({
name: 'group1',
rect: {
x: 0,
y: 0,
w: 'auto',
h: 'auto'
},
frames: [{
name: 'frame1',
url: 'frame1.html',
bgColor: '#fff'
}, {
name: 'frame2',
url: 'frame2.html',
bgColor: '#fff'
}]
}, function(ret, err) {
var index = ret.index;
});

## closeFrameGroup
<!-- anchor: closeframegroup -->

关闭frame组
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
closeFrameGroup({params})
参数
name：
类型：字符串
默认值：无
描述：frame 组名字
示例代码
api.closeFrameGroup({
name: 'group1'
});

## setFrameGroupAttr
<!-- anchor: setframegroupattr -->

设置 frame 组属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setFrameGroupAttr({params})
参数
name：
类型：字符串
默认值：无
描述：frame 组名字
hidden：
类型：布尔
默认值：无
描述：（可选项）frame 组是否隐藏，设置显示隐藏并不会改变frame组在整个窗口系统之间的层级关系。
scrollEnabled：
类型：布尔
默认值：无
描述：（可选项）frame 组是否能够左右滚动
rect：
类型：JSON 对象
默认值：无
描述：（可选项）frame 组区域
内部字段：
{
x:0, //左上角x坐标
y:0, //左上角y坐标
w:320, //宽度，若传'auto'，frame组从x位置开始自动充满父页面宽度
h:240 //高度，若传'auto'，frame组从y位置开始自动充满父页面高度
}
示例代码
api.setFrameGroupAttr({
name: 'group1',
hidden: true
});

## setFrameGroupIndex
<!-- anchor: setframegroupindex -->

显示或重新加载指定页面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setFrameGroupIndex({params})
参数
name：
类型：字符串
默认值：无
描述：frame 组名字
index：
类型：数字
默认值：无
描述：frame 索引
scroll：
类型：布尔
默认值：false
描述：（可选项）是否平滑滚动至目标窗口，即是否带有动画
reload：
类型：布尔
默认值：false
描述：（可选项）是否刷新 frame
url：
类型：字符串
默认值：无
描述：frame 的 url
示例代码
api.setFrameGroupIndex({
name: 'group1',
index: 2
});

## openPopoverWin
<!-- anchor: openpopoverwin -->

打开弹出层窗口，只支持iPad
在弹出层窗口里面不能再打开弹出窗口，页面可以使用所有的 window 和 frame 相关操作，如 openWin、openFrame 等，此方法能够使用openWin方法的所有参数
使用 execScript() 方法时，引擎只会在整个弹出层里面的窗口中去寻找要执行脚本的窗口，如果要和弹出层下面的窗口间进行通信，可以使用 sendEvent() 方法实现
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
openPopoverWin({params})
参数
style：
类型：字符串
默认值：default
描述：（可选项）弹出窗口展示类型
取值范围
default // 弹出层从底部往上弹出，显示在屏幕中间一片指定区域，周围为黑色半透明
popover // 弹出层带指示箭头，可设置箭头方向和位置
width：
类型：数字
默认值：540
描述：（可选项）弹出窗口显示的宽度
height：
类型：数字
默认值：620
描述：（可选项）弹出窗口显示的高度
arrowRect：
类型：JSON 对象
默认值：无
描述：（可选项）当style为popover时，箭头指向的位置
内部字段：
{
x:0, //左上角x坐标，数字类型
y:0, //左上角y坐标，数字类型
w:0, //宽度，数字类型
h:0, //高度，数字类型
}
arrowDirection：
类型：字符串
默认值：any
描述：（可选项）当style为popover时，箭头指向的方向
取值范围
left // 指向左边
right // 指向右边
up // 指向上边
down // 指向下边
any // 系统根据页面情况选择合适的方向
示例代码
api.openPopoverWin({
width: 480,
height: 400,
name: 'page1',
url: './page1.html'
});

## closePopoverWin
<!-- anchor: closepopoverwin -->

关闭整个弹出层窗口，只 iPad 上面有效
在当前弹出层里面的任意页面里面调用都会关闭整个弹出层
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.0.0及更高版本
closePopoverWin()
示例代码
api.closePopoverWin();

## openSlidLayout
<!-- anchor: openslidlayout -->

打开侧滑式布局
打开后，其所在 window 的 name 默认为 slidLayout，所以关闭整个侧滑布局可以通过 api.closeWin({name:'slidLayout'}) 实现，同时可以通过 api.openWin({name:'slidLayout'})来把整个侧滑显示到最前面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openSlidLayout({params}, callback(ret, err))
参数
type：
类型：字符串
默认值：all
描述：（可选项）侧滑类型（left：左侧滑、right：右侧滑、all：左右侧滑）。安卓暂只支持left。
leftEdge：
类型：数字
默认值：60
描述：（可选项）左侧滑时，侧滑 window 停留时露出的宽度。即将废弃，用 slidPaneStyle 中 leftEdge 参数代替
rightEdge：
类型：数字
默认值：60
描述：（可选项）右侧滑时，侧滑 window 停留时露出的宽度。即将废弃，用 slidPaneStyle 中 rightEdge 参数代替
slidPaneStyle：
类型：JSON 对象
默认值：无
描述：侧滑层 window 样式
内部字段：
{
leftEdge: //（可选项）左侧滑时，侧滑window停留时露出的宽度，默认60，数字类型
rightEdge: //（可选项）右侧滑时，侧滑window停留时露出的宽度，默认60，数字类型
leftScale: //（可选项）左侧滑时，侧滑window移动时能缩放的最小倍数，0-1.0，默认1.0，数字类型，只支持iOS
rightScale: //（可选项）右侧滑时，侧滑window移动时能缩放的最小倍数，0-1.0，默认1.0，数字类型，只支持iOS
}
fixedPaneStyle：
类型：JSON 对象
默认值：无
描述：底部固定层 window 样式
内部字段：
{
leftEdge: //（可选项）左侧滑时，固定window能向左移动的最大宽度，默认0，数字类型，只支持iOS
rightEdge: //（可选项）右侧滑时，固定window能向右移动的最大宽度，默认0，数字类型，只支持iOS
leftScale: //（可选项）左侧滑时，固定window向左移动时能缩放的最小倍数，0-1.0，默认1.0，数字类型，只支持iOS
rightScale: //（可选项）右侧滑时，固定window向右移动时能缩放的最小倍数，0-1.0，默认1.0，数字类型，只支持iOS
leftMaskBg: //（可选项）左侧滑时，固定window上面的遮罩层背景，支持颜色和图片，默认rgba(0,0,0,0)，字符串类型，只支持iOS
rightMaskBg: //（可选项）右侧滑时，固定window上面的遮罩层背景，支持颜色和图片，默认rgba(0,0,0,0)，字符串类型，只支持iOS
leftBg: //（可选项）左侧滑时，固定window后面的背景，缩放过程中后面的背景将会显示出来，支持颜色和图片，默认rgba(0,0,0,0)，字符串类型，只支持iOS
rightBg: //（可选项）右侧滑时，固定window后面的背景，缩放过程中后面的背景将会显示出来，支持颜色和图片，默认rgba(0,0,0,0)，字符串类型，只支持iOS
}
fixedPane：
类型：JSON 对象
默认值：无
描述：底部固定层 window
内部字段：
{
name:'', // window名字（字符串类型）
url:'', // 页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及widget://、fs://等协议路径，也可以为远程地址
pageParam:{}, //（可选项）页面参数，页面中可以通过api.pageParam获取，JSON对象
bgColor:'', //（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
bounces:false, //（可选项）是否弹动，默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为false
scrollToTop:false //（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。默认值：true。只iOS有效
scrollEnabled:true //（可选项）页面内容超出后是否可以滚动，默认为true，只支持iOS
vScrollBarEnabled:true, //（可选项）是否显示垂直滚动条，默认true
hScrollBarEnabled:true, //（可选项）是否显示水平滚动条，默认true
scaleEnabled:true, //（可选项）页面是否可以缩放，布尔型，默认值：false
allowEdit:false, //（可选项）是否允许长按页面时弹出选择菜单
softInputMode:'auto' //（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效
//取值范围：
//resize //若键盘盖住输入框，页面会自动上移
//pan //若键盘盖住输入框，页面不会自动上移
//auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputBarEnabled:false, //（可选项）是否显示键盘上方的工具条，布尔型，默认值：true，只iOS有效
defaultRefreshHeader:'' //（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader:'' //（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用api.setCustomRefreshHeaderInfo方法来使用自定义下拉刷新组件
}
slidPane：
类型：JSON 对象
默认值：无
描述：侧滑层window
内部字段：
{
name:'', // window名字（字符串类型）
url:'', // 页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及widget://、fs://等协议路径，也可以为远程地址
pageParam:{}, //（可选项）页面参数，页面中可以通过api.pageParam获取，JSON对象
bgColor:'', //（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
bounces:false, //（可选项）是否弹动，默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为false
scrollToTop:false //（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。默认值：true。只iOS有效
scrollEnabled:true //（可选项）页面内容超出后是否可以滚动，默认为true，只支持iOS
vScrollBarEnabled:true, //（可选项）是否显示垂直滚动条，默认true
hScrollBarEnabled:true, //（可选项）是否显示水平滚动条，默认true
scaleEnabled:true, //（可选项）页面是否可以缩放，布尔型，默认值：false
allowEdit:false, //（可选项）是否允许长按页面时弹出选择菜单
softInputMode:'auto' //（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效
//取值范围：
//resize //若键盘盖住输入框，页面会自动上移
//pan //若键盘盖住输入框，页面不会自动上移
//auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputBarEnabled:false, //（可选项）是否显示键盘上方的工具条，布尔型，默认值：true，只iOS有效
defaultRefreshHeader:'' //（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader:'' //（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用api.setCustomRefreshHeaderInfo方法来使用自定义下拉刷新组件
}
callback(ret, err)
ret：
类型：JSON 对象
描述：手指头触摸屏幕，引起开始侧滑时的回调，左右侧滑时应该在这里面判断显示左边页面还是右边页面
内部字段：
{
type: 'left' //侧滑方向，left或right
event: 'slide' //侧滑事件，（slide-当前处于滑动状态、open-侧滑打开状态、close-侧滑关闭状态
}
示例代码
api.openSlidLayout({
type: 'left',
fixedPane: {
name: 'win1',
url: 'win1.html'
},
slidPane: {
name: 'win2',
url: 'win2.html'
}
}, function(ret, err) {
});

## openSlidPane
<!-- anchor: openslidpane -->

向左或右进行侧滑
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openSlidPane({params})
参数
type：
类型：字符串
默认值：无
描述：侧滑类型，left 或 right
示例代码
api.openSlidPane({
type: 'left'
});

## closeSlidPane
<!-- anchor: closeslidpane -->

当 SlidPane 处于左或右侧滑状态时，将其收起
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
closeSlidPane()
示例代码
api.closeSlidPane();

## lockSlidPane
<!-- anchor: lockslidpane -->

锁住 SlidPane，使其不能跟随手指滑动而移动
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
lockSlidPane()
示例代码
api.lockSlidPane();

## unlockSlidPane
<!-- anchor: unlockslidpane -->

解锁 SlidPane，使其能跟随手指滑动而移动
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
unlockSlidPane()
示例代码
api.unlockSlidPane();

## openDrawerLayout
<!-- anchor: opendrawerlayout -->

打开一个抽屉式侧滑 window，可以从当前 window 的左右边缘滑动拉出侧滑 window。
此方法能够使用 openWin 方法的所有参数，在此基础上增加了 leftPane、rightPane 等参数，可以通过 api.closeWin()方法来关闭整个抽屉式侧滑。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
openDrawerLayout({params})
参数
leftPane：
类型：JSON 对象
默认值：无
描述：左边侧滑 window
内部字段：
{
edge:60, // 左边侧滑打开后，漏出的半透明区域宽度，默认值为60。此时左边侧滑window的宽度为屏幕宽度减去edge
name:'', // window名字（字符串类型）
url:'', // 页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及widget://、fs://等协议路径，也可以为远程地址
pageParam:{}, //（可选项）页面参数，页面中可以通过api.pageParam获取，JSON对象
bgColor:'', //（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
bounces:false, //（可选项）是否弹动，默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为false
scrollToTop:false, //（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。默认值：true。只iOS有效
scrollEnabled:true //（可选项）页面内容超出后是否可以滚动，默认为true，只支持iOS
vScrollBarEnabled:true, //（可选项）是否显示垂直滚动条，默认true
hScrollBarEnabled:true, //（可选项）是否显示水平滚动条，默认true
scaleEnabled:true, //（可选项）页面是否可以缩放，布尔型，默认值：false
allowEdit:false, //（可选项）是否允许长按页面时弹出选择菜单
softInputMode:'auto', //（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效
//取值范围：
//resize //若键盘盖住输入框，页面会自动上移
//pan //若键盘盖住输入框，页面不会自动上移
//auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputBarEnabled:false, //（可选项）是否显示键盘上方的工具条，布尔型，默认值：true，只iOS有效
defaultRefreshHeader:'' //（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader:'' //（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用api.setCustomRefreshHeaderInfo方法来使用自定义下拉刷新组件
}
rightPane：
类型：JSON 对象
默认值：无
描述：右边侧滑 window
内部字段：
{
edge:60, // 右边侧滑打开后，漏出的半透明区域宽度，默认值为60。此时右边侧滑window的宽度为屏幕宽度减去edge
name:'', // window名字（字符串类型）
url:'', // 页面地址，可以为本地文件路径，支持相对路径和绝对路径，以及widget://、fs://等协议路径，也可以为远程地址
pageParam:{}, //（可选项）页面参数，页面中可以通过api.pageParam获取，JSON对象
bgColor:'', //（可选项）背景色，支持图片和颜色，格式为#fff、#ffffff、rgba(r,g,b,a)等，图片路径支持fs://、widget://等YonBuilder移动开发平台自定义文件路径协议，同时支持相对路径
bounces:false, //（可选项）是否弹动，默认值：若在 config.xml 里面配置了pageBounce，则默认值为配置的值，否则为false
scrollToTop:false //（可选项）当点击状态栏，页面是否滚动到顶部。若当前屏幕上不止一个页面的scrollToTop属性为true，则所有的都不会起作用。默认值：true。只iOS有效
scrollEnabled:true //（可选项）页面内容超出后是否可以滚动，默认为true，只支持iOS
vScrollBarEnabled:true, //（可选项）是否显示垂直滚动条，默认true
hScrollBarEnabled:true, //（可选项）是否显示水平滚动条，默认true
scaleEnabled:true, //（可选项）页面是否可以缩放，布尔型，默认值：false
allowEdit:false, //（可选项）是否允许长按页面时弹出选择菜单
softInputMode:'auto' //（可选项）当键盘弹出时，输入框被盖住时，当前页面的调整方式，只iOS有效
//取值范围：
//resize //若键盘盖住输入框，页面会自动上移
//pan //若键盘盖住输入框，页面不会自动上移
//auto //默认值，由系统决定如何处理，iOS平台该字段等同于resize
softInputBarEnabled:false, //（可选项）是否显示键盘上方的工具条，布尔型，默认值：true，只iOS有效
defaultRefreshHeader:'' //（可选项）设置使用默认下拉刷新类型，取值范围：pull、swipe
customRefreshHeader:'' //（可选项）设置使用自定义下拉刷新插件的名称，设置后可以使用api.setCustomRefreshHeaderInfo方法来使用自定义下拉刷新组件
}
slidToOpenPane：
类型：布尔
默认值：true
描述：（可选项）是否支持在页面边缘处滑动打开drawerPane
slidToClosePane：
类型：布尔
默认值：true
描述：（可选项）在打开的drawerPane页面，是否支持滑动关闭drawerPane
tapToClosePane：
类型：布尔
默认值：true
描述：（可选项）在打开的drawerPane页面，是否支持点击遮罩部分关闭drawerPane
示例代码
api.openDrawerLayout({
name: 'main',
url: './main.html',
animation: {
type: 'none'
},
leftPane: {
name: 'leftPane',
url: 'leftPane.html'
}
});

## openDrawerPane
<!-- anchor: opendrawerpane -->

打开抽屉式侧滑Pane
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
openDrawerPane({params})
参数
type：
类型：字符串
默认值：无
描述：侧滑类型，left 或 right
示例代码
api.openDrawerPane({
type: 'left'
});

## closeDrawerPane
<!-- anchor: closedrawerpane -->

关闭抽屉式侧滑Pane
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
closeDrawerPane()
示例代码
api.closeDrawerPane();

## loadData
<!-- anchor: loaddata -->

在指定 window 或者 frame 中加载HTML数据，对于 frameGroup 里面的 frame 也有效。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.9及更高版本
可提供的1.2.9及更高版本
loadData({params})
参数
name：
类型：字符串
默认值：无
描述：（可选项）window 名称，若要跨 window ，该字段必须指定，首页的名称为 root
frameName：
类型：字符串
默认值：无
描述：（可选项）frame名称
url：
类型：字符串
默认值：无
描述：（可选项）做为baseUrl，data中的html引用的资源文件根路径以该url为基础，可以为本地文件路径，支持相对路径和绝对路径，以及 widget://、fs://等协议路径。
data：
类型：字符串
默认值：无
描述：页面加载的数据内容，可以为html片段或者整张html文件的数据
示例代码
//在当前window中加载HTML数据
var data = 'hello world';
api.loadData({
data: data
});
//在当前window中找到名为frmName的frame，并在该frame中加载HTML数据
var data = 'hello world';
api.loadData({
frameName: 'frmName',
data: data
});
//在名为winName的window中加载HTML数据
var data = 'hello world';
api.loadData({
name: 'winName',
data: data
});
//在名为winName的window中找到名为frmName的frame，并在该frame中加载HTML数据
var data = 'hello world';
api.loadData({
name: 'winName',
frameName: 'frmName',
data: data
});
补充说明
无

## execScript
<!-- anchor: execscript -->

在指定 window 或者 frame 中执行脚本，对于 frameGroup 里面的 frame 也有效，若 name 和 frameName 都未指定，则在当前 window 中执行脚本，具体执行逻辑见补充说明。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
execScript({params})
参数
name：
类型：字符串
默认值：无
描述：（可选项）window 名称，若要跨 window 执行脚本，该字段必须指定，首页的名称为 root
frameName：
类型：字符串
默认值：无
描述：（可选项）frame名称
script：
类型：字符串
默认值：无
描述：js代码
示例代码
//在当前window中执行jsfun脚本
var jsfun = 'funcGoto();';
api.execScript({
script: jsfun
});
//在当前window中找到名为frmName的frame，并在该frame中执行jsfun脚本
var jsfun = 'funcGoto();';
api.execScript({
frameName: 'frmName',
script: jsfun
});
//在名为winName的window中执行jsfun脚本
var jsfun = 'funcGoto();';
api.execScript({
name: 'winName',
script: jsfun
});
//在名为winName的window中找到名为frmName的frame，并在该frame中执行jsfun脚本
var jsfun = 'funcGoto();';
api.execScript({
name: 'winName',
frameName: 'frmName',
script: jsfun
});
补充说明
统一处理逻辑为：exec->window->frame
name 参数：
当 name 不传值，或者传空字符串的情况下，execScript 对象为调用 execScript 的window（该 window 可能位于屏幕或者后台），在该 window 中继续 frameName 的逻辑；
当 name 传值且非空字符串，但并未找到名为 name 的 window，则直接返回不处理（不论 frameName 是否有值）。若找到了对应的 window，则在该 window 中继续 frameName 的逻辑；
frameName 参数：
当 frameName 不传值，或者传空字符串的情况下，execScript 对象为调用 execScript 的 window（该 window 可能位于屏幕或者后台），在该 window 中执行 script；
当 frameName 传值且非空字符串，但并未找到名为 frameName 的 frame，则直接返回不处理。若找到了该 frame，则在该 frame 中执行 script。

## setBlurEffect
<!-- anchor: setblureffect -->

对当前页面或应用设置模糊效果
该方法只支持iOS 8及以上系统
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.61及更高版本
setBlurEffect({params})
参数
style：
类型：字符串
默认值：无
描述：模糊效果风格样式，传none时表示移除模糊效果
取值范围
none //移除模糊效果
extra_light //模糊区域比底层视图的颜色更淡
light //模糊区域与底层视图的色调近似
dark //模糊区域比底层视图的颜色更深
regular //适应界面风格的常规模糊样式，只支持iOS 10及以上系统
prominent //适应界面风格，使内容更加突出，只支持iOS 10及以上系统
global：
类型：布尔
默认值：false
描述：（可选项）false时表示对当前页面添加模糊效果，true时表示对整个应用窗口添加模糊效果
alpha：
类型：数字
默认值：1
描述：（可选项）模糊区域透明度，介于0和1之间
borderRadius：
类型：数字
默认值：0
描述：（可选项）模糊区域圆角半径
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，设置模糊渐变效果，只支持iOS 9及以上系统
内部字段：
{
delay: //动画延迟执行时间，单位毫秒，默认值0，数字类型
duration: //动画执行时间，单位毫秒，默认值0，数字类型
curve: //动画曲线类型，默认值ease_in_out，字符串类型
}
curve 取值范围：
ease_in_out //开始和结束时慢
ease_in //开始时慢
ease_out //结束时慢
linear //整个动画过程速率一样
rect：
类型：JSON 对象
默认值：页面区域
描述：（可选项）模糊区域
内部字段：
{
x:, //左上角x坐标，数字类型
y:, //左上角y坐标，数字类型
w:, //宽度，数字类型
h:, //高度，数字类型
}
示例代码
// 设置应用模糊效果：
api.addEventListener({
name: 'pause'
}, function(){
api.setBlurEffect({
style: 'light',
global: true
});
});
api.addEventListener({
name: 'resume'
}, function(){
api.setBlurEffect({
style: 'none',
global: true
});
});

## removeLaunchView
<!-- anchor: removelaunchview -->

移除启动图。若 config.xml 里面配置 autoLaunch 为 false，则启动图不会自动消失，直到调用此方法移除。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
removeLaunchView({params})
参数
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时不使用动画
内部字段：
{
type:"fade", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
示例代码
api.removeLaunchView({
animation: {
type: 'fade',
duration: 500
}
});

## showLaunchView
<!-- anchor: showlaunchview -->

重新显示闪屏广告，若没有闪屏广告则不显示。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.37及更高版本
可提供的1.2.37及更高版本
showLaunchView()
示例代码
api.showLaunchView();

## parseTapmode
<!-- anchor: parsetapmode -->

解析元素 tapmode 属性，优化点击事件处理
默认页面加载完成后，引擎会对 dom 里面的元素进行 tapmode 属性解析，若是之后用代码创建的 dom 元素，则需要调用该方法后 tapmode 属性才会生效
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
parseTapmode()
示例代码
api.parseTapmode();

## chooseCity
<!-- anchor: choosecity -->

选择省份、城市信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
province
string
否
默认选择省份（严格按照国家命名传入）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
province
string
选择的省信息
city
string
选择的市信息
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
11
用户取消操作
400
参数不合法
示例代码
api.chooseCity({
province: '河北省',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## commonReplyComponent
<!-- anchor: commonreplycomponent -->

通用的评论组件，支持文字，图片，语音，视频，附件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
replyName
string
否
被回复对象的名字
memberArray
object array
否
限定人员范围
qzId
string
当前空间 id
否
空间 id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
memberArray 结构
属性
类型
说明
member_id
number
人员编码
name
string
人员姓名
avatar
string
头像 url
object.success 回调函数
参数
Object res
属性
类型
说明
content
string
评论的文本内容
files
object
评论的多媒体内容
files 结构
属性
类型
说明
img
object array
评论图片的 id、名字、类型、地址、大小
audio
object array
评论音频的 id、名字、类型、地址、大小、时长
video
object array
评论视频的 id、名字、类型、地址、大小
file
object array
评论附件的 id、名字、类型、地址、大小
示例代码
api.commonReplyComponent({
replyName: '张三',
qzId: '5417',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openTabLayout
<!-- anchor: opentablayout -->

打开tabLayout布局
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
部分支持
部分支持
本方法继承了openWin方法的所有参数，同时在此基础上增加了navigationBar、tabBar等参数，来设置和使用原生的顶部导航栏和底部标签栏，可以通过closeWin方法来关闭页面。为帮助您更好的了解和使用tabLayout，可以参考论坛的 示例说明 。
如果在首页需要使用tabLayout，可以将相关参数配置在JSON文件中，再在config.xml中将content的值设置成该JSON文件的路径，例如：
// 创建一个app.json文件，放置在widget目录下
{
"name": "root",
"tabBar": {
"frames": [{
"title": "页面一",
"name": "page1",
"url": "widget://html/page1.html"
}, {
"title": "页面二",
"name": "page2",
"url": "widget://html/page2.html"
}, {
"title": "页面三",
"name": "page3",
"url": "widget://html/page3.html"
}],
"list": [{
"text": "页面一",
"iconPath": "widget://image/tab_1.png",
"selectedIconPath": "widget://image/tab_1_hov.png"
}, {
"text": "页面二",
"iconPath": "widget://image/tab_2.png",
"selectedIconPath": "widget://image/tab_2_hov.png"
}, {
"text": "页面三",
"iconPath": "widget://image/tab_3.png",
"selectedIconPath": "widget://image/tab_3_hov.png"
}]
}
}
// config.xml中设置content字段的值为JSON文件的路径：
<content src="app.json" />
openTabLayout({params})
参数
title：
类型：字符串
默认值：无
描述：（可选项）显示在顶部navigationBar上面的标题
hideNavigationBar：
类型：布尔
默认值：false
描述：（可选项）是否隐藏顶部navigationBar导航栏，只在传了navigationBar参数时有效
hideTabBar：
类型：布尔
默认值：false
描述：（可选项）是否隐藏底部tabBar标签栏，只在传了tabBar参数时有效
navigationBar：
类型：JSON对象
默认值：无
描述：（可选项）顶部navigationBar导航栏配置信息
内部字段：
{
height: //（可选项）导航栏高度。默认值45。数字类型
background: //（可选项）导航栏背景。支持颜色值和图片，默认值#fff，字符串类型
shadow: //（可选项）导航栏底部阴影线颜色。默认值#ddd，字符串类型
color: //（可选项）导航栏标题文字颜色。默认值#000，字符串类型
fontSize: //（可选项）导航栏标题字体大小。默认值17，数字类型
fontWeight: //（可选项）导航栏标题字体粗细。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）导航栏标题字体。只支持iOS，字符串类型
hideBackButton: //（可选项）是否隐藏默认返回按钮。如果传了leftButtons，hideBackButton参数失效。返回按钮由箭头图标和前一个页面的标题组成，若前一个页面未设置标题，则按钮文字为“返回”。可以通过监听navbackbtn或keyback事件来处理返回按钮的点击事件。布尔类型
leftButtons: //（可选项）导航栏左边按钮组。左边按钮会替换掉默认的返回按钮，按钮按照数组顺序从左至右显示，按钮建议最多2个，可以通过监听navitembtn事件来处理按钮点击事件，JSON对象数组类型
[{
text: //（可选项）按钮标题文字，可以和icon同时存在，字符串类型
color: //（可选项）按钮标题文字颜色，默认值#000，字符串类型
fontSize: //（可选项）按钮标题字体大小。默认值17，数字类型
fontWeight: //（可选项）按钮标题字体粗细，默认值normal。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）按钮标题字体。只支持iOS，字符串类型
iconPath: //（可选项）按钮 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
scale: //（可选项）图片的缩放倍数，默认为 4，数字类型。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30*25，则图片实际尺寸需要为 90*75。
}],
rightButtons: //（可选项）导航栏右边按钮组。按钮按照数组顺序从右至左显示，按钮建议最多2个，可以通过监听navitembtn事件来处理按钮点击事件，JSON对象数组类型
[{
text: //（可选项）按钮标题文字，可以和icon同时存在，字符串类型
color: //（可选项）按钮标题文字颜色，默认值#000，字符串类型
fontSize: //（可选项）按钮标题字体大小。默认值17，数字类型
fontWeight: //（可选项）按钮标题字体粗细，默认值normal。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）按钮标题字体。只支持iOS，字符串类型
iconPath: //（可选项）按钮 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
scale: //（可选项）图片的缩放倍数，默认为 4，数字类型。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30*25，则图片实际尺寸需要为 90*75。
}]
}
tabBar：
类型：JSON对象
默认值：无
描述：（可选项）底部tabBar标签栏配置信息，可以通过监听tabitembtn事件来处理标签栏每项的点击事件
内部字段：
{
height: //（可选项）标签栏高度。默认值54。数字类型
background: //（可选项）标签栏背景。支持颜色值和图片，默认值#fff，字符串类型
shadow: //（可选项）标签栏顶部阴影线颜色。默认值#ddd，字符串类型
color: //（可选项）标签栏各项的文字颜色。默认值#000，字符串类型
selectedColor: //（可选项）标签栏各项选中状态的文字颜色。默认值#000，字符串类型
fontSize: //（可选项）标签栏各项文字字体大小。默认值10，数字类型
fontWeight: //（可选项）标签栏各项文字字体粗细，默认值normal。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）标签栏各项文字字体。只支持iOS，字符串类型
textOffset: //（可选项）标签栏各项文字距离底部的距离。默认值2，数字类型
animated: //（可选项）选中标签栏每项时，切换对应的页面是否带有动画效果，默认值false。布尔类型
scrollEnabled: //（可选项）标签栏每项对应的页面间是否能够左右滚动切换，默认值true。布尔类型
index: //（可选项）默认选中项的索引。默认值0。数字类型
preload: //（可选项）预加载的页面个数。默认值0。数字类型
list: // 标签栏各项配置信息，JSON对象数组类型
[{
text: //（可选项）标题文字，可以和icon同时存在，字符串类型
iconPath: //（可选项）默认状态下 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
selectedIconPath: //（可选项）选中状态下 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
scale: //（可选项）图片的缩放倍数，默认为 4，数字类型。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30*25，则图片实际尺寸需要为 90*75。
}],
frames: // 标签栏各项对应的页面的信息，JSON对象数组类型
[{
title: //（可选项）标签栏切换时对应顶部导航栏的标题文字，字符串类型
... // 同openFrameGroup方法中frames参数里面的参数
}]
}
示例代码
// 打开只有navigationBar的页面：
api.openTabLayout({
name: 'help',
url: 'widget://html/help.html',
title: '帮助',
hideNavigationBar: false,
navigationBar: {
background: '#5082c2',
color: '#fff',
leftButtons: [{
iconPath: 'widget://image/back.png'
}]
}
});
// 打开只有tabBar的页面：
api.openTabLayout({
name: 'tabLayout',
url: 'widget://html/tabLayout.html',
hideTabBar: false,
tabBar: {
selectedColor: '#45C01A',
list: [{
text: '页面一',
iconPath: 'widget://image/tab_1.png',
selectedIconPath: 'widget://image/tab_1_hov.png'
}, {
text: '页面二',
iconPath: 'widget://image/tab_2.png',
selectedIconPath: 'widget://image/tab_2_hov.png'
}, {
text: '页面三',
iconPath: 'widget://image/tab_3.png',
selectedIconPath: 'widget://image/tab_3_hov.png'
}],
frames: [{
name: 'page1',
url: 'widget://html/page1.html'
}, {
name: 'page2',
url: 'widget://html/page2.html'
}, {
name: 'page3',
url: 'widget://html/page3.html'
}]
}
});

## setTabLayoutAttr
<!-- anchor: settablayoutattr -->

设置tabLayout属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
部分支持
部分支持
setTabLayoutAttr({params})
参数
title：
类型：字符串
默认值：无
描述：（可选项）显示在顶部navigationBar上面的标题
hideNavigationBar：
类型：布尔
默认值：无
描述：（可选项）是否隐藏顶部navigationBar导航栏
hideTabBar：
类型：布尔
默认值：无
描述：（可选项）是否隐藏底部tabBar标签栏
animated：
类型：布尔
默认值：true
描述：（可选项）显示隐藏navigationBar、tabBar时是否有动画效果。
示例代码
api.setTabLayoutAttr({
title: '首页'
});

## setNavBarAttr
<!-- anchor: setnavbarattr -->

设置导航栏属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.3.2及更高版本
可提供的1.3.2及更高版本
部分支持
部分支持
setNavBarAttr({params})
参数
background：
类型：字符串
默认值：无
描述：（可选项）导航栏背景。支持颜色值和图片
shadow：
类型：字符串
默认值：无
描述：（可选项）导航栏底部阴影线颜色
color：
类型：字符串
默认值：无
描述：（可选项）导航栏标题文字颜色
fontSize：
类型：数字
默认值：无
描述：（可选项）导航栏标题字体大小
fontWeight：
类型：字符串
默认值：无
描述：（可选项）导航栏标题文字粗细
fontFamily：
类型：字符串
默认值：无
描述：（可选项）导航栏标题文字字体。只支持iOS。
hideBackButton：
类型：布尔
默认值：无
描述：（可选项）是否隐藏默认返回按钮。可以通过监听 navbackbtn 或 keyback 事件来处理返回按钮的点击事件。
leftButtons：
类型：JSON对象数组
默认值：无
描述：（可选项）导航栏左边按钮组，左边按钮会替换掉默认的返回按钮，按钮按照数组顺序从左至右显示，按钮建议最多2个，可以通过监听 navitembtn 事件来处理按钮点击事件。
内部字段：
[{
text: //（可选项）按钮标题文字，可以和icon同时存在，字符串类型
color: //（可选项）按钮标题文字颜色，默认值#000，字符串类型
fontSize: //（可选项）按钮标题字体大小。默认值17，数字类型
fontWeight: //（可选项）按钮标题字体粗细，默认值normal。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）按钮标题字体。只支持iOS，字符串类型
iconPath: //（可选项）按钮 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
scale: //（可选项）图片的缩放倍数，默认为 4，数字类型。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30*25，则图片实际尺寸需要为 90*75。
}]
rightButtons：
类型：JSON对象数组
默认值：无
描述：（可选项）导航栏右边按钮组。按钮按照数组顺序从右至左显示，按钮建议最多2个，可以通过监听navitembtn事件来处理按钮点击事件。
内部字段：
[{
text: //（可选项）按钮标题文字，可以和icon同时存在，字符串类型
color: //（可选项）按钮标题文字颜色，默认值#000，字符串类型
fontSize: //（可选项）按钮标题字体大小。默认值17，数字类型
fontWeight: //（可选项）按钮标题字体粗细，默认值normal。字符串类型。Android及iOS8.2以下系统只支持normal、bold，iOS8.2及以上系统支持normal、bold、bolder、lighter、100~900。
fontFamily: //（可选项）按钮标题字体。只支持iOS，字符串类型
iconPath: //（可选项）按钮 icon 图标路径，可以和 text 同时存在，图片显示大小由图片尺寸和 scale 参数决定，字符串类型
scale: //（可选项）图片的缩放倍数，默认为 4，数字类型。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30*25，则图片实际尺寸需要为 90*75。
}]
示例代码
api.setNavBarAttr({
rightButtons: [{
text: '完成'
}]
});

## getNavBarAttr
<!-- anchor: getnavbarattr -->

获取导航栏属性。该方法为同步方法。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的3.0.31及更高版本
可提供的3.0.31及更高版本
getNavBarAttr()
return
类型：JSON对象
内部字段
{
hidden: //导航栏是否隐藏，布尔类型。
height: //导航栏高度（不包括为状态栏留出的部分），数字类型。
}
示例代码
var res = api.getNavBarAttr();
api.alert({
msg:JSON.stringify(res)
});

## setTabBarAttr
<!-- anchor: settabbarattr -->

设置tabBar属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
部分支持
部分支持
setTabBarAttr({params})
参数
index：
类型：数字
默认值：无
描述：（可选项）设置选中标签栏指定项
background：
类型：字符串
默认值：无
描述：（可选项）标签栏背景。支持颜色值和图片
shadow：
类型：字符串
默认值：无
描述：（可选项）标签栏顶部阴影线颜色
color：
类型：字符串
默认值：无
描述：（可选项）标签栏各项的文字颜色
selectedColor：
类型：字符串
默认值：无
描述：（可选项）标签栏各项选中状态下的文字颜色
fontSize：
类型：数字
默认值：无
描述：（可选项）标签栏各项文字字体大小
fontWeight：
类型：字符串
默认值：无
描述：（可选项）标签栏各项文字粗细
fontFamily：
类型：字符串
默认值：无
描述：（可选项）标签栏各项文字字体。只支持iOS。
textOffset：
类型：数字
默认值：无
描述：（可选项）标签栏各项文字距离底部的距离
示例代码
api.setTabBarAttr({
index: 1
});

## setTabBarItemAttr
<!-- anchor: settabbaritemattr -->

设置tabBar指定项的属性
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.99及更高版本
可提供的1.2.99及更高版本
setTabBarItemAttr({params})
参数
index：
类型：数字
默认值：无
描述：要设置的指定项的索引
text：
类型：字符串
默认值：无
描述：（可选项）该项的标题文字
iconPath：
类型：字符串
默认值：无
描述：（可选项）该项默认状态下 icon 图标路径
selectedIconPath：
类型：字符串
默认值：无
描述：（可选项）该项选中状态下 icon 图标路径
scale：
类型：数字
默认值：4
描述：（可选项）图片的缩放倍数。显示规则：当 scale 值为 3 时，若设备上面期望显示的图标尺寸为 30 25，则图片实际尺寸需要为 90 75。
badge：
类型：JSON对象
默认值：无
描述：（可选项）该项的角标信息
内部字段：
{
text： //角标内容。传0时表示隐藏角标，其余任意值表示显示角标，可以为空字符串，字符串类型
background： //角标的背景，支持颜色和图片，默认值#f00，字符串类型
color： //角标文字颜色，默认值#fff，字符串类型
fontSize： //角标文字字体大小，默认值12，数字类型
radius： //角标的半径，默认值10，高度固定，宽度根据内容自动增长，数字类型
x： //角标左边相对于所在项顶部中间的位置，默认值5，数字类型
y： //角标顶部相对于所在项顶部的位置，默认值5，数字类型
}
示例代码
api.setTabBarItemAttr({
index: 4,
badge: {
text: 1
}
});

## installApp
<!-- anchor: installapp -->

安装应用，如果是苹果的AppStore应用地址，将会跳转到AppStore应用详情页面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
installApp({params})
参数
appUri：
类型：字符串
默认值：无
描述：目标应用的资源文件标识。Android上为apk包的本地路径，如file://xxx.apk；iOS上为应用安装包对应的plist文件地址
示例代码
//Android用法：
api.installApp({
appUri: 'file://xxx.apk'
});
//iOS用法：
api.installApp({
appUri: 'https://list.kuaiapp.cn/list/KuaiAppZv7.1.plist' //安装包对应plist地址
});

## uninstallApp
<!-- anchor: uninstallapp -->

卸载应用，只支持Android
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.0及更高版本
uninstallApp({params})
参数
packageName：
类型：字符串
默认值：无
描述：要卸载的应用的包名
示例代码
api.uninstallApp({
packageName: 'com.yourcompany.yourapp'
});

## openApp
<!-- anchor: openapp -->

打开手机上其它应用，可以传递参数
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openApp({params}, callback(ret, err))
参数
appParam：
类型：JSON 对象
默认值：无
描述：（可选项）传给目标应用的参数。iOS 平台会将 appParam 里面的值拼接到 iosUrl 后面，比如 iosUrl 为 http://www.baidu.com ，appParam为{"keyword":"YonBuilder"}，则最后传递给第三方应用的url为 http://www.baidu.com?keyword=YonBuilder
iosUrl：
类型：字符串
默认值：无
描述：（可选项）目标应用的url（iOS平台使用），iOS下必传
androidPkg：
类型：字符串
默认值：无
描述：（可选项）目标应用的包名或 action（Android平台使用），Android下必传
mimeType：
类型：字符串
默认值：无
描述：（可选项）指定目标应用的响应数据类型，如："text/html"（Android平台使用）
uri：
类型：字符串
默认值：无
描述：（可选项）指定目标应用响应的uri（Android平台使用）
callback(ret, err)
ret：
类型：JSON 对象
描述：目标应用关闭后的返回值，只支持Android
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
//iOS中的使用方法如下：
api.openApp({
iosUrl: 'weixin://', //打开微信，其中weixin为微信的URL Scheme
appParam: {
appParam: 'app参数'
}
});
api.openApp({
iosUrl: 'app-settings:' //打开应用设置界面，支持iOS 8及以上系统
});
//Android中的使用方法如下：
api.openApp({
androidPkg: 'android.intent.action.VIEW',
mimeType: 'text/html',
uri: 'http://www.baidu.com'
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## appInstalled
<!-- anchor: appinstalled -->

判断设备上面是否已安装指定应用
注意：iOS9中系统对检测应用是否安装的方法做了限制，若想得到期望的结果，需要在config.xml里面配置可被检测的URL Scheme。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
appInstalled({params}, callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
appBundle：
类型：字符串
默认值：无
描述：Android 平台为应用包名，iOS 平台为应用定义的 URL Scheme。iOS 中的 URL Scheme 与包名不一样，一个应用只有一个包名，但是可以配置多个 URL Scheme
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
installed:true //是否安装，布尔类型
}
示例代码
//异步返回结果：
api.appInstalled({
appBundle: 'xxx'
}, function(ret, err) {
if (ret.installed) {
//应用已安装
} else {
//应用未安装
}
});
//同步返回结果：
var installed = api.appInstalled({
sync: true,
appBundle: 'xxx'
});
if (installed) {
//应用已安装
} else {
//应用未安装
}

## rebootApp
<!-- anchor: rebootapp -->

重启应用，云修复完成后可以调用此方法来重启应用使云修复生效。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
rebootApp()
示例代码
api.rebootApp();

## openWidget
<!-- anchor: openwidget -->

打开 Widget，若此 widget 已经被打开，则会把其调整到最前面显示
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openWidget({params}, callback(ret, err))
参数
id：
类型：字符串
默认值：无
描述：（可选项）widget的id
path：
类型：字符串
默认值：无
描述：（可选项）widget的根目录，该目录下面放置有config.xml等文件。通过传入此字段，可以打开放置在任意位置的widget。注意若传了id字段，此字段将被忽略
wgtParam：
类型：JSON 对象
默认值：无
描述：（可选项）widget 参数，在新打开的 widget 里面的页面中通过 api.wgtParam 获取
longPressToExit：
类型：布尔
默认值：true
描述：（可选项）在新打开的 widget 里面的页面中是否支持长按退出，只支持iOS。
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时使用默认动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
（Android系统flip，ripple，curl，un_curl，suck，cube 类型不支持）
callback(ret, err)
ret：
类型：JSON 对象
描述：新 widget 关闭时候的返回值
示例代码
api.openWidget({
id: 'A00000001',
animation: {
type: 'flip',
subType: 'from_bottom',
duration: 500
}
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## closeWidget
<!-- anchor: closewidget -->

关闭指定widget，也可以关闭应用
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
closeWidget({params})
参数
id：
类型：字符串
默认值：无
描述：（可选项）widget 的 ID
retData：
类型：JSON 对象
默认值：无
描述：（可选项）返回给上个 widget 的返回值
silent：
类型：布尔型
默认值：false
描述：（可选项）是否静默退出应用，只在主 widget 中有效。当为 false 时，引擎会弹出对话框询问是否退出应用
animation：
类型：JSON 对象
默认值：无
描述：（可选项）动画参数，不传时使用默认动画
内部字段：
{
type:"none", //动画类型（详见动画类型常量）
subType:"from_right", //动画子类型（详见动画子类型常量）
duration:300 //动画过渡时间，默认300毫秒
}
type 取值范围：
none //无动画效果
push //新视图将旧视图推开
movein //新视图移到旧视图上面
fade //交叉淡化过渡（不支持过渡方向）
flip //翻转效果
reveal //将旧视图移开,显示下面的新视图
ripple //滴水效果（不支持过渡方向）
curl //向上翻一页
un_curl //向下翻一页
suck //收缩效果（不支持过渡方向）
cube //立方体翻滚效果
subType 取值范围：
from_right //从右边开始动画
from_left //从左边开始动画
from_top //从顶部开始动画
from_bottom //从底部开始动画
示例代码
api.closeWidget({
id: 'A00000001',
retData: {
name: 'closeWidget'
},
animation: {
type: 'flip',
subType: 'from_bottom',
duration: 500
}
});

## ajax
<!-- anchor: ajax -->

跨域异步请求，支持标准HTTP协议，支持HTTPS单向/双向认证请求，支持文件上传，支持缓存。
HTTPS需要向国际受信任的CA证书颁发机构购买CA证书，否则将可能请求失败，可以在config中配置不校验CA证书是否受信任。
云编译开启全局加密的情况下，请务必使用api.ajax，避免使用JQ等框架的ajax，否则将引起请求失败。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
ajax({params}, callback(ret, err))
参数
url：
类型：字符串
默认值：无
描述：请求地址
encode：
类型：布尔
默认值：true
描述：（可选项）是否对url进行编码。默认或传true时，Android将始终对url编码，而iOS只有在url不合法（如存在中文字符）的时候才进行编码。如果url中有特殊字符需要编码的，建议先在js层进行编码，然后此参数传false。
tag：
类型：字符串
默认值：无
描述：（可选项）该字段用于传给cancelAjax方法来取消请求，如果传入该字段，请保证各个ajax的tag字段唯一
method：
类型：字符串
默认值：get
描述：（可选项）异步请求方法类型
取值范围：
get
post
put
delete
head
options
trace
patch
cache：
类型：布尔
默认值：false
描述：（可选项）是否缓存，若缓存，下次没网络时请求则会使用缓存，仅在get请求有效
timeout：
类型：数字
默认值：30
描述：（可选项）超时时间，单位秒
dataType：
类型：字符串
默认值：json
描述：（可选项）返回数据类型。若该字段传json，接收到服务器返回的数据后会尝试将其转换成JSON对象，如果无法转成JSON对象，将返回数据类型错误
取值范围：
json //返回数据为 JSON 对象
text //返回数据为字符串类型
charset：
类型：字符串
默认值：utf-8
描述：（可选项）当响应头里面没有返回字符集编码时，使用此编码来解析数据
headers：
类型：JSON 对象
默认值：无
描述：（可选项）设置请求头数据
report：
类型：布尔
默认值：false
描述：（可选项）是否实时返回上传文件进度
returnAll：
类型：布尔
默认值：false
描述：（可选项）是否需要返回所有 response 信息（包括响应头、消息体、状态码），为 true 时，返回的头信息获取方法(ret.headers)，消息体信息获取方法(ret.body)，状态码获取方法(ret.statusCode)
data：
类型：JSON 对象
默认值：无
描述：（可选项）POST 数据，method 为 get 时不传。以下字段除了 values 和 files 可以同时使用，其它参数都不能同时使用。
内部字段：
{
stream："", //以二进制流的方式提交文件。stream 为文件路径（字符串类型），支持绝对路径，以及 fs://、cache://、box:// 等文件路径协议。可直接使用其他端API返回的结果，如 api.getPicture 回调的 ret.data 等
body："", //以纯文本的方式提交数据，body 支持字符串及 JSON 对象（若要校验数据完整性，需将 JSON 对象转换成字符串再传入）。提交 JSON 对象时，需设置 application/json 类型的 Content-Type 头
values：{}, //以表单方式提交参数（JSON 对象）, 如 {"field1": "value1", "field1": "value2"} (直接传 JSON 对像.)
files：{} //以表单方式提交文件，支持多文件上传（JSON 对象）,如 {"file": "path"}，也支持同一字段对应多文件：{"file":["path1","path2"]}。文件路径，支持绝对路径，以及 fs://、cache://、box:// 等文件路径协议。可直接使用其他端 API 返回的结果，如 api.getPicture 回调的 ret.data 等.
}
certificate：
类型：JSON 对象
默认值：无
描述：（可选项）用于https请求开启双向认证的情况下，客户端配置p12安全证书设置。
内部字段：
{
path:'', //p12证书路径，支持fs://、widget://、cache://等文件路径协议，字符串类型
password:'' //证书密码，字符串类型
}
safeMode：
类型：字符串
默认值：none
描述：（可选项）设置请求安全模式。设置后，若检测到数据有安全风险时将返回“不安全的数据”错误
取值范围：
none //不做数据安全检查
both //对请求和响应的数据做安全检查
request //对请求数据做安全检查
response //对响应的数据做安全检查
proxy：
类型：JSON 对象
默认值：无
描述：（可选项）设置代理请求服务器。
内部字段：
{
host: //服务器地址，字符串类型
port: //服务器端口，数字类型
}
callback(ret, err)
ret：
类型：JSON对象或字符串
描述：通常情况下直接为服务器返回的数据，在一些情况下则会有所不同，依赖于传入的dataType、returnAll参数，以及上传文件时是否返回上传进度。
// returnAll参数传true时，内部字段为：
{
statusCode: //状态码，数字类型
headers: {}, //响应头，JSON对象
body: '' //消息体，即服务器返回的数据。若dataType为json，那么body为JSON对象，否则为字符串
}
// 上传文件时，若report字段传true返回上传进度时，原服务器返回数据会被放在body字段里面，内部字段为：
{
progress: 100, //上传进度，0.00-100.00
status: '', //上传状态，数字类型。（0：上传中、1：上传完成、2：上传失败）
body: '' //上传完成时，服务器返回的数据。若dataType为json，那么body为JSON对象，否则为字符串
}
err：
类型：JSON 对象
内部字段：
{
statusCode: 500, //网络请求状态码，数字类型
code:0, //错误码，数字类型。（0：连接错误、1：超时、2：授权错误、3：数据类型错误、4：不安全的数据）
msg:'' //错误描述，字符串类型
body: //服务器返回的原始数据
}
示例代码
// 表单方式提交数据或文件
api.ajax({
url: 'http://192.168.1.101:3101/upLoad',
method: 'post',
data: {
values: {
name: 'haha'
},
files: {
file: 'fs://a.gif'
}
}
}, function(ret, err) {
if (ret) {
api.alert({ msg: JSON.stringify(ret) });
} else {
api.alert({ msg: JSON.stringify(err) });
}
});
// 提交JSON数据
api.ajax({
url: 'http://192.168.1.101:3101/upLoad',
method: 'post',
headers: {
'Content-Type': 'application/json;charset=utf-8'
},
data: {
body: {
name: 'haha'
}
}
}, function(ret, err) {
if (ret) {
api.alert({ msg: JSON.stringify(ret) });
} else {
api.alert({ msg: JSON.stringify(err) });
}
});

## cancelAjax
<!-- anchor: cancelajax -->

取消异步请求
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
cancelAjax({params})
参数
tag：
类型：字符串
默认值：无
描述：请求标识
示例代码
api.cancelAjax({
tag: 'publish'
});

## download
<!-- anchor: download -->

下载文件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
download({params}, callback(ret, err))
参数
url：
类型：字符串
默认值：无
描述：下载地址
encode：
类型：布尔
默认值：true
描述：（可选项）是否对url进行编码。默认或传true时，Android将始终对url编码，而iOS只有在url不合法（如存在中文字符）的时候才进行编码。如果url中有特殊字符需要编码的，建议先在js层进行编码，然后此参数传false。
savePath：
类型：字符串
默认值：无
描述：（可选项）存储路径，不传时使用自动创建的路径
report：
类型：布尔类型
默认值：false
描述：（可选项）下载过程是否上报
cache：
类型：布尔类型
默认值：true
描述：（可选项）是否使用本地缓存
allowResume：
类型：布尔类型
默认值：false
描述：（可选项）是否允许断点续传
method：
类型：字符串
默认值：get
描述：（可选项）请求方法类型
取值范围：
get
post
headers：
类型：JSON 对象
默认值：无
描述：（可选项）设置请求头数据
data：
类型：JSON 对象
默认值：无
描述：（可选项）POST 数据，method 为 get 时不传。values 和 body 不能同时使用。
内部字段：
{
body："", //以纯文本的方式提交数据，body 支持字符串及 JSON 对象（若要校验数据完整性，需将 JSON 对象转换成字符串再传入）。提交 JSON 对象时，需设置 application/json 类型的 Content-Type 头
values：{}, //以表单方式提交参数（JSON 对象）, 如 {"field1": "value1", "field1": "value2"} (直接传 JSON 对像.)
}
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
fileSize:0, //文件大小，数字类型
percent:0, //下载进度（0-100），数字类型
state:0, //下载状态，数字类型。（0：下载中、1：下载完成、2：下载失败）
savePath:'' //存储路径（字符串类型）
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.download({
url: url,
savePath: 'fs://test.rar',
report: true,
cache: true,
allowResume: true
}, function(ret, err) {
if (ret.state == 1) {
//下载成功
} else {
}
});
补充说明
通过返回的 state 来判断文件是否下载完成，不要通过 percent 来判断

## cancelDownload
<!-- anchor: canceldownload -->

取消文件下载
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
cancelDownload({params})
参数
url：
类型：字符串
默认值：无
描述：下载地址
示例代码
api.cancelDownload({
url: url
});
补充说明
取消文件下载

## imageCache
<!-- anchor: imagecache -->

图片缓存
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
imageCache({params}, callback(ret, err))
参数
url：
类型：字符串
默认值：无
描述：图片远程地址
encode：
类型：布尔
默认值：true
描述：（可选项）是否对url进行编码。默认或传true时，Android将始终对url编码，而iOS只有在url不合法（如存在中文字符）的时候才进行编码。如果url中有特殊字符需要编码的，建议先在js层进行编码，然后此参数传false。
policy：
类型：字符串
默认值：default
描述：（可选项）缓存策略
取值范围：
default //默认为 cache_else_network
cache_else_network //若服务器上没有更新，则使用缓存
no_cache //不使用缓存，始终从服务器获取
cache_only //当缓存存在时，只从缓存中读取
thumbnail：
类型：布尔类型
默认值：true
描述：（可选项）使用缩略图，底层将根据当前系统及设备性能，返回最优的缩略图，有利于提高应用运行及渲染效率
tag：
类型：字符串
默认值：无
描述：（可选项）标识信息，将在回调中返回
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true, //是否成功，布尔类型
url:'' //图片本地存储路径，若下载失败，则返回传入的url，字符串类型
tag:'' //标识信息，字符串类型
}
示例代码
api.imageCache({
url: 'http://a.hiphotos.baidu.com/image/w%3D400/sign=2abe1c77d4ca7bcb7d7bc62f8e086b3f/64380cd7912397ddf9f4bdb05a82b2b7d1a287f0.jpg'
}, function(ret, err) {
var url = ret.url;
});

## applyCertificates
<!-- anchor: applycertificates -->

设置全局HTTPS双向认证，客户端P12证书，证书将作用于ajax网络请求，以及openWin、openFrame等加载web页面。此配置与ajax的certificate互斥，即如果ajax配置了certificate，将优先使用ajax出入的certificate。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.79及更高版本
可提供的1.2.79及更高版本
applyCertificates({params})
参数
certificates：
类型：JSON对象数组
默认值：无
描述：证书信息列表
内部字段：
[{
host:'', //目标域名，证书将应用于该域名及其子域名，字符串类型
path:'', //p12证书路径，支持绝对路径及widget://、fs://等路径，字符串类型
password:'' //p12证书密码，字符串类型。建议加密存储。
}]
示例代码
api.applyCertificates({
certificates: [{
host:'YonBuilder.com',
path:'widget://res/https.p12',
password:'123'
}]
});

## setPrefs
<!-- anchor: setprefs -->

设置偏好数据，数据会存储到本地文件系统。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setPrefs({params})
参数
key：
类型：字符串
默认值：无
描述：键
value：
类型：字符串
默认值：无
描述：值
示例代码
api.setPrefs({
key: 'userName',
value: 'api'
});

## getPrefs
<!-- anchor: getprefs -->

获取偏好设置值
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
getPrefs({params}, callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
key：
类型：字符串
默认值：无
描述：键
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
value:"" //值
}
示例代码
//异步返回结果：
api.getPrefs({
key: 'userName'
}, function(ret, err) {
var userName = ret.value;
});
//同步返回结果：
var userName = api.getPrefs({
sync: true,
key: 'userName'
});

## removePrefs
<!-- anchor: removeprefs -->

删除偏好设置值
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
removePrefs({params})
参数
key：
类型：字符串
默认值：无
描述：键
示例代码
api.removePrefs({
key: 'userName'
});

## setGlobalData
<!-- anchor: setglobaldata -->

设置全局数据，数据只存储在内存中，不会存储到本地文件系统。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.87及更高版本
可提供的1.2.87及更高版本
setGlobalData({params})
参数
key：
类型：字符串
默认值：无
描述：键
value：
类型：标准JSON支持的数据类型，如字符串、数字、JSON对象等
默认值：无
描述：值
示例代码
api.setGlobalData({
key: 'userName',
value: 'api'
});

## getGlobalData
<!-- anchor: getglobaldata -->

获取全局数据
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.2.87及更高版本
可提供的1.2.87及更高版本
getGlobalData({params})
参数
key：
类型：字符串
默认值：无
描述：键
示例代码
var userName = api.getGlobalData({
key: 'userName'
});

## clearCache
<!-- anchor: clearcache -->

清除缓存，包括cache://目录下的文件、拍照临时文件、网页缓存文件等，清除时可能需要消耗一定时间。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
clearCache({params}, callback(ret, err))
参数
timeThreshold：
类型：数字
默认值：0
描述：（可选项）清除多少天前的缓存
callback(ret, err)
描述：清除完成后的回调
示例代码
api.clearCache(function() {
api.toast({
msg: '清除完成'
});
});

## getCacheSize
<!-- anchor: getcachesize -->

获取缓存占用空间大小，缓存包括cache://目录下的文件、拍照临时文件以及网页缓存文件等，计算可能需要花费一些时间
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
getCacheSize({params}, callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
size: //缓存大小，单位为Byte，数字类型。（-1：无存储设备、-2：正在准备USB存储设备、-3：无法访问存储设备）
}
示例代码
//异步返回结果：
api.getCacheSize(function(ret) {
var size = ret.size;
});
//同步返回结果：
var size = api.getCacheSize({
sync: true
});

## getTotalSpace
<!-- anchor: gettotalspace -->

获取总存储空间大小
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.7及更高版本
可提供的1.2.7及更高版本
getTotalSpace({params},callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
size: //总存储空间大小，单位为Byte，数字类型。（-1：无存储设备、-2：正在准备USB存储设备、-3：无法访问存储设备）
}
示例代码
//异步返回结果：
api.getTotalSpace(function(ret, err) {
var size = ret.size;
});
//同步返回结果：
var size = api.getTotalSpace({
sync: true
});

## getFreeDiskSpace
<!-- anchor: getfreediskspace -->

获取剩余存储空间大小
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
getFreeDiskSpace({params},callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
size: //剩余存储空间大小，单位为Byte，数字类型。（-1：无存储设备、-2：正在准备USB存储设备、-3：无法访问存储设备）
}
示例代码
//异步返回结果：
api.getFreeDiskSpace(function(ret, err) {
var size = ret.size;
});
//同步返回结果：
var size = api.getFreeDiskSpace({
sync: true
});

## loadSecureValue
<!-- anchor: loadsecurevalue -->

从加密的key.xml文件中读取指定数据，key.xml文件放置于网页包里面的res目录，配置方式：
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
<?xml version="1.0" encoding="UTF-8"?>
<security>
<item name="appKey" value="1111111"/>
</security>
loadSecureValue({params}, callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
key：
类型：字符串
默认值：无
描述：键
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
value:"" //值
}
示例代码
//异步返回结果：
api.loadSecureValue({
key: 'appKey'
}, function(ret, err) {
var appKey = ret.value;
});
//同步返回结果：
var appKey = api.loadSecureValue({
sync: true,
key: 'appKey'
});

## clearStorage
<!-- anchor: clearstorage -->

清理本地数据缓存。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
domain
string
否
缓存数据的域
App、友空间
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.clearStorage({
success: function(res) {
console.log(res);
}
});

## executeDBOperate
<!-- anchor: executedboperate -->

执行数据库操作、建表、增删改查，SQL语句业务方操作。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
executeType
string
是
执行SQL类型(0:建表；1:删表；2:新增数据；3:删除数据；4:更新数据；5:查询数据 6:修改表（友空间6.2.5及以上版本）)
executeSql
string
是
执行SQL语句(业务方控制该sql安全性，创建表格要求表名字前缀为NCC_)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
data
string
1.建表、修改表、删表、增删改：返回为成功失败，data无数据，成功；data有错误码，失败 2.查询，返回数据数组
success返回示例
{
"data": ""
}
示例代码
api.executeDBOperate({
'executeType':'5',
'executeSql':'select * form NCC_TABLE_INFO',
success: function(res) {
console.log(res);
}
});

## getStorage
<!-- anchor: getstorage -->

从本地缓存中异步获取指定 key 的内容。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
key
string
是
缓存数据的 key
domain
string
否
缓存数据的域
App、友空间
encrypt
boolean
false
否
是否开启加密存储。只有异步的 getStorage 接口支持开启加密存储。开启后，将会对 data 使用 AES128 解密，接口回调耗时将会增加。若开启加密存储，setStorage 和 getStorage 需要同时声明 encrypt 的值为 true
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
data
any
key 对应的内容
示例代码
api.getStorage({
key:'currentCity',
success: function(res) {
console.log(res);
}
});

## removeStorage
<!-- anchor: removestorage -->

从本地缓存中移除指定 key。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
key
string
是
缓存数据的 key
domain
string
否
缓存数据的域
App、友空间
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.removeStorage({
key: 'currentCity',
success: function(res) {
console.log(res);
}
});

## setStorage
<!-- anchor: setstorage -->

将数据存储在本地缓存中指定的 key 和 domain 中，会覆盖掉原来该 key 和 domain 对应的数据。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
key
string
是
缓存数据的key
data
any
是
需要存储的内容。只支持基本数据类型、及能够通过 JSON.stringify 序列化的对象。
domain
string
否
缓存数据的域
App、友空间
encrypt
boolean
false
否
是否开启加密存储。只有异步的 setStorage 接口支持开启加密存储。开启后，将会对 data 使用 AES128 加密，接口回调耗时将会增加。若开启加密存储，setStorage 和 getStorage 需要同时声明 encrypt 的值为 true。此外，由于加密后的数据会比原始数据膨胀1.4倍，因此开启 encrypt 的情况下，单个 key 允许存储的最大数据长度为 0.7MB，所有数据存储上限为 7.1MB
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.setStorage({
data: '北京',
key: 'currentCity',
success: function(res) {
console.log(res);
}
});

## addEventListener
<!-- anchor: addeventlistener -->

监听事件，支持系统事件和自定义事件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
addEventListener({params}, callback(ret, err))
参数
name：
类型：字符串
默认值：无
描述：自定义事件或系统事件名称（详见 事件 ）
extra：
类型：JSON 对象
默认值：无
描述：（可选项）附加字段。一些特定事件可能需要提供额外的参数。
内部字段：
{
threshold: //当事件为scrolltobottom时，设置距离底部多少距离时触发事件，默认值为0，数字类型
timeout: //当事件为appidle时，设置经过多长时间不操作屏幕时触发，单位秒，数字类型
}
callback(ret, err)
ret：
类型：JSON 对象
描述：事件发生时传递的参数，可能为空
示例代码
//如监听网络连接事件
api.addEventListener({
name: 'online'
}, function(ret, err) {
api.alert({
msg:'已连接网络'
});
});
补充说明
监听事件

## removeEventListener
<!-- anchor: removeeventlistener -->

移除事件监听
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
removeEventListener({params})
参数
name：
类型：字符串
默认值：无
描述：自定义事件或系统事件名称（详见 事件 ）
示例代码
api.removeEventListener({
name: 'online'
});
补充说明
停止监听事件

## sendEvent
<!-- anchor: sendevent -->

将任意一个自定义事件广播出去，该事件可在任意页面通过 addEventListener 监听收到。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
sendEvent({params})
参数
name
类型：字符串
默认值：无
描述：任意自定义事件的名称，比如：apprunning、appover等
extra
类型：字符串或 JSON 对象
默认值：无
描述：（可选项）附带的参数。在监听页面的回调里面通过 ret.value 获取。
示例代码
api.sendEvent({
name: 'myEvent',
extra: {
key1: 'value1',
key2: 'value2'
}
});
//html页面a：
api.addEventListener({
name: 'myEvent'
}, function(ret, err) {
api.alert({
msg:JSON.stringify(ret.value)
});
});
//html页面b：
api.addEventListener({
name: 'myEvent'
}, function(ret, err) {
api.alert({
msg:JSON.stringify(ret.value)
});
});
//a、b页面都将收到 myEvent 事件
可用性

## accessNative
<!-- anchor: accessnative -->

使用 SuperWebView 时，js 向原生发送消息。此方法只在使用 SuperWebView 时有效。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
accessNative({params}, callback(ret, err))
参数
name
类型：字符串
默认值：无
描述：消息名称。
extra
类型：JSON 对象
默认值：无
描述：（可选项）附带的参数。
callback(ret, err)
ret：
类型：JSON 对象
err：
类型：JSON 对象
示例代码
api.accessNative({
name: 'showMenu',
extra: {
key: 'value'
}
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## notification
<!-- anchor: notification -->

向用户发出震动、声音提示、灯光闪烁、手机状态栏通知等提示行为，支持闹钟功能。如果是状态栏通知，当用户点击该通知，页面可以通过监听 noticeclicked 事件获取该通知相关内容。
注：当应用在前台弹出通知提示时，iOS平台的通知将在显示几秒后消失，不会在通知栏保留。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
notification({params}, callback(ret, err))
参数
vibrate：
类型：数组
默认值：[100, 500, 100, 500]
描述：（可选项）伴随节奏的震动，时间数组，单位：毫秒。iOS平台震动时间为固定值；Android平台节奏为【等待-震动-等待-震动..】，例如[100, 500, 100, 500]表现效果为：等待100毫秒-震动500毫秒-等待100毫秒-震动500毫秒
sound：
类型：字符串
默认值：default
描述：（可选项）提示音，默认为系统设置的提示音。Android支持传入widget协议音频文件，例如：widget://res/horse.mp3；当实现闹钟功能时，iOS只支持widget://路径协议
light：
类型：布尔型
默认值：false
描述：（可选项）设备提示灯是否闪烁
notify：
类型：JSON 对象
默认值：无
描述：（可选项）弹出通知到状态栏。弹出时是否震动或响铃，可通过设置vibrate，sound等字段配合实现。
内部字段：
{
title:'' //标题，Android中默认值为应用名称，支持Android和iOS 8.2以上系统
content:'' //内容，默认值为'有新消息'
extra:'' //附加信息，页面可以监听noticeclicked事件得到点击的通知的附加信息
updateCurrent: false //是否覆盖更新已有的通知，取值范围true|false。只Android有效
}
alarm：
类型：JSON 对象
默认值：无
描述：（可选项）设置闹铃。与notify配合使用，即如果设置了闹铃，那么对应的notify将在设定的闹铃时间触发
内部字段：
{
hour: //小时，数字类型，取值范围（0-23），默认值为当前系统时
minutes: //分钟，数字类型，取值范围（0-59），默认值为当前系统分
daysOfWeek: //通知循环时间，以周为单位，数组类型，取值范围[1,2,3,4,5,6,7]，表示周日、周一、周二、周三、周四、周五、周六。若不传则不循环，只在当天或隔天的指定时间通知一次
time: //闹铃目标时间，数字类型，1970年至今的毫秒数，只在设定的时间执行一次，若设置了time，那么hour、minutes、daysOfWeek将被忽略
openApp: //当闹铃触发时是否打开当前应用，如果打开，则不弹出状态栏通知，bool类型，默认值为false。仅支持Android平台。
}
callback(ret, err)
如果 notification 时传入了 notify或者alarm，那么将收到 callback，返回本次状态栏通知的 id或者闹铃 id，该 id 可用于取消状态栏通知或者闹铃。
ret：
类型：JSON 对象
内部字段：
{
id:1 //弹出到状态栏通知的id或者设置的闹铃id，可用于取消通知或者闹铃
}
示例代码
//仅震动
api.notification({
vibrate:[100, 500, 200, 500, 300, 500, 400, 500]
});
//仅提示音
api.notification({
sound:'default'
});
//提示音+震动
api.notification();
//弹出状态栏通知
api.notification({
notify: {
title: '通知标题',
content: '通知内容'
}
});
//闹铃
api.notification({
notify: {
content: '闹钟'
},
//每周一、二、三、四、五的7点30分闹铃
alarm: {
hour: 7,
minutes: 30,
daysOfWeek: [2, 3, 4, 5, 6]
}
}, function(ret, err) {
var id = ret.id;
});

## cancelNotification
<!-- anchor: cancelnotification -->

取消本应用弹出到状态栏的某个或所有通知，也可以清除设定的闹铃
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
cancelNotification({params})
参数
id：
类型：字符串
默认值：0。如果传入-1，则取消本应用弹到状态栏的所有通知，iOS只支持清除所有弹到状态栏的通知；传入-1并不清除闹铃。
描述：（可选项）调用 notification 方法时返回的 id
示例代码
api.cancelNotification({
id: 1
});

## startSensor
<!-- anchor: startsensor -->

开启传感器
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
startSensor({params}, callback(ret, err))
参数
type：
类型：字符串
默认值：无
描述：传感器类型
取值范围:
accelerometer //加速计
gyroscope //陀螺仪
magnetic_field //地磁传感器
proximity //近接传感器
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
x:0, //x轴分量值
y:0, //y轴分量值
z:0, //z轴分量值
proximity:true, //是否接近设备
status:true //操作成功状态值
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.startSensor({
type: 'accelerometer'
}, function(ret, err) {
if (ret && ret.status) {
} else {
}
});
补充说明
开启传感器

## stopSensor
<!-- anchor: stopsensor -->

停止传感器
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
stopSensor({params})
参数
type：
类型：字符串
默认值：无
描述：传感器类型（详见 传感器类型 常量）
示例代码
api.stopSensor({
type: 'accelerometer'
});
补充说明
停止传感器

## call
<!-- anchor: call -->

拨打电话或进行faceTime
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
call({params})
参数
type：
类型：字符串
默认值：tel_prompt
描述：（可选项）打电话类型
取值范围
tel //直接拨打电话。注：由于系统限制，iOS 10.2以上系统仍会弹出提示框
tel_prompt //拨打电话之前会弹出提示框
facetime //facetime通话，Android不支持
number：
类型：字符串
默认值：无
描述：电话号码
示例代码
api.call({
type: 'tel_prompt',
number: '10086'
});
补充说明
拨打电话，需要设备有电话功能

## sms
<!-- anchor: sms -->

调用系统短信界面发送短信，或者后台直接发送短信
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
sms({params}, callback(ret, err))
参数
numbers：
类型：字符串数组
默认值：无
描述：电话号码
备注：当调用系统短信界面进行短信发送时，Android仅支持传入一个号码，且发送是否成功的状态值依赖于系统短信界面的返回值
text：
类型：字符串
默认值：无
描述：文本内容
silent：
类型：布尔型
默认值：false
描述：（可选项）是否后台发送，只支持Android
备注：后台发送时，numbers 支持多个，可同时将一条信息发送给多个号码
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true //发送状态
}
示例代码
api.sms({
numbers: ['10086'],
text: '测试短信'
}, function(ret, err) {
if (ret && ret.status) {
//已发送
} else {
//发送失败
}
});
补充说明
发送短信，需要设备有短信功能

## mail
<!-- anchor: mail -->

发送邮件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
mail({params}, callback(ret, err))
参数
recipients：
类型：字符串数组
默认值：无
描述：收件人
subject：
类型：字符串
默认值：无
描述：邮件主题
body：
类型：字符串
默认值：无
描述：（可选项）邮件内容
attachments：
类型：字符串数组
默认值：无
描述：（可选项）附件地址。支持fs://协议，以及其他插件或者api返回的路径，附件必须是位于设备公共存储空间，系统邮件APP能访问到的存储。
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true //发送状态
}
示例代码
api.mail({
recipients: ['test@163.com'],
subject: '邮件测试',
body: '这是一封测试用的邮件',
attachments: ['fs://test.jpg']
}, function(ret, err) {
if (ret && ret.status) {
//已发送
} else {
}
});
补充说明
需要在手机上面已经配置好邮件账户

## openContacts
<!-- anchor: opencontacts -->

在应用内打开系统通讯录界面选择联系人
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openContacts(callback(ret, err))
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true, //操作成功状态值
name:"", //姓名
phone:"" //电话号码
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.openContacts(function(ret, err) {
if (ret && ret.status) {
var name = ret.name;
var phone = ret.phone;
} else {
}
});
补充说明
打开通讯录界面

## setFullScreen
<!-- anchor: setfullscreen -->

设置是否全屏
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setFullScreen({params})
参数
fullScreen：
类型：布尔
默认值：无
描述：是否全屏
optNav：
类型：布尔
默认值：false
描述：在全屏时是否同时隐藏/显示虚拟按键栏。仅对带有虚拟按键栏的Android设备有效。
animation：
类型：字符串
默认值：fade
描述：（可选项）状态栏显示隐藏的动画效果，只iOS有效
取值范围：
none //无动画
fade //淡入淡出
slide //上下滑入滑出
可用性：可提供的1.2.73及更高版本
示例代码
api.setFullScreen({
fullScreen: true
});
补充说明
设置是否全屏

## setStatusBarStyle
<!-- anchor: setstatusbarstyle -->

设置状态栏样式为白色（适用于深色背景）或黑色（适用于浅色背景），以及设置状态栏背景颜色
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setStatusBarStyle({params})
参数
style：
类型：字符串
默认值：light
描述：（可选项）状态栏样式，支持iOS，Android支持小米MIUI6.0及以上手机，魅族Flyme4.0及以上手机，其他Android6.0及以上手机。Android因设备厂商定制差异，频繁切换style不一定生效。
取值范围：
dark //状态栏字体为黑色，适用于浅色背景
light //状态栏字体为白色，适用于深色背景
color：
类型：字符串
默认值：#000
描述：（可选项）状态栏背景颜色，只 Android 5.0 及以上有效
navBarColor：
类型：字符串
默认值：跟随系统。可能值 #FFFF
描述：（可选项）虚拟按键栏背景颜色，只 Android 5.0 及以上且含虚拟按键栏的设备有效
animated：
类型：布尔
默认值：true
描述：（可选项）是否有动画效果，只iOS有效
可用性：可提供的1.2.73及更高版本
示例代码
api.setStatusBarStyle({
style: 'light'
});

## setScreenOrientation
<!-- anchor: setscreenorientation -->

设置屏幕旋转方向
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setScreenOrientation({params})
参数
orientation：
类型：字符串
默认值：无
描述：旋转屏幕到指定方向，或根据重力感应自动旋转；当前为横屏时，若想只在横屏间根据重力切换，则可以传 auto_landscape，竖屏间切换则传 auto_portrait。
取值范围：
portrait_up //竖屏时，屏幕在home键的上面
portrait_down //竖屏时，屏幕在home键的下面，部分手机如iPhone X系列不支持
landscape_left //横屏时，屏幕在home键的左边
landscape_right //横屏时，屏幕在home键的右边
auto //屏幕根据重力感应在横竖屏间自动切换
auto_portrait //屏幕根据重力感应在竖屏间自动切换
auto_landscape //屏幕根据重力感应在横屏间自动切换
示例代码
api.setScreenOrientation({
orientation: 'landscape_left'
});

## setKeepScreenOn
<!-- anchor: setkeepscreenon -->

设置是否禁止屏幕休眠
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setKeepScreenOn({params})
参数
keepOn
类型：布尔
默认值：无
描述：是否禁止屏幕休眠
示例代码
api.setKeepScreenOn({
keepOn: true
});

## toLauncher
<!-- anchor: tolauncher -->

回到系统桌面
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
toLauncher()
示例代码
api.toLauncher();
补充说明
该接口仅Android平台支持。

## setScreenSecure
<!-- anchor: setscreensecure -->

设置是否禁止截屏，只支持Android
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.1.0及更高版本
setScreenSecure({params})
参数
secure
类型：布尔
默认值：无
描述：是否禁止截屏
示例代码
api.setScreenSecure({
secure: true
});

## setAppIconBadge
<!-- anchor: setappiconbadge -->

设置应用图标右上角数字，支持所有 iOS 手机，以及部分 Android 手机，如小米和三星的某些型号，不支持的设备，表现结果为调用该接口无任何效果
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.1.0及更高版本
setAppIconBadge({params})
参数
badge
类型：数字
默认值：无
描述：显示在应用图标右上角的数字。为0时表示清除应用图标上显示的数字
示例代码
api.setAppIconBadge({
badge: 1
});

## getPhoneNumber
<!-- anchor: getphonenumber -->

获取本机电话号码，只支持 Android 部分手机
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.0及更高版本
getPhoneNumber({params},callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
value:"" //电话号码，字符串类型
}
示例代码
//异步返回结果：
api.getPhoneNumber(function(ret, err) {
var phoneNumber = ret.value;
});
//同步返回结果：
var phoneNumber = api.getPhoneNumber({
sync: true
});

## hasPermission
<!-- anchor: haspermission -->

hasPermission提供动态检测应用是否已取得某个或多个权限。
关于动态权限：Android系统自6.0开始，提供了同iOS系统使用体验一致的动态权限机制：对于敏感权限，如获取手机ID | IMEI，访问相册存储，定位，录音，拍照，录像等，需要在APP运行过程中动态向用户申请，用户同意后方可使用相应的功能。Android要求APP目标适配版本（targetSdkVersion）为23及以上（建议设置26及以上），为帮助您更好的使用该接口，论坛维护了一个 示例 ；如何动态申请权限见 requestPermission 。
权限列表中，类似contacts | contacts-r | contacts-w为权限组合，可以分别申请读写、只读取、只写入权限，如果只需要读取或者写入，则应该使用contacts-r或contacts-w，而不是contacts。
注：该方法为同步方法，方法调用后直接返回结果。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.76及更高版本
可提供的1.2.76及更高版本
hasPermission({params})
参数
list：
类型：字符串数组
默认值：无
描述：权限列表。
取值范围：
camera //相机/拍照/录像
contacts //联系人读取/写入
contacts-r //仅联系人读取。iOS中等同于contacts。
contacts-w //仅联系人写入。iOS中等同于contacts。
microphone //使用麦克风录制音频
photos //访问相册|本地存储空间。Android上等同于storage。
photos-w //仅写入相册|本地存储空间。Android上等同于storage-w。
location //定位
locationAlways //后台定位，只支持iOS
notification //状态栏通知
calendar //日历读取/写入。只支持Android
calendar-r //仅日历读取
calendar-w //仅日历写入
phone //直接拨打电话/获取手机号码|IMEI。只支持Android
phone-call //仅直接拨打电话
phone-r //仅获取手机号码|IMEI
phone-r-log //读取通话记录
phone-w-log //写入通话记录
sensor //传感器.只支持Android
sms //读取短信/后台发送短信。只支持Android
sms-s //仅后台发送短信
sms-r //仅读取短信
storage //读取/写入|相册|多媒体|本地存储空间。只支持Android
storage-r //仅读取|相册|多媒体|文件|本地存储空间
storage-w //仅写入|相册|多媒体|文件|本地存储空间
ble-scan //发现和配对附近的蓝牙设备。Android12及以上有效，低版本默认为true
ble-ad //向附近的蓝牙设备发布广告。Android12及以上有效，低版本默认为true
ble-connect //连接到配对的蓝牙设备。Android12及以上有效，低版本默认为true
image-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问图片资源
video-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问视频资源
audio-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问音频资源
return
类型：JSON对象数组
内部字段：
[{
name: //权限名，字符串类型。
granted: //是否允许，如果从未请求过该权限或者用户未做出过选择时将返回false，布尔类型。
undetermined: //是否从未请求过该权限或者用户未做出过选择，只支持iOS，注意：请求notification权限时无法获取该状态，布尔类型。
limited: //该字段仅photos权限有效，表示访问相册是否有限制，当受限时，应用只能获取到用户在相册选定的那部分资源，只支持iOS 14及以上系统，布尔类型。
reducedAccuracy: //该字段仅location、locationAlways有效，返回当前是否为模糊定位，只支持iOS 14及以上系统，布尔类型。在iOS 14以上系统中，用户可以选择只对应用授权模糊定位，如果应用对定位精度要求高，则可以在判断为模糊定位后请求locationFullAccuracy权限，系统将弹出开启精准定位弹框，用户可以再次进行选择。
}]
示例代码
var resultList = api.hasPermission({
list:['camera']
});
var granted = resultList[0].granted;
api.alert({
msg: granted?'有权限':'无权限'
});

## requestPermission
<!-- anchor: requestpermission -->

向系统请求某个或多个权限。为帮助您更好的使用该接口，论坛维护了一个 示例 。
对于iOS平台，第一次请求权限时会弹出权限选择框，如果用户选择了不允许，那么再次请求权限时将不会再弹出选择框（定位权限如果用户选择了下次询问，则会再次弹出），而是直接跳转到系统设置中该应用的设置界面。
对于Android平台，只要用户没有选择“不再提示”，那么再次请求权限时都将继续弹出权限选择框；如果用户选择了“不再提示”，那么再次请求权限时将不会再弹出选择框，而是直接跳转到系统设置的该应用权限设置界面。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.76及更高版本
可提供的1.2.76及更高版本
requestPermission({params}, callback(ret,err))
参数
list：
类型：字符串数组
默认值：无
描述：权限列表。
取值范围：
camera //相机/拍照/录像
contacts //联系人读取/写入
contacts-r //仅联系人读取。iOS中等同于contacts。
contacts-w //仅联系人写入。iOS中等同于contacts。
microphone //使用麦克风录制音频
photos //访问相册|本地存储空间。Android上等同于storage。
photos-w //仅写入相册|本地存储空间。Android上等同于storage-w。
location //定位
locationAlways //后台定位，只支持iOS
locationFullAccuracy //临时精确定位，请求时需传入purposeKey参数，申请的临时精确定位只在App生命周期内有效。注意：仅当location、locationAlways权限返回的reducedAccuracy字段为true时才请求临时精确定位，若用户继续选择关闭精确定位时回调方法不会被执行，所以此权限应和其它权限分开进行请求。只支持iOS 14及以上系统。
notification //状态栏通知
calendar //日历读取/写入。只支持Android
calendar-r //仅日历读取
calendar-w //仅日历写入
phone //直接拨打电话/获取手机号码|IMEI。只支持Android
phone-call //仅直接拨打电话
phone-r //仅获取手机号码|IMEI
phone-r-log //读取通话记录
phone-w-log //写入通话记录
sensor //传感器.只支持Android
sms //读取短信/后台发送短信。只支持Android
sms-s //仅后台发送短信
sms-r //仅读取短信
storage //读取/写入|相册|多媒体|本地存储空间。只支持Android
storage-r //仅读取|相册|多媒体|文件|本地存储空间
storage-w //仅写入|相册|多媒体|文件|本地存储空间
ble-scan //发现和配对附近的蓝牙设备。Android12及以上有效，低版本默认为true
ble-ad //向附近的蓝牙设备发布广告。Android12及以上有效，低版本默认为true
ble-connect //连接到配对的蓝牙设备。Android12及以上有效，低版本默认为true
image-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问图片资源
video-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问视频资源
audio-r //targetSdkVersion大于等于33时 Android13设备需要申请此权限才能访问音频资源
code：
类型：数字
默认值：无
描述：请求跟踪码，用于回调结果，只支持Android。
purposeKey：
类型：字符串
默认值：无
描述：请求locationFullAccuracy权限的意图字段，在云编译界面添加“精确定位（临时）”权限时输入purposeKey及对应的权限使用描述，系统通过purposeKey找到对应的权限使用描述，然后在开启精确定位的弹框中将描述语展示给用户。
callback
ret:
类型：JSON对象
内部字段：
{
list:[{
name: //权限名，字符串类型
granted: //是否允许，布尔类型
}],
never: //用户是否选择了“不再提示“，只支持Android，布尔类型
code: //请求跟踪码，只支持Android，数字类型。
}
示例代码
var permission = 'camera';
var resultList = api.hasPermission({
list: [permission]
});
if (resultList[0].granted) {
// 已授权，可以继续下一步操作
api.alert({
msg: '已授权'
});
} else {
api.confirm({
msg: '应用需要您的授权才能访问相机',
buttons: ['取消', '去设置']
}, function(ret) {
if (ret.buttonIndex == 2) {
api.requestPermission({
list: [permission],
}, function(res) {
if (res.list[0].granted) {
// 已授权，可以继续下一步操作
api.alert({
msg: '已授权'
});
}
});
}
});
}

## getInterfaceStyle
<!-- anchor: getinterfacestyle -->

获取当前设置的用户界面风格，只支持 iOS 13 及以上系统
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.3.29及更高版本
getInterfaceStyle()
return：
类型：字符串
描述：当前设置的用户界面风格，取值范围：light、dark
示例代码
var style = api.getInterfaceStyle();

## setInterfaceStyle
<!-- anchor: setinterfacestyle -->

设置用户界面风格，只支持 iOS 13 及以上系统。
通常情况下，应该在 config.xml 中配置全局的用户界面风格，只有当在应用内提供界面风格切换时使用此方法。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.3.29及更高版本
setInterfaceStyle({params})
参数
style：
类型：字符串
默认值：无
描述：（可选项）界面风格，取值范围：light、dark
target：
类型：字符串
默认值：widget
描述：（可选项）要修改的目标范围，默认只作用于当前 widget，当值为 app 时表示应用内全局设置，取值范围：app、widget
示例代码
api.setInterfaceStyle({
style: 'dark'
});

## bindSensor
<!-- anchor: bindsensor -->

恩普特搜索蓝牙设备。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
address
string
是
要绑定设备的 mac 地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.bindSensor({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## blueToothConnect
<!-- anchor: bluetoothconnect -->

连接蓝牙打印机。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
deviceIndentify
string
是
需要连接的设备标识
deviceName
string
是
需要连接的蓝牙设备名字
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.blueToothConnect({
deviceIndentify: 'abs-111030',
deviceName: 'bluetooth-1',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## blueToothConnectState
<!-- anchor: bluetoothconnectstate -->

获得当前蓝牙连接状态，如果当前有连接蓝牙打印机则返回连接的蓝牙打印机信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
connectName
string
连接成功的设备名称
deviceIndentify
string
连接成功的设备 id
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
405
设备蓝牙未开启
示例代码
api.blueToothConnectState({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## blueToothDisConnect
<!-- anchor: bluetoothdisconnect -->

断开当前连接的蓝牙打印机。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
-1
蓝牙断开失败，原因未知
400
参数不合法
405
设备蓝牙未开启
示例代码
api.blueToothDisConnect();

## blueToothPrint
<!-- anchor: bluetoothprint -->

打印当前连接的蓝牙打印机。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
printNum
number
是
打印的页数
content
object array
是
打印的内容列表
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
content 结构
属性
类型
必填
说明
type
string
是
打印的类型，支持 txt、qrc、img、customText
value
string
是
打印的内容，如果是 img，传 base64 格式字符串，如果是 customText 的话这个是 json 字符串
size
string
否
type 是 image 的时候设置图片大小，取值为：0 小图片、1 中图片、2 大图片，不传为默认大小
customText json 字符串结构
属性
类型
必填
说明
value
string
是
打印的文本
size
string
是
字体的大小，0 普通大小，1 原来大小的四倍（长宽各两倍）
align
string
是
对齐的方式， 0 左对齐，1 居中，2 右对齐
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
蓝牙打印失败，原因未知
示例代码
api.blueToothPrint({
printNum:'1',
content:[{type:"txt",value:"打印的内容"},{type:"txt",value:"打印的内容"}],
success: function(res) {
console.log(JSON.stringify(res));
}
});

## blueToothScan
<!-- anchor: bluetoothscan -->

获得当前蓝牙连接状态，如果当前有连接蓝牙打印机则返回连接的蓝牙打印机信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
callback
function
否
持续获取蓝牙扫描信息的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
peripheralArray
object array
扫描到的蓝牙信息列表
peripheralArray 结构
结构属性
类型
说明
deviceName
string
扫描到的蓝牙设备名称
deviceIndentify
string
扫描到的蓝牙设备标识
示例代码
api.blueToothScan({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## blueToothStopScan
<!-- anchor: bluetoothstopscan -->

停止扫描蓝牙打印机。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.blueToothStopScan();

## closeConnect
<!-- anchor: closeconnect -->

关闭映美打印设备连接，调用该方法会关闭与打印机的通信，未发送完的数据会丢失，应当在不需要连接的时候使用。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.closeConnect({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## collectRev
<!-- anchor: collectrev -->

恩普特转速采集。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
callback
function
是
采集到转速时回调的函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
ele
string
传感器电量
revValue
string
转速
示例代码
api.collectRev({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## collectTmp
<!-- anchor: collecttmp -->

恩普特温度采集。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
emissivity
string
是
发射率（0~1）
callback
function
是
采集到温度时回调的函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
ele
string
传感器电量
tmpValue
string
温度
示例代码
api.collectTmp({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## collectVib
<!-- anchor: collectvib -->

恩普特测振采集。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
collectionType
string
是
采集类型
savewave
boolean
否
是否采集波值
callback
function
是
采集到测振时回调的函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
collectionType 取值范围
值
说明
ACC
加速度
SPEED
速度
DIS
位移
object.callback 回调函数
参数
Object res
属性
类型
说明
ele
string
传感器电量
waveValue
string
波值
speedValue
string
速度
disValue
string
位移
accValue
string
加速度
示例代码
api.collectVib({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## connectBle
<!-- anchor: connectble -->

恩普特连接设备。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
address
string
是
需要连接的设备 mac 地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
sensorType
string
传感器类型
softCode
string
传感器版本号
snCode
string
传感器 sn
示例代码
api.connectBle({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## disconnectBle
<!-- anchor: disconnectble -->

恩普特断开连接。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.disconnectBle({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getBindedSensor
<!-- anchor: getbindedsensor -->

恩普特获取绑定设备的 macAddress。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
address
string
绑定的传感器的地址
示例代码
api.getBindedSensor({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getBlueToothState
<!-- anchor: getbluetoothstate -->

获取蓝牙打开状态。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
state
boolean
当前设备蓝牙是否打开（true 为打开）
示例代码
api.getBlueToothState({
success: function(res) {
console.log(res.state);
}
});

## getConnectStatus
<!-- anchor: getconnectstatus -->

恩普特获取连接状态。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
isConnect
boolean
是否连接
示例代码
api.getConnectStatus({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getConnectedDevice
<!-- anchor: getconnecteddevice -->

获取已连接的映美打印设备信息。sdk 未提供建立连接的接口，打印时可以先调用此方法判断是否已经建立连接，已经建立连接的话可以直接打印。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
status
boolean
是否有设备连接
deviceInfo
object
设备信息，status为 true 时返回
deviceInfo 说明
属性
类型
说明
transType
string
打印类型（BLE/CLASSIC/WIFI），打印时必须有该参数
address
string
wifi 时为 ip 地址，蓝牙时为 mac 地址
did
string
wifi 时为打印机编号，蓝牙时为蓝牙名
mdl
string
打印机型号
pstatus
number
打印机状态:(0 空闲 1 忙碌 2 异常)
示例代码
api.getConnectedDevice({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## isSupportedBLE
<!-- anchor: issupportedble -->

是否支持蓝牙 BLE。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
isSupportedBLE
boolean
是否支持 ble
示例代码
api.isSupportedBLE({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## printFile
<!-- anchor: printfile -->

打开系统的文件选择器，选择一个文件发送到映美设备打印，只支持图片、html 文件；pdf 需要转成图片后才能打印。打印图片大小不能超过 600K，图片格式为 jpg、png。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
deviceInfo
object
是
searchDevices 方法中返回的 deviceInfos 中的任意一个都可以选择
copies
number
1
否
打印份数
paperType
number
1
否
打印纸张类型，1：热敏 2：标签 3:带孔 （局域网 HTL 打印有效）
paperWidth
number
否
打印宽度， 单位毫米（局域网 HTL 打印有效）
paperHeight
number
否
打印高度， 单位毫米（局域网 HTL 打印有效）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
status
boolean
数据是否发送成功
示例代码
api.printFile({
deviceInfo:{},
path:'/storage/emulated/0/Android/data/com.yongyou.youpu.debug/files/ymprinter/25297851_161452446108_4.jpg',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## printHTML
<!-- anchor: printhtml -->

打印 html，和映美技术人员确认，CFP-820BW 只支持 wifi 链接打印；支持标准规范的 html 标签，样式只能支持到 IE11 内核，可以打印表格数据以及标准规范排版页面，html 页面的 body 宽度不大于打印机的纸张宽度值，body 宽度的像素最大值等于纸张宽度*打印机 dpi/25.4 打印机的 dpi 值。CFP-820BW 的 dpi 值为 180。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
deviceInfo
object
是
searchDevices 方法中返回的 deviceInfos 中的任意一个都可以选择
path
string
是
图片路径
copies
number
1
否
打印份数
paperType
number
1
否
打印纸张类型，1：热敏 2：标签 3:带孔 （局域网 HTL 打印有效）
paperWidth
number
否
打印宽度， 单位毫米（局域网 HTL 打印有效）
paperHeight
number
否
打印高度， 单位毫米（局域网 HTL 打印有效）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
status
boolean
数据是否发送成功
示例代码
api.printHTML({
deviceInfo:{},
path:'/storage/emulated/0/Android/data/com.yongyou.youpu.debug/files/ymprinter/25297851_161452446108_4.jpg',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## printPicture
<!-- anchor: printpicture -->

使用映美打印设备打印图片, 注意图片仅支持 png 和 jpg 格式的，大小有限制，不能超过 600K。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
deviceInfo
object
是
searchDevices 方法中返回的 deviceInfos 中的任意一个都可以选择
path
string
是
图片路径
copies
number
1
否
打印份数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
status
boolean
数据是否发送成功
示例代码
api.printPicture({
deviceInfo:{},
path:'/storage/emulated/0/Android/data/com.yongyou.youpu.debug/files/ymprinter/25297851_161452446108_4.jpg',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## registerConnectStatusListener
<!-- anchor: registerconnectstatuslistener -->

恩普特连接状态监听。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
callback
function
是
当前绑定的传感器连接状态变化时的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
address
string
传感器地址
status
number
连接状态，0：断开连接 1：连接状态
示例代码
api.registerConnectStatusListener({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## releaseBle
<!-- anchor: releaseble -->

恩普特释放资源。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.releaseBle({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## releaseYmPrinter
<!-- anchor: releaseymprinter -->

释放映美打印资源，调用该方法会关闭与打印机的通信，日志写入也会停止。可以在 APP 退出或页面关闭时调用。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.releaseYmPrinter({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## searchBleClient
<!-- anchor: searchbleclient -->

恩普特搜索蓝牙设备。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
searchTime
number
是
每次扫描的时长，单位毫秒
searchCount
number
是
扫描 BLE 设备的次数
callback
function
是
搜索到蓝牙设备时的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
name
string
传感器名称
address
string
传感器地址
rssi
number
传感器信号
scanRecord
string
传感器 scanRecord
示例代码
api.searchBleClient({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## searchDevices
<!-- anchor: searchdevices -->

搜索可用的映美打印设备，需要手机开启蓝牙和位置；使用局域网 wifi，需要先扫描打印机上的二维码，配置网络。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
string
all
否
搜索类型。打印效果 wifi > classic > ble，使用 ble 打印图片数据量较大时可能会出现数据丢包出现打印乱码的现象，搜索不到打印机 wifi 的时候需要扫描打印机上的二维码重新配网
time
number
10
否
搜索超时时间，默认10秒，超出时间后没有搜索到可用设备时需要重新搜索
callback
function
否
搜索的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
type 取值说明
值
说明
wifi
局域网wifi
classic
蓝牙经典版
ble
蓝牙低功耗版
all
包括三种全部
object.callback 回调函数
参数
Object res
属性
类型
说明
status
boolean
是否扫描到设备
eventType
string
startDevices 表示开始搜索；stopDevices 表示结束搜索；findDevices 表示发现设备，只要搜索到新的就会一直回调，直到搜索结束
deviceInfos
object array
eventType 为 findDevices 时返回搜索到的打印设备信息
示例代码
api.searchDevices({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## stopCollect
<!-- anchor: stopcollect -->

恩普特停止采集。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.stopCollect({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## stopSearch
<!-- anchor: stopsearch -->

停止搜索映美打印设备。只支持 Android。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.stopSearch({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getClipboardData
<!-- anchor: getclipboarddata -->

获取系统剪贴板的内容。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
data
string
剪贴板的内容
示例代码
api.getClipboardData({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## setClipboardData
<!-- anchor: setclipboarddata -->

设置系统剪贴板的内容。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
data
string
是
剪贴板的内容
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.setClipboardData({
data: 'data'
});

## createShortcut
<!-- anchor: createshortcut -->

android 端为轻应用创建桌面快捷方式。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
url
string
是
快捷方式的对应页面的 url
name
string
是
快捷方式名称
icon
string
是
快捷方式图标
title
string
否
快捷方式的对应页面的标题
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.createShortcut({
url: 'https://developer.yonyou.com',
name: '快捷名称',
icon: 'https://developer.yonyou.com/favicon.ico',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## jumpToSystemSetting
<!-- anchor: jumptosystemsetting -->

跳转到系统设置。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.jumpToSystemSetting({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getNetworkType
<!-- anchor: getnetworktype -->

获取网络类型。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
networkType
string
网络类型
signalStrength
number
信号强弱，单位 dbm
微信小程序
hasSystemProxy
boolean
设备是否使用了网络代理
微信小程序
networkType 说明
值
说明
wifi
wifi 网络
2g
2g 网络
3g
3g 网络
4g
4g 网络
5g
5g 网络
unknown
未知网络
none
无网络
示例代码
api.getNetworkType({
success: function(res) {
console.log(res.networkType);
}
});

## offNetworkStatusChange
<!-- anchor: offnetworkstatuschange -->

移除网络状态变化事件的监听函数。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
function listener
onNetworkStatusChange 传入的监听函数。不传此参数则移除所有监听函数。
示例代码
const listener = function(res) {console.log(res.networkType);};
api.onNetworkStatusChange(listener);
api.offNetworkStatusChange(listener); // 需传入与监听时同一个的函数对象

## onNetworkStatusChange
<!-- anchor: onnetworkstatuschange -->

监听网络状态变化事件
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
function listener
网络状态变化事件的监听函数
参数
Object res
属性
类型
说明
isConnected
boolean
当前是否有网络连接
networkType
string
网络类型
networkType 说明
值
说明
wifi
wifi 网络
2g
2g 网络
3g
3g 网络
4g
4g 网络
5g
5g 网络
unknown
未知网络
none
无网络
示例代码
api.onNetworkStatusChange(function(res) {
console.log(res.isConnected);
console.log(res.networkType);
});

## rfidConnect
<!-- anchor: rfidconnect -->

斑马 PDA 连接 RFID 设备，并监听标签数据。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
callback
function
是
RFID 连接成功后扫描到标签后的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
-1
连接 RFID 设备不能重复连接
400
参数不合法
示例代码
api.rfidConnect({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## rfidDisconnect
<!-- anchor: rfiddisconnect -->

斑马 PDA 断开连接 RFID 设备。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.rfidDisconnect({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## startPDAScan
<!-- anchor: startpdascan -->

开始监听PDA设备扫描。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
callback
function
否
PDA 设备扫描成功的回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
PDA 扫描监听不能重复开启
示例代码
api.startPDAScan({
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## stopPDAScan
<!-- anchor: stoppdascan -->

停止监听 PDA 设备扫描。只 Android 支持。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
-1
PDA 扫描监听未开启
400
参数不合法
示例代码
api.stopPDAScan({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## zebraPrintImage
<!-- anchor: zebraprintimage -->

斑马蓝牙打印图片。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
images
string
是
图片数据base64编码后的数组JSON字符串
serialNumber
string
是
打印设备mac地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
响应编码说明
Status Code
原因
12001
设备连接异常
12003
设备语言异常
12005
设备参数异常
示例代码
var images = ['DFLDFDJFLD','EOPORERIEIR'];
api.zebraPrintImage({
images: JSON.stringify(images),
serialNumber: 'xxxxxxxx',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## zebraPrinterList
<!-- anchor: zebraprinterlist -->

斑马蓝牙打印机扫描设备。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.zebraPrinterList({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## makePhoneCall
<!-- anchor: makephonecall -->

拨打电话。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
phoneNumber
string
是
需要拨打的电话号码
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.makePhoneCall({
phoneNumber: '123456' //仅为示例，并非真实的电话号码
});

## mdfChangeCustomScanMode
<!-- anchor: mdfchangecustomscanmode -->

悬浮扫描页面进行页面级扫描模式切换，可动态设置为单次扫描/连续扫描。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
是
切换当前页面扫描方式，0: 单次 1: 连续
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.mdfChangeCustomScanMode({
type: 0,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## mdfChangeFlashLightStatus
<!-- anchor: mdfchangeflashlightstatus -->

改变 mdf 悬浮扫描页面的闪光灯状态，可动态设置为开启/关闭。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
是
自定义扫描页面的闪光灯状态，0: 关闭 1: 开启
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.mdfChangeFlashLightStatus({
type: 0,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## mdfCustomScanQRCode
<!-- anchor: mdfcustomscanqrcode -->

调用扫一扫功能，对二维码或者条码进行扫描，可定制扫描框的位置和大小。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
hide
number
0
否
是否隐藏悬浮扫描框，0:显示 1:隐藏
type
number
1
否
扫描方式，0:单次 1:连续，需调用 callback 参数指定方法开启下次扫描
scanLeftRatio
number
0
否
扫描框左边与屏幕左边的间距占屏幕宽度的比例，范围[0, 1]
scanTopRatio
number
0
否
扫描框顶部与屏幕顶部的间距占屏幕高度的比例，范围[0, 1]
scanWidthRatio
number
1
否
扫描框宽度占屏幕宽度的比例，范围[0, 1]
scanHeightRatio
number
0.4
否
扫描框高度占屏幕高度的比例，范围[0, 1]，为 0 时设置扫描框为正方形，扫描框高度等于扫描框宽度
callback
function
是
扫码结果的回调函数，要使连续扫码生效，必须在本方法中调用返回的回调，才会发起下一次扫码
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.callback 回调函数
参数
Object res
属性
类型
说明
qrString
string
扫码结果
示例代码
api.mdfCustomScanQRCode({
scanLeftRatio: 0.1,
scanTopRatio: 0.1,
scanWidthRatio: 0.8,
scanHeightRatio: 0.4,
callback: function(res, callback) {
console.log(JSON.stringify(res));
//要使连续扫码生效，必须调用 callback 回调发起下一次扫码。
typeof callback === 'function' && callback();
}
});

## scanCode
<!-- anchor: scancode -->

调起扫码界面进行扫码。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
onlyFromCamera
boolean
false
否
是否只能从相机扫码，不允许从相册选择图片
微信小程序
scanType
string array
['barCode', 'qrCode']
否
扫码类型
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
scanType 取值范围
值
说明
barCode
一维码
qrCode
二维码
datamatrix
Data Matrix 码
pdf417
PDF417 条码
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
result
string
所扫码的内容
scanType
string
所扫码的类型
微信小程序
charSet
string
所扫码的字符集
微信小程序
path
string
当所扫的码为当前小程序二维码时，会返回此字段，内容为二维码携带的 path
微信小程序
rawData
string
原始数据，base64 编码
微信小程序
示例代码
api.scanCode({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## toggleCamera
<!-- anchor: togglecamera -->

自定义扫描页面开关摄像头。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
设置摄像头状态，0: 关闭 1: 开启
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.toggleCamera({
'type':0,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## offUserCaptureScreen
<!-- anchor: offusercapturescreen -->

取消监听用户主动截屏事件。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
示例代码
api.offUserCaptureScreen();

## onUserCaptureScreen
<!-- anchor: onusercapturescreen -->

监听用户主动截屏事件。用户使用系统截屏按键截屏时触发，只能注册一个监听
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
function listener
用户主动截屏事件的监听函数
示例代码
api.onUserCaptureScreen(function(res) {
console.log('用户截屏了');
});

## vibrateLong
<!-- anchor: vibratelong -->

使手机发生较长时间的震动（400 ms)。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.vibrateLong();

## vibrateShort
<!-- anchor: vibrateshort -->

使手机发生较短时间的震动（15 ms）。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
type
string
是
震动强度类型，有效值为：heavy、medium、light
App、微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.vibrateShort();

## alert
<!-- anchor: alert -->

弹出带一个按钮的对话框，更多按钮的对话框请使用confirm方法
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
alert({params}, callback(ret, err))
参数
title：
类型：字符串
默认值：无
描述：（可选项）标题
msg：
类型：字符串
默认值：无
描述：（可选项）内容
buttons：
类型：字符串数组
默认值：["确定"]
描述：（可选项）按钮
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
buttonIndex:1 //按钮点击序号，从1开始
}
示例代码
api.alert({
title: 'testtitle',
msg: 'testmsg',
}, function(ret, err) {
});
补充说明
对话框

## confirm
<!-- anchor: confirm -->

弹出带两个或三个按钮的confirm对话框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
confirm({params}, callback(ret, err))
参数
title：
类型：字符串
默认值：无
描述：（可选项）标题
msg：
类型：字符串
默认值：无
描述：（可选项）内容
buttons：
类型：字符串数组
默认值：["取消","确定"]
描述：（可选项）按钮标题，若小于两个按钮，会补齐两个按钮；若大于三个按钮，则使用前三个按钮
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
buttonIndex:1 //按钮点击序号，从1开始
}
示例代码
api.confirm({
title: 'testtitle',
msg: 'testmsg',
buttons: ['确定', '取消']
}, function(ret, err) {
var index = ret.buttonIndex;
});
补充说明
多个按钮的对话框

## prompt
<!-- anchor: prompt -->

弹出带两个或三个按钮和输入框的对话框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
prompt({params}, callback(ret, err))
参数
title：
类型：字符串
默认值：无
描述：（可选项）标题
msg：
类型：字符串
默认值：无
描述：（可选项）内容
text：
类型：字符串
默认值：无
描述：（可选项）输入框里面的默认内容
type：
类型：字符串
默认值：text
描述：（可选项）输入类型，不同输入类型弹出键盘类型不同，取值范围（text、password、number、email、url）
buttons：
类型：字符串数组
默认值：["取消","确定"]
描述：（可选项）按钮标题，若小于两个按钮，会补齐两个按钮；若大于三个按钮，则使用前三个按钮
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
buttonIndex:1, //按钮点击序号，从1开始
text:"" //输入文字
}
示例代码
api.prompt({
buttons: ['确定', '取消']
}, function(ret, err) {
var index = ret.buttonIndex;
var text = ret.text;
});
补充说明
带输入框的对话框

## actionSheet
<!-- anchor: actionsheet -->

底部弹出框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
actionSheet({params}, callback(ret, err))
参数
title：
类型：字符串
默认值：无
描述：（可选项）标题
cancelTitle：
类型：字符串
默认值：取消
描述：（可选项）取消按钮标题
destructiveTitle：
类型：字符串
默认值：无
描述：（可选项）红色警示按钮标题，一般用于做一些删除之类操作
buttons：
类型：字符串数组
默认值：无
描述：（可选项）其它按钮
style：
类型：JSON 对象
默认值：无
描述：（可选项）样式设置，不传时使用默认样式
内部字段：
{
layerColor:'', //遮蔽层颜色，仅支持rgba颜色，默认值：rgba(0, 0, 0, 0.4)，Android平台仅支持设置alpha即透明度生效
itemNormalColor:'', //选项按钮正常状态背景颜色，支持#000、#000000、rgb、rgba，默认值：#F1F1F1
itemPressColor:'', //选项按钮按下时背景颜色，支持#000、#000000、rgb、rgba，默认值：#E6E6E6
fontNormalColor:'', //选项按钮正常状态文字颜色，支持#000、#000000、rgb、rgba，默认值：#007AFF
fontPressColor:'', //选项按钮按下时文字颜色，支持#000、#000000、rgb、rgba，默认值：#0060F0
titleFontColor:'' //标题文字颜色，支持#000、#000000、rgb、rgba，默认值：#8F8F8F
}
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
buttonIndex:1 //按钮点击序号，从1开始
}
示例代码
api.actionSheet({
title: '底部弹出框测试',
cancelTitle: '这里是取消按钮',
destructiveTitle: '红色警告按钮',
buttons: ['1', '2', '3']
}, function(ret, err) {
var index = ret.buttonIndex;
});
补充说明
底部弹出框

## showProgress
<!-- anchor: showprogress -->

显示进度提示框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
showProgress({params})
参数
style：
类型：字符串
默认值：default
描述：（可选项）进度提示框风格
取值范围
default //默认
animationType：
类型：字符串
默认值：fade
描述：（可选项）进度提示框动画类型
取值范围
fade //渐隐渐现
zoom //缩放
title：
类型：字符串
默认值：加载中
描述：（可选项）标题
text：
类型：字符串
默认值：请稍候...
描述：（可选项）内容
modal：
类型：布尔
默认值：true
描述：（可选项）是否模态，模态时整个页面将不可交互
示例代码
api.showProgress({
title: '努力加载中...',
text: '先喝杯茶...',
modal: false
});
补充说明
显示进度提示框

## hideProgress
<!-- anchor: hideprogress -->

隐藏进度提示框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
hideProgress()
示例代码
api.hideProgress();
补充说明
隐藏进度提示框

## toast
<!-- anchor: toast -->

弹出一个定时自动关闭的提示框
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
toast({params})
参数
msg：
类型：字符串
默认值：无
描述：提示消息
duration：
类型：数字
默认值：2000
描述：（可选项）持续时长，单位：毫秒
location：
类型：字符串
默认值：bottom
描述：（可选项）弹出位置，顶部、中间或底部
取值范围:
top //顶部
middle //中间
bottom //底部
global：
类型：布尔
默认值：false
描述：（可选项）是否是全局的toast。若为false，toast将只在当前window范围可见；若为true，安卓手机上面弹出的位置将会固定在底部区域。
示例代码
api.toast({
msg: '网络错误',
duration: 2000,
location: 'bottom'
});

## openPicker
<!-- anchor: openpicker -->

打开时间选择器
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openPicker({params}, callback(ret, err))
参数
type：
类型：字符串
默认值：无
描述：拾取器类型
取值范围
date //日期
time //时间
date_time //日期和时间，Android不支持
date：
类型：字符串
默认值：当前时间
描述：（可选项）时间格式化字符串，格式yyyy-MM-dd HH:mm
minDate：
类型：字符串
默认值：无
描述：（可选项）能够选择的最小时间，格式yyyy-MM-dd HH:mm，只iOS有效
maxDate：
类型：字符串
默认值：无
描述：（可选项）能够选择的最大时间，格式yyyy-MM-dd HH:mm，只iOS有效
title：
类型：字符串
默认值：无
描述：（可选项）显示在拾取器上面的标题
arrowRect：
类型：JSON 对象
默认值：无
描述：（可选项）iPad中显示时，箭头指向的位置，只iPad有效
内部字段：
{
x:0, //左上角x坐标，数字类型
y:0, //左上角y坐标，数字类型
w:0, //宽度，数字类型
h:0, //高度，数字类型
}
arrowDirection：
类型：字符串
默认值：any
描述：（可选项）iPad中显示时，箭头指向的方向，只iPad有效
取值范围
left // 指向左边
right // 指向右边
up // 指向上边
down // 指向下边
any // 系统根据页面情况选择合适的方向
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
year:2000, //年
month:1, //月
day:1, //日
hour:12, //时
minute:00 //分
}
示例代码
api.openPicker({
type: 'date_time',
date: '2014-05-01 12:30',
title: '选择时间'
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});
补充说明
时间选择器

## setRefreshHeaderInfo
<!-- anchor: setrefreshheaderinfo -->

显示默认下拉刷新组件，使用默认下拉刷新组件时会自动重新设置页面的弹动属性。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
setRefreshHeaderInfo({params}, callback(ret, err))
参数
visible：
类型：布尔
默认值：true
描述：（可选项）是否可见
bgColor：
类型：字符串
默认值：当defaultRefreshHeader为pull时为rgba(187, 236, 153, 1.0)，为swipe时为#fff
描述：（可选项）背景颜色
pathColor：
类型：字符串
默认值：#0F9D58
描述：（可选项）进度条的颜色，defaultRefreshHeader为swipe时生效。
loadingImg：
类型：字符串
默认值：旋转箭头图片
描述：（可选项）上拉下拉时的图片地址，defaultRefreshHeader为pull时生效。
textColor：
类型：字符串
默认值：rgba(109, 128, 153, 1.0)
描述：（可选项）文本颜色，defaultRefreshHeader为pull时生效。
textDown：
类型：字符串
默认值：下拉可以刷新...
描述：（可选项）下拉文字描述，defaultRefreshHeader为pull时生效。
textUp：
类型：字符串
默认值：松开可以刷新...
描述：（可选项）松开时文字描述，defaultRefreshHeader为pull时生效。
textLoading：
类型：字符串
默认值：加载中...
描述：（可选项）加载状态文字描述，defaultRefreshHeader为pull时生效。
textTime：
类型：字符串
默认值：最后更新加日期时间
描述：（可选项）更新时间文字描述，defaultRefreshHeader为pull时生效。
showTime：
类型：布尔
默认值：true
描述：（可选项）是否显示更新时间，defaultRefreshHeader为pull时生效。
callback(ret, err)
ret：
描述：处于下拉刷新状态的回调
err：
描述：错误信息
示例代码
api.setRefreshHeaderInfo({
loadingImg: 'widget://image/refresh.png',
bgColor: '#ccc',
textColor: '#fff',
textDown: '下拉刷新...',
textUp: '松开刷新...'
}, function(ret, err) {
//在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
});
补充说明
下拉刷新

## setCustomRefreshHeaderInfo
<!-- anchor: setcustomrefreshheaderinfo -->

显示自定义下拉刷新组件。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.2.0及更高版本
可提供的1.2.0及更高版本
使用自定义下拉刷新组件之前，需要在config.xml里面配置要使用的自定义下拉刷新插件名称，如：
<preference name="customRefreshHeader" value="UIPullRefresh"/>
或者在使用openWin、openFrame等方法打开页面时传入customRefreshHeader参数来指定。
setCustomRefreshHeaderInfo({params}, callback(ret, err))
参数
由对应的自定义下拉刷新插件提供
callback(ret, err)
由对应的自定义下拉刷新插件提供
示例代码
api.setCustomRefreshHeaderInfo({
bgColor: '#C0C0C0',
images: {
pull: 'widget://image/refresh/pulling.png',
transform: [
'widget://image/refresh/transform0.png',
'widget://image/refresh/transform1.png',
'widget://image/refresh/transform2.png',
'widget://image/refresh/transform3.png',
'widget://image/refresh/transform4.png',
'widget://image/refresh/transform5.png',
'widget://image/refresh/transform6.png'
],
load: [
'widget://image/refresh/loading0.png',
'widget://image/refresh/loading1.png',
'widget://image/refresh/loading2.png',
'widget://image/refresh/loading3.png',
'widget://image/refresh/loading4.png',
]
}
}, function(ret, err) {
//在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
});

## refreshHeaderLoading
<!-- anchor: refreshheaderloading -->

设置下拉刷新组件为刷新中状态
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
refreshHeaderLoading()
示例代码
api.refreshHeaderLoading();

## refreshHeaderLoadDone
<!-- anchor: refreshheaderloaddone -->

通知下拉刷新数据加载完毕，组件会恢复到默认状态
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
refreshHeaderLoadDone()
示例代码
api.refreshHeaderLoadDone();
补充说明
通知顶部刷新数据加载完毕

## showFloatBox
<!-- anchor: showfloatbox -->

展示一个悬浮框，浮动在屏幕上。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
showFloatBox({params}, callback)
参数
preventDefault：
类型：布尔
默认值：false
描述：（可选项）是否阻止默认行为，若传true，可以在回调方法里面处理悬浮框点击操作。默认的行为：1、在主widget调用该方法无效 2、点击后会弹出退出应用提示
iconPath：
类型：字符串
默认值：应用图标
描述：（可选项）展示在悬浮框中的图片地址
duration：
类型：字符串
默认值：5000毫秒
描述：（可选项）自动消隐时长。在该时长内不发生触摸悬浮框行为，悬浮框自动消隐至半透状态
callback(ret, err)
ret：
描述：悬浮框点击后的回调
内部字段：
{
type:'click' //事件类型，取值范围：click
}
示例代码
api.showFloatBox({
iconPath: 'widget://image/icon.png',
duration: 3000
});
补充说明
对主widget无效

## setMenuItems
<!-- anchor: setmenuitems -->

设置选择文字弹出菜单。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
可提供的1.2.98及更高版本
setMenuItems({params}, callback)
参数
customItems：
类型：字符串数组
默认值：无
描述：自定义菜单项。自定义菜单项会添加到系统默认菜单项的后面。
systemItems：
类型：字符串数组
默认值：无
描述：（可选项）系统菜单项。如果不传该参数，则会显示系统菜单项，自定义菜单项会添加到系统菜单项后面；如果传空数组，则不显示系统菜单项；如果传了非空数组，则显示传入的系统菜单。注意：不同系统版本的系统默认菜单项可能会有所不同，会存在无法屏蔽某些系统菜单的情况。
取值范围：
copy // 复制
selectAll // 全选
_lookup // 查询
_addShortcut // 添加...
_share // 共享...
callback(ret, err)
ret：
描述：自定义菜单项点击后的回调
内部字段：
{
index: //点击的自定义菜单项索引，数字类型
text: //当前选择的文字，字符串类型
}
示例代码
api.setMenuItems({
customItems: ['菜单1', '菜单2']
systemItems: []
}, function(ret, err){
var index = ret.index;
});

## getPicture
<!-- anchor: getpicture -->

通过调用系统默认相机或者图库应用，获取图片以及视频媒体文件。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
部分支持
部分支持
getPicture({params}, callback(ret, err))
参数
sourceType：
类型：字符串
默认值：library
描述：（可选项）图片源类型，从相册、图片库或相机获取图片
取值范围
library //图片库
camera //相机
album //相册
encodingType：
类型：字符串
默认值：png
描述：（可选项）返回图片类型，jpg或png
取值范围
jpg //指定图片格式为jpg
png //指定图片格式为png
mediaValue：
类型：字符串
默认值：pic
描述：（可选项）媒体类型，图片或视频
取值范围
pic //图片
video //视频
all //图片和视频，Android不支持
destinationType：
类型：字符串
默认值：url
描述：（可选项）返回数据类型，指定返回图片地址或图片经过base64编码后的字符串
取值范围
base64 //指定返回数据为base64编码后内容
url //指定返回数据为选取的图片地址
direction：
类型：字符串
默认值：rear
描述：（可选项）选择前置或后置摄像头，取值范围（front、rear），只支持iOS
allowEdit：
类型：布尔
默认值：false
描述：（可选项）是否可以选择图片后进行编辑，支持iOS及部分安卓手机
preview：
类型：布尔
默认值：false
描述：（可选项）是否选择图片后进行预览，只支持iOS。
quality：
类型：数字
默认值：50
描述：（可选项）图片质量，只针对jpg格式图片（0-100整数）
videoQuality：
类型：字符串
默认值：medium
描述：（可选项）视频质量，调用相机录制视频时该参数生效。取值范围(low、medium、high)，质量越高，录制的视频文件占用存储空间越大。
targetWidth：
类型：数字
默认值：原图宽度
描述：（可选项）压缩后的图片宽度，图片会按比例适配此宽度
targetHeight：
类型：数字
默认值：原图高度
描述：（可选项）压缩后的图片高度，图片会按比例适配此高度
saveToPhotoAlbum：
类型：布尔
默认值：false
描述：（可选项）拍照或录制视频后是否保存到系统相册目录。注意此处仅是文件系统层面的操作，使用诸如“图库”App仍然有可能查看到。
groupName：
类型：字符串
默认值：无
描述：（可选项）保存图片到自定义分组相册目录，相册不存在则会进行创建。
可用性：可提供的1.2.74及更高版本
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
data:"", //图片路径
base64Data:"", //base64数据，destinationType为base64时返回
duration:0 //视频时长（数字类型）
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.getPicture({
sourceType: 'camera',
encodingType: 'jpg',
mediaValue: 'pic',
destinationType: 'url',
allowEdit: true,
quality: 50,
targetWidth: 100,
targetHeight: 100,
saveToPhotoAlbum: false
}, function(ret, err) {
if (ret) {
api.alert({
msg:JSON.stringify(ret)
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});
补充说明
获取图片

## saveMediaToAlbum
<!-- anchor: savemediatoalbum -->

保存图片和视频到系统相册
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
部分支持
saveMediaToAlbum({params}, callback(ret, err))
参数
path：
类型：字符串
默认值：无
描述：文件路径，支持网络链接地址、fs://、widget://等扩展文件路径协议，本地文件路径必须带有扩展名
groupName：
类型：字符串
默认值：无
描述：（可选项）保存图片到自定义分组相册目录，相册不存在则会进行创建。
可用性：可提供的1.2.74及更高版本
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true //是否保存成功
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.saveMediaToAlbum({
path: 'fs://1.png'
}, function(ret, err) {
if (ret && ret.status) {
api.alert({
msg:'保存成功'
});
} else {
api.alert({
msg:'保存失败'
});
}
});

## screenCapture
<!-- anchor: screencapture -->

屏幕截取，可截取整个屏幕、当前页面、avm 页面指定元素等。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的3.0.12及更高版本
可提供的3.0.12及更高版本
screenCapture({params}, callback(ret, err))
参数
region：
类型：字符串
默认值：当前页面区域
描述：要截取的屏幕区域范围，默认为当前页面区域。
取值范围：
screen // 整个屏幕，包含状态栏、虚拟按键栏区域
window // 整个 window，包含导航栏、底部标签栏区域
#elementId // avm 页面的指定元素区域，elementId 为元素的 id
destinationType：
类型：字符串
默认值：url
描述：数据返回类型。
取值范围：
url // 以文件路径返回
base64 // 以 base64 数据返回
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
savePath // destinationType 为 url 时截图保存路径
base64Data // destinationType 为 base64 时截图的 base64 数据
}
示例代码
// 截取当前页面
api.screenCapture(function(ret, err) {
console.log(ret.savePath);
});
// 截取 avm 页面中指定元素区域
api.screenCapture({
region: '#user'
}, function(ret, err) {
console.log(ret.savePath);
});

## startRecord
<!-- anchor: startrecord -->

录制音频
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
startRecord({params})
参数
path：
类型：字符串
默认值：无
描述：（可选项）文件路径，不传时自动创建路径
format：
类型：字符串
默认值：amr
描述：（可选项）音频格式
取值范围：
amr // amr 格式
wav // wav 格式
示例代码
api.startRecord({
path: 'fs://a.amr'
});

## stopRecord
<!-- anchor: stoprecord -->

停止录音
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
stopRecord(callback(ret, err))
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
path:'', //字符串，返回的音频地址
duration:0 //数字类型，音频的时长
}
示例代码
api.stopRecord(function(ret, err) {
if (ret) {
var path = ret.path;
var duration = ret.duration;
}
});

## startPlay
<!-- anchor: startplay -->

播放本地音频，支持 amr 格式。
当调用 pausePlay 方法暂停播放后，再次调用本方法时，若文件路径不变则继续播放，否则播放新的音频。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
startPlay({params}, callback(ret, err))
参数
path：
类型：字符串
默认值：无
描述：文件路径，支持fs://、widget://等文件路径协议
callback(ret, err)
ret
类型：JSON 对象
描述：播放完成的回调
err
类型：JSON 对象
描述：错误信息
示例代码
api.startPlay({
path: 'widget://res/1.mp3'
}, function(ret, err) {
if (ret) {
api.alert({
msg:'播放完成'
});
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});

## pausePlay
<!-- anchor: pauseplay -->

暂停播放音频
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的3.0.30及更高版本
可提供的3.0.30及更高版本
pausePlay()
示例代码
api.pausePlay();

## stopPlay
<!-- anchor: stopplay -->

停止播放音频
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
stopPlay()
示例代码
api.stopPlay();

## openVideo
<!-- anchor: openvideo -->

打开系统视频播放器
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
openVideo({params})
参数
url：
类型：字符串
默认值：无
描述：本地文件路径（支持fs://路径协议）或者网络资源地址
示例代码
api.openVideo({
url: 'fs://res/1.mp4'
});
补充说明
打开系统视频播放器

## recordAudio
<!-- anchor: recordaudio -->

提供录音界面以及功能，支持最长 60s 录音，返回经过 base64 编码处理后的音频数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
bytes
string
经过 base64 编码处理后的音频数据
示例代码
api.recordAudio({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## addImageWaterMark
<!-- anchor: addimagewatermark -->

给图片添加水印。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
image
string
是
图片路径
watermark
object
是
照片添加水印
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
watermark 说明
属性
类型
默认值
必填
说明
text
string
是
水印的文字内容
position
number
0
否
水印的位置，0-正下方；1-正上方；2-正左方；3-正右方；4-左上方；5-左下方；6-右上方；7-右下方
font
number
0
否
水印的文字大小，0-正常；1-大；2-小
color
string
#fff
否
水印的文字颜色
alpha
number
0.5
否
水印的文字的透明度，0-1之间
object.success 回调函数
参数
Object res
属性
类型
说明
image
string
图片路径
示例代码
api.addImageWaterMark({
image: '',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseImage
<!-- anchor: chooseimage -->

从本地相册选择图片或使用相机拍照。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
count
number
9
否
最多可以选择的图片张数
sourceType
string array
['album', 'camera']
否
选择图片的来源，album 从相册选图，camera 为使用相机
sizeType
string array
['original', 'compressed']
否
所选的图片的尺寸，original 为原图，compressed 为压缩图
微信小程序
watermark
object
否
照片添加水印，只有拍照功能下生效
友空间
returnThumbnail
boolean
false
否
是否需要返回缩略图（gif 图不返回）
友空间
openHdCache
boolean
false
否
iOS 判断是否启用高清缓存。开启高清缓存策略和 watermark 互为互斥条件，即 1. 当开启高清缓存时，watermark 字段必须为空 2. 当使用 watermark 时，高清缓存必为关闭状态
友空间
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
watermark 说明
属性
类型
默认值
必填
说明
text
string
是
水印的文字内容
position
number
0
否
水印的位置，0-正下方；1-正上方；2-正左方；3-正右方；4-左上方；5-左下方；6-右上方；7-右下方
font
number
0
否
水印的文字大小，0-正常；1-大；2-小
color
string
#fff
否
水印的文字颜色
alpha
number
0.5
否
水印的文字的透明度，0-1之间
object.success 回调函数
参数
Object res
属性
类型
说明
tempFilePaths
string array
图片的本地临时文件路径列表 (本地路径)
tempFiles
object array
图片的本地临时文件列表
tempFiles 结构
属性
类型
说明
path
string
本地临时文件路径 (本地路径)
size
number
本地临时文件大小，单位 B
thumbPath
string
缩略图路径
fileName
string
文件名称
示例代码
api.chooseImage({
count: 1,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseImageToServer
<!-- anchor: chooseimagetoserver -->

从本地相册选择图片或使用相机拍照，并把文件上传到友空间服务器，返回视频链接地址和信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
count
number
9
否
最多可以选择的图片张数
sourceType
string array
['album', 'camera']
否
选择图片的来源，album 从相册选图，camera 为使用相机
sizeType
string array
['original', 'compressed']
否
所选的图片的尺寸，original 为原图，compressed 为压缩图
watermark
object
否
照片添加水印，只有拍照功能下生效
tenantId
string
当前租户 ID
否
租户 ID
weakNet
number
0
否
是不是弱网，0 否，1 是
quality
number
0
否
图片压缩质量，0-100，0 表示不压缩
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
watermark 说明
属性
类型
默认值
必填
说明
text
string
是
水印的文字内容
position
number
0
否
水印的位置，0-正下方；1-正上方；2-正左方；3-正右方；4-左上方；5-左下方；6-右上方；7-右下方
font
number
0
否
水印的文字大小，0-正常；1-大；2-小
color
string
#fff
否
水印的文字颜色
alpha
number
0.5
否
水印的文字的透明度，0-1之间
object.success 回调函数
参数
Object res
属性
类型
说明
pictures
object array
图片文件描述列表
failedCount
number
上传失败的图片张数，android 专用
pictures 结构
属性
类型
说明
thumbUrl
string
缩略图地址
originalUrl
string
原始图片地址
originalSize
number
原始文件大小
示例代码
api.chooseImageToServer({
count: 1,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## compressLocalImage
<!-- anchor: compresslocalimage -->

图片压缩（不支持 gif 压缩）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
图片数据类型（0 或 1）
level
number
0
否
压缩的级别，支持 0 ~ 3 的整数
imgData
string
是
图片地址或 base64 数据
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
type 说明
值
说明
0
图片 base64 数据
1
图片路径
level 说明
值
说明
0
不压缩
1
低质量
2
中质量
3
高质量
object.success 回调函数
参数
Object res
属性
类型
说明
base64str
string
图片 base64 字符串
示例代码
api.compressLocalImage({
type: 1,
level: 2,
imgData: 'xxx',
success: function(res) {
console.log(res.base64str);
}
});

## continuousShooting
<!-- anchor: continuousshooting -->

使用相机拍照连拍多张照片，并把文件上传到友空间服务器，返回图片链接地址和信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
count
number
9
否
最多可以连拍的图片张数，最多支持 9
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
pictures
object array
图片文件描述列表
pictures 结构
属性
类型
说明
thumbUrl
string
缩略图地址
originalUrl
string
原始图片地址
originalSize
number
原始文件大小
示例代码
api.continuousShooting({
count: 6,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## continuousShootingLocal
<!-- anchor: continuousshootinglocal -->

连拍。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
count
string
是
连拍数量，取值范围[0,9]
quality
string
是
图片质量，取值范围[0,100]
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
返回参数说明
参数
类型
默认值
说明
pictures
Array
[]
图片数组，图片数据接口参考下面图片参数
图片参数
类型
默认值
说明
fileName
string
图片名称
fileSize
long long
0
图片大小
filePath
string
图片路径
示例代码
api.continuousShootingLocal({
'count': 3,
'quality': 100,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## deleteBase64Image
<!-- anchor: deletebase64image -->

删除本地的 base64 图片。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
name
string
是
图片的名称
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.deleteBase64Image({
name: '1.jpg',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getBase64Image
<!-- anchor: getbase64image -->

获取本地的 base64 字符串数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
name
string
是
图片的名称
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
imageData
string
图片的 base64 流数据
示例代码
api.getBase64Image({
name: '1.jpg',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## loadImageFromLocal
<!-- anchor: loadimagefromlocal -->

读取本地已保存的图片，以 base64 流的形式返回。（场景为弱网情况下需要展示图片，服务器图片请求超时则取本地图片）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
url
string
是
图片的文件服务器地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
imageData
string
图片的 base64 流数据
示例代码
api.loadImageFromLocal({
url: 'https://developer.yonyou.com/favicon.ico',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## previewImage
<!-- anchor: previewimage -->

预览图片。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
urls
string array
是
需要预览的图片链接列表
showmenu
boolean
true
否
是否显示长按菜单
微信小程序
current
string
urls 的第一张
否
当前显示图片的链接
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.previewImage({
current: '',
urls: []
});

## saveBase64Image
<!-- anchor: savebase64image -->

将图片的 base64 字符串以图片形式存储到本地。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
name
string
是
图片的名称
base64str
string
是
图片的 base64 数据
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
imageData
string
图片的 base64 流数据
示例代码
api.saveBase64Image({
name: '1.jpg',
base64str: '',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## saveImageToLocal
<!-- anchor: saveimagetolocal -->

将服务器的图片数据存储到本地。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
url
string
是
图片的文件服务器地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.saveImageToLocal({
url: 'https://developer.yonyou.com/favicon.ico',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseVideo
<!-- anchor: choosevideo -->

拍摄视频或从手机相册中选视频。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
sourceType
string array
['album', 'camera']
否
选择图片的来源，album 从相册选图，camera 为使用相机
maxDuration
number
60
否
拍摄视频最长拍摄时间，单位秒
compressed
boolean
true
否
是否压缩所选择的视频文件
微信小程序
camera
string
back
否
默认拉起的是前置或者后置摄像头。部分 Android 手机下由于系统 ROM 不支持无法生效
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
camera 说明
合法值
说明
back
后置摄像头
front
前置摄像头
object.success 回调函数
参数
Object res
属性
类型
说明
tempFilePath
string
选定视频的临时文件路径 (本地路径)
duration
number
选定视频的时间长度
size
number
选定视频的数据量大小
height
number
返回选定视频的高度
width
number
返回选定视频的宽度
示例代码
api.chooseVideo({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseVideoToServer
<!-- anchor: choosevideotoserver -->

拍摄视频或从手机相册中选视频，并将视频文件上传到友空间服务器。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
sourceType
string array
['album', 'camera']
否
选择图片的来源，album 从相册选图，camera 为使用相机
maxDuration
number
15
否
拍摄视频最长拍摄时间，单位秒
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
filePath
string
视频的链接地址，最大支持 100MB
duration
number
视频的时间长度
size
number
视频的数据量大小
height
number
视频的高度
width
number
视频的宽度
示例代码
api.chooseVideoToServer({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getVideoThumbnail
<!-- anchor: getvideothumbnail -->

获取视频缩略图，返回缩略图的 base64 编码数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
videoPath
string
是
本地视频的地址
thumbnailQuality
number
70
否
缩略图质量（0-100）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
thumbnailData
string
缩略图的 base64 编码数据
thumbnailHeight
number
缩略图高度
thumbnailWidth
number
缩略图宽度
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
400
参数不合法
示例代码
api.getVideoThumbnail({
videoPath: '',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## require
<!-- anchor: require -->

引用插件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
require()
示例代码
var bMap = api.require("bMap");

## historyBack
<!-- anchor: historyback -->

当前 window 或者 frame 的 a 标签历史记录后退一页
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
historyBack({params}, callback(ret, err))
参数
frameName：
类型：字符串
默认值：无
描述：（可选项）frame 名称，若不传则表示对当前页面进行操作
query：
类型：布尔
默认值：false
描述：（可选项）是否只查询。为 true 时表示只查询是否可以后退，而不进行后退操作
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status // 是否可以后退或后退是否成功，为 false 时说明不能后退，布尔类型
}
示例代码
api.historyBack({
frameName: 'detail'
}, function(ret, err) {
if (!ret.status) {
api.closeWin();
}
});

## historyForward
<!-- anchor: historyforward -->

当前 window 或者 frame 的 a 标签历史记录前进一页
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
historyForward({params}, callback(ret, err))
参数
frameName：
类型：字符串
默认值：无
描述：（可选项）frame 名称，若不传则表示对当前页面进行操作
query：
类型：布尔
默认值：false
描述：（可选项）是否只查询。为 true 时表示只查询是否可以前进，而不进行前进操作
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status // 是否可以前进或前进是否成功，为 false 时说明不能前进，布尔类型
}
示例代码
api.historyForward({
frameName: 'detail'
}, function(ret, err) {
if (!ret.status) {
}
});

## navigateBack
<!-- anchor: navigateback -->

关闭当前页面，返回上一页面或多级页面。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
delta
number
1
否
返回的页面数，如果 delta 大于现有页面数，则返回到首页
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.navigateBack({
delta: 2,
success: function(res) {
console.log(res.networkType);
}
});

## navigateTo
<!-- anchor: navigateto -->

保留当前页面，跳转到应用内的某个页面。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
url
string
是
需要跳转的应用内非 tabBar 的页面的路径 (代码包路径), 路径后可以带参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
events
Object
否
页面间通信接口，用于监听被打开页面发送到当前页面的数据
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
可用性
eventChannel
EventChannel
和被打开页面进行通信
微信小程序
示例代码
api.navigateTo({
url: 'index.html',
success: function(res) {
console.log(res.networkType);
}
});

## reLaunch
<!-- anchor: relaunch -->

关闭所有页面，打开到应用内的某个页面。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
url
string
是
需要跳转的应用内非 tabBar 的页面的路径 (代码包路径), 路径后可以带参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.reLaunch({
url: 'test?id=1',
success: function(res) {
console.log(res.networkType);
}
});

## redirectTo
<!-- anchor: redirectto -->

关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。
可用性
App
H5
微信小程序
友空间
OK
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
url
string
是
需要跳转的应用内非 tabBar 的页面的路径 (代码包路径), 路径后可以带参数。参数与路径之间使用 ? 分隔，参数键与参数值用 = 相连，不同参数用 & 分隔；如 'path?key=value&key2=value2'
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.redirectTo({
url: 'test?id=1',
success: function(res) {
console.log(res.networkType);
}
});

## startLocation
<!-- anchor: startlocation -->

调用系统自带定位功能，开始定位
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
startLocation({params}, callback(ret, err))
参数
accuracy：
类型：字符串
默认值：100m
描述：（可选项）定位精度
取值范围
10m //精度在10米范围内
100m //精度在100米范围内
1km //精度在1千米范围内
3km //精度在3千米范围内
filter：
类型：数字
默认值：1.0
描述：（可选项）位置更新所需最小距离（单位米）
autoStop：
类型：布尔
默认值：true
描述：（可选项）获取到位置信息后是否自动停止定位
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
longitude:116.213, //经度
latitude:39.213, //纬度
timestamp:1396068155591, //时间戳
status: true //定位成功
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.startLocation({
accuracy: '100m',
filter: 1,
autoStop: true
}, function(ret, err){
if(ret && ret.status){
//获取位置信息成功
}else{
api.alert({
msg:JSON.stringify(err)
});
}
});
补充说明
本API使用系统自身定位能力进行定位。
Android 上使用的是 Google 的定位服务，因法规政策的原因，在中国基本无法提供服务，因此建议国内开发者使用百度定位插件（baiduLocation）进行定位操作。
iOS上使用的是苹果的定位服务，不受影响。

## stopLocation
<!-- anchor: stoplocation -->

停止定位
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
stopLocation()
示例代码
api.stopLocation();
补充说明
停止定位

## getLocation
<!-- anchor: getlocation -->

获取位置信息，获取成功后自动停止获取。
若之前已通过 startLocation() 方法进行定位，则直接返回上次定位的数据，否则使用默认设置进行定位
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
getLocation(callback(ret, err))
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
longitude:116.213, //经度
latitude:39.213, //纬度
timestamp:1396068155591, //时间戳
status:true //定位成功
}
err：
类型：JSON 对象
内部字段：
{
msg:"" //错误描述
}
示例代码
api.getLocation(function(ret, err) {
if (ret && ret.status) {
//获取位置信息成功
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});
补充说明
本API使用系统自身定位能力进行定位。
Android 上使用的是 Google 的定位服务，因法规政策的原因，在中国基本无法提供服务，因此建议国内开发者使用百度定位插件（baiduLocation）进行定位操作。
iOS上使用的是苹果的定位服务，不受影响。

## chooseLocation
<!-- anchor: chooselocation -->

打开地图选择位置。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
latitude
number
否
目标地纬度
longitude
number
否
目标地经度
searchRadius
number
否
查询半径（单位：米），小于0时不限制
友空间
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
name
string
位置名称
微信小程序
address
string
详细地址
latitude
number
纬度，浮点数，范围为-90~90，负数表示南纬
longitude
number
经度，浮点数，范围为-180~180，负数表示西经
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.chooseLocation({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getLocationInfo
<!-- anchor: getlocationinfo -->

获取当前的地理位置信息，系统会根据当前手机所处位置使用不同坐标系，国内使用高德地图坐标系，国外使用WGS-84坐标系。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
latitude
number
纬度，范围为 -90~90，负数表示南纬
longitude
number
经度，范围为 -180~180，负数表示西经
accuracy
number
位置的精确度，反应与真实位置之间的接近程度，可以理解成 10 即与真实位置相差 10m，越小越精确
address
string
当前地址（可能为空）
友空间
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
-1
未知错误
1
失败
400
参数不合法
405
没有定位权限
1001
网络异常
示例代码
api.getLocationInfo({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getLocationUpdateInfo
<!-- anchor: getlocationupdateinfo -->

获取持续定位的位置信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
latitude
number
纬度，范围为 -90~90，负数表示南纬
longitude
number
经度，范围为 -180~180，负数表示西经
accuracy
number
位置的精确度，反应与真实位置之间的接近程度，可以理解成 10 即与真实位置相差 10m，越小越精确
speed
number
速度
address
string
地址描述
province
string
省
city
string
城市名称
cityCode
string
城市编码
time
string
时间
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.getLocationUpdateInfo({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## mapLocationExtend
<!-- anchor: maplocationextend -->

地图定位扩展。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
latitude
string
是
纬度
longitude
string
是
经度
targetDistance
number
否
目标距离，单位米
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
distance
number
传入的地点和当前定位地址的距离，单位米
currentLatitude
string
当前位置纬度
currentLongitude
string
当前位置的经度
address
string
当前位置地址
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
400
参数不合法
示例代码
api.mapLocationExtend({
longitude: '116.23648',
latitude: '40.071867',
targetDistance: 200,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## markAndNavigationDestination
<!-- anchor: markandnavigationdestination -->

在地图中展示目标点以及跳转第三方地图进行导航。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
address
string
否
目标地区地址
subAddress
string
否
目标地区详细地址
latitude
string
否
目标地纬度
longitude
string
否
目标地经度
userInfo
object
否
用户信息
infomation
string
否
客户信息
navigation
boolean
否
是否需要导航
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
userInfo 说明
属性
类型
说明
header
string
目标头像（如果为空则根据名称自动生成）
userId
string
目标用户 id
userName
string
目标用户名称
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
400
参数不合法
示例代码
api.markAndNavigationDestination({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## startLocationUpdate
<!-- anchor: startlocationupdate -->

开启持续定位。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.startLocationUpdate();

## stopLocationUpdate
<!-- anchor: stoplocationupdate -->

停止持续定位。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.stopLocationUpdate();

## readFile
<!-- anchor: readfile -->

读取文本文件内容，只支持utf-8编码文本类型文件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
readFile({params}, callback(ret, err))
参数
sync：
类型：布尔
默认值：false
描述：执行结果的返回方式。为false时通过callback返回，为true时直接返回。
path：
类型：字符串
默认值：无
描述：文件路径，支持绝对路径和文件路径协议如fs://、widget://等
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true, //操作成功状态值
data:"" //文件内容，字符串类型
}
err：
类型：JSON 对象
内部字段：
{
code:0, //错误码
msg:"" //错误描述
}
code取值范围:
0 //没有错误
1 //找不到文件错误
2 //不可读取错误
3 //编码格式错误
4 //无效操作错误
5 //无效修改错误
6 //磁盘溢出错误
7 //文件已存在错误
示例代码
//异步返回结果：
api.readFile({
path: 'fs://a.txt'
}, function(ret, err) {
if (ret.status) {
var data = ret.data;
} else {
api.alert({
msg:JSON.stringify(err)
});
}
});
//同步返回结果：
var data = api.readFile({
sync: true,
path: 'fs://a.txt'
});

## writeFile
<!-- anchor: writefile -->

写入内容到文本文件
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
writeFile({params}, callback(ret, err))
参数
path：
类型：字符串
默认值：无
描述：文件路径，支持绝对路径和文件路径协议如fs://、cache://等，不支持widget://目录，该目录只读
data：
类型：字符串
默认值：无
描述：文件内容
append：
类型：布尔
默认值：false
描述：是否以追加方式写入数据，默认会清除之前文件内容
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
status:true //操作成功状态值
}
err：
类型：JSON 对象
内部字段：
{
code:0, //错误码
msg:"" //错误描述
}
code 取值范围:
0 //没有错误
1 //找不到文件错误
2 //不可读取错误
3 //编码格式错误
4 //无效操作错误
5 //无效修改错误
6 //磁盘溢出错误
7 //文件已存在错误
示例代码
api.writeFile({
path: 'fs://a.txt',
data: 'writeFile测试内容'
}, function(ret, err) {
if (ret.status) {
//成功
} else {
}
});

## chooseFileFromLibrary
<!-- anchor: choosefilefromlibrary -->

从文库和文件传输列表中选择文件，返回文件信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
选择类型，0 从文库列表和传输列表选择，1 从文库列表选择，2 从传输列表选择
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
可用性
files
object array
文件描述列表
files 结构
属性
类型
说明
fileId
string
文件 id
fileName
string
文件名称
fileSize
string
文件大小
fileType
string
文件扩展名
fileUrl
string
文件地址
示例代码
api.chooseFileFromLibrary({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseLocalFileToServer
<!-- anchor: chooselocalfiletoserver -->

选取本地文件，上传到友空间服务器，并返回文件名称、路径、类型等信息。 android：最大可选数为 5，所选文件不大于 100MB，且不能为空。iOS：选择 iCloud 文件，仅支持单选文件，所选文件不大于 100MB，且不能为空。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
files
object array
文件描述列表
files 结构
属性
类型
说明
fileId
number
文件 id
fileName
string
文件名称
filePath
string
文件路径
fileSize
number
文件大小
thumb
string
缩略图（图片、视频文件）
示例代码
api.chooseLocalFileToServer({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseLocalFiles
<!-- anchor: chooselocalfiles -->

选取本地文件，并返回文件本地路径。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
maxNumber
number
5
否
iOS 默认是 1，且无法修改数量，android 可以选择文件的最大数量是 5，不能超过 5
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
localfiles
object array
文件描述列表
localfiles 结构
属性
类型
说明
fileName
string
文件名称
filePath
string
文件路径
fileSize
number
文件大小
示例代码
api.chooseLocalFiles({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## isFileExist
<!-- anchor: isfileexist -->

获取本地文件是否存在。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
filePath
string
是
本地文件路径
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
isExist
boolean
文件是否存在
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
示例代码
api.isFileExist({
filePath: '',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openDocument
<!-- anchor: opendocument -->

打开文档。
可用性
App
H5
微信小程序
友空间
OK
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
filePath
string
是
文件路径 (本地路径)
fileType
string
否
文件类型，指定文件类型打开文件，支持 doc、docx、xls、xlsx、ppt、pptx、pdf 等
showMenu
boolean
否
是否显示右上角菜单
微信小程序
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openDocument({
filePath: '',
fileType: 'pdf',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## previewDoc
<!-- anchor: previewdoc -->

提供文件下载 url 或者文件 fid，实现文件的预览，界面可包含下载等功能。
注：有文件 fid 传入文件 fid，没有文件 fid 必须传入 downloadUrl。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object（文件有 fid）
属性
类型
默认值
必填
说明
fileId
string
是
文件 id
fromType
number
0
否
文件来源，0：来自文库，1：IM，2：web，3：项目，4：旧IM，6：公告附件，7：新NC预览，8：任务预览
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
Object object（文件有下载地址）
属性
类型
默认值
必填
说明
downloadUrl
string
是
文件下载地址
fromType
number
5
否
文件来源，5：下载地址预览，9：金格编辑
fileName
string
是
文件名，必须带后缀
upload_url
string
是
上传的文件服务器地址，只有金格编辑才必须要传此参数。否则不用传
needDownload
number
否
是否需要下载按钮（0 不需要，1 需要）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
// 文件有 fid
api.previewDoc({
fileId: '130423',
success: function(res) {
console.log(JSON.stringify(res));
}
});
// 文件有下载地址
api.previewDoc({
downloadUrl: 'http://ykj-esn-test.oss-cn-beijing.aliyuncs.com//153437/1/201811/1/1541052859669H.jpg',
fromType: 5,
fileName: '1.jpg',
needDownload: 1,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## previewFile
<!-- anchor: previewfile -->

预览文件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
fid
string
是
文件ID或下载url（下载url预览from_type传入5）
from_type
number
是
0来自文库，1IM，2web，3项目，4旧IM，5下载地址预览,6公告附件，7.新NC预览,8任务预览,9金格编辑
file_type
number
否
1.企业文档，2.团队文档，3.我的文档，4.项目文档
filename
string
否
文件名（fid为下载url的预览,即from_type=5的时候，文件名必须传且必须带后缀名）
need_download
number
0
否
是否需要下载按钮（0不需要，1需要，对from_type = 5有效）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.previewFile({
'fid': '55',
'from_type':5,
'file_type':1,
'filename':'预览文件.txt',
success: function(res) {
console.log(res);
}
});

## wpsPreview
<!-- anchor: wpspreview -->

wps 文件预览。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
fileUrl
string
是
文件地址，使用 url 方式时必传
fileId
string
是
文件 id，使用文件 fid 方式时必传
fileName
string
是
文件名称
fileExt
string
是
文件扩展名
appId
string
是
文件来源，具体应用调用需要传入自己的 appId 才生效
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.wpsPreview({
fileName: 'test',
fileExt: 'doc',
fileUrl: 'https://ykj-esn-test.oss-cn-beijing.aliyuncs.com/198889/19756/202009/8/1599546151557V.doc',
appId: '5fa218e9f3cab6001845f6c4',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## alipayPayment
<!-- anchor: alipaypayment -->

支付宝支付。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
parameters
object
是
包含支付信息，后台生成，包含参数 orderInfo（支付的详细信息）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
parameters 说明
属性
类型
默认值
必填
说明
orderInfo
string
是
支付信息（由订单信息，签名，签名类型组成）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败（查询自己的服务器获取支付结果，前台数据可能有延迟不准确）
400
参数不合法
示例代码
api.alipayPayment({
parameters: {
orderInfo: '1'
},
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getWechatBill
<!-- anchor: getwechatbill -->

跳转微信卡包。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.getWechatBill({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## wxpayPayment
<!-- anchor: wxpaypayment -->

微信支付。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
parameters
JSON
是
包含支付的详细信息，后台生成
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.wxpayPayment({
parameters: {
appId:'wx****************',
partnerId:'1900000109',
prepayId:'1101000000140415649af9fc314aa427',
packageValue:'Sign=WXPay',
nonceStr:'1101000000140429eb40476f8896f4c9',
timeStamp:'1398746574',
sign:'oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ\/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq\/xDg=='
},
success: function(res) {
console.log(JSON.stringify(res));
}
});

## yonyouPay
<!-- anchor: yonyoupay -->

用友支付。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
1
否
支付类型，见下表
orderNo
string
是
订单号
totalAmount
number
是
订单金额，必须大于0
orderDesc
string
否
订单说明
callback
function
否
支付结果回调函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
type参数值
值
说明
1
微信H5支付
2
微信公众号支付
示例代码
api.yonyouPay({
type: 1,
orderNo: 'swrvcefdxawex',
totalAmount: 0.01,
orderDesc: 'test',
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## yonyouPayQuery
<!-- anchor: yonyoupayquery -->

查询用友支付结果。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
orderNo
string
是
订单号
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.yonyouPayQuery({
orderNo: 'swrvcefdxawex',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## shareWithType
<!-- anchor: sharewithtype -->

自定义分享，不提供页面组件，支持将特定信息分享到不同平台，包括友空间消息、友空间动态、微信、QQ。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
分享到的平台
title
string
'友空间客户端'
否
分享标题
desc
string
是
分享描述
imageUrl
string
友空间图标
否
分享图标
pageUrl
string
是
用户点击分享消息打开的详细内容页面
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
type 取值说明
值
说明
0
友空间消息
1
友空间动态
2
微信好友
3
微信朋友圈
4
QQ 好友
5
QQ 空间
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
2
取消
450
应用未安装
400
参数不合法
示例代码
api.shareWithType({
desc: '分享demo',
pageUrl: 'https://www.yonyou.com',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## showShareMenu
<!-- anchor: showsharemenu -->

提供分享页面组件，支持将特定信息分享到不同平台，包括友空间消息、友空间动态、微信、QQ。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
menu 中展示的可分享到的平台
title
string
'友空间客户端'
否
分享标题
desc
string
是
分享描述
imageUrl
string
友空间图标
否
分享图标
pageUrl
string
是
用户点击分享消息打开的详细内容页面
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
type 取值说明
值
说明
0
全部平台，包括友空间消息、友空间动态、微信好友、微信朋友圈、QQ好友、QQ空间
1
仅仅分享到友空间平台，包括友空间消息、友空间动态
object.success 回调函数
参数
Object res
属性
类型
说明
type
number
分享到的平台类型
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
2
取消
450
应用未安装
400
参数不合法
示例代码
api.showShareMenu({
desc: '分享demo',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## announceDetail
<!-- anchor: announcedetail -->

公告详情。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
announce_id
number
-1
是
公告id
qz_id
number
是
空间id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.announceDetail({
'announce_id': 1234,
'qz_id': 1,
success: function(res) {
console.log(res);
}
});

## openAnnounceReply
<!-- anchor: openannouncereply -->

打开公告评论列表。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
feedId
string
是
发言Id
replyNum
string
是
回复数量
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openAnnounceReply({
success: function(res) {
console.log(res);
}
});

## writeAnnounceReply
<!-- anchor: writeannouncereply -->

公告写评论。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
feedId
string
是
发言Id
replyNum
string
是
回复数量
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.writeAnnounceReply({
success: function(res) {
console.log(res);
}
});

## appletFromQzId
<!-- anchor: appletfromqzid -->

获取小程序来源圈子ID。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
fromQzId
string
是
fromQzId
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
fromQzId
string
fromQzId
success返回示例
{
"fromQzId":"123"
}
示例代码
api.appletFromQzId({
"fromQzId":"123",
success: function(res) {
console.log(res);
}
});

## configAppletMenu
<!-- anchor: configappletmenu -->

配置小程序的菜单。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
hideShare
number
0
否
隐藏分享按钮
hideForward
number
0
否
隐藏转发按钮
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.configAppletMenu({
"hideShare":1,
"hideForward":1,
success: function(res) {
console.log(res);
}
});

## enterApplet
<!-- anchor: enterapplet -->

小程序的关于界面，进入小程序。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
appId
string
是
小程序 id
qzId
string
是
空间 id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.enterApplet({
appId: '55',
qzId: '5',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getAppData
<!-- anchor: getappdata -->

查询单个应用信息(只返回当前空间，getlist3接口数据)。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
appId
string
是
appid
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
name
string
应用名称
icon
string
应用图标地址
success返回示例
{
"name": "微邮",
"icon": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/203530/201804/13/1523599675911c7b42f901b15ea608389f9cc96038.png?20170726"
}
示例代码
api.getAppData({
appId: "55",
success: function(res) {
console.log(res);
}
});

## getAppletCapsuleParams
<!-- anchor: getappletcapsuleparams -->

获取小程序胶囊占屏幕宽度比例值。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
leftWidthRadio
number
小程序右上角操控按钮到左边屏幕的距离与屏幕总宽的比值
statusBarHeight
string
状态栏高度（不支持通栏效果的手机系统不返回此字段，这里传递值的单位是 dp）
示例代码
api.getAppletCapsuleParams({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getAppletShareParams
<!-- anchor: getappletshareparams -->

获取小程序分享的参数。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
expandParams
string
工作台返回的 mdf 额外参数
shareParams
string
共享的自定义参数值
customTitle
string
自定义标题
customSubtitle
string
自定义副标题
customShowImgUrl
string
自定义图标远程地址
示例代码
api.getAppletShareParams({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getGzipAppData
<!-- anchor: getgzipappdata -->

获取 gzip 应用数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
key
string
是
gzip 存数据的键
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
data
string
gzip 根据存数据的键取出来的值
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
示例代码
api.getGzipAppData({
key: 'abc',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getHhtQrCodeInfo
<!-- anchor: gethhtqrcodeinfo -->

获取红火台缓存信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
success返回示例
{
"hht_extend": "0",
"hht_hash": "SEhULVNFQ1RFVDoxNTg4ODE2MTQwOjE1MTAxMDk1Nzkz",
"is_all": "1",
"list": [
{
"account_balance": "971.00",
"account_name": "个人餐补账户",
"cardType": 1,
"code_no": "HHT020167471558510511198982578",
"dcu_num": "67471558510511198",
"dept_card_type": 0,
"reserve_field": ""
},
{
"account_balance": "0.00",
"account_name": "部门加班餐账户",
"cardType": 2,
"code_no": "HHT020244211569572195479127274",
"dcu_num": "44211569572195479",
"dept_card_type": 0,
"reserve_field": ""
}
],
"user_id": "F56FC2090C000000E000000000155000",
"yhtUserId": "88be8860-5493-46f4-a1c5-6035c481b6c0"
}
示例代码
api.getHhtQrCodeInfo({
success: function(res) {
console.log(res);
}
});

## getOffLineOutSignPhoto
<!-- anchor: getofflineoutsignphoto -->

拍照上传服务器或者返回base64信息（上传成功返回图片url,上传失败返回图片的base64信息）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
tenantId
string
当前租户id
否
租户ID，可跨租户上传(友空间6.5.0及以上版本)
watermark_type
number
否
签到
watermark
object
否
水印数据对象与type匹配
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
签到的水印信息watermark的数据结构
参数名
类型
默认值
必填
说明
username
string
是
名字
address
string
是
地址
content
string
是
签到内容
object.success 回调函数
参数
Object res
图片上传成功：
参数
类型
说明
thumbUrl
string
缩略图地址
originalUrl
string
原始图片地址
originalSize
number
原始文件大小
图片上传失败：
参数
类型
说明
imageBase64
string
图片的base64信息
success返回示例
{
"originalUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/1556176647078315ad8b5d860dd8a7e5205b6e2c11.jpg",
"originalSize": 199024,
"thumbUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/1556176647078315ad8b5d860dd8a7e5205b6e2c11.jpg.square.thumb.jpg"
}
示例代码
api.getOffLineOutSignPhoto({
"watermark_type":1,
"watermark":{
"username":"刘王芳",
"address":"北京市海淀区西北旺镇亮甲店村颐和山庄(亮甲店路)",
"content":"签到 2020-02-04 12:12:51"
},
success: function(res) {
console.log(res);
}
});

## openAppSetting
<!-- anchor: openappsetting -->

打开混合云常用应用页面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openAppSetting({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openAppWithParams
<!-- anchor: openappwithparams -->

启动应用。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
app_id
string
是
应用id
currentDay
string
否
日程当前时间(20201112)
member_id
number
否
用户id(从哪个进入的，从共享人进行，就是共享人的id)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
备注：支持打开应用类型：原生应用（内置原生、第三方原生）、NC轻应用、summer应用
示例代码
api.openAppWithParams({
'app_id': '55',
success: function(res) {
console.log(res);
}
});

## openCustomSetting
<!-- anchor: opencustomsetting -->

打开多维门户自定义设置。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openCustomSetting({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openGzipApp
<!-- anchor: opengzipapp -->

打开gzip应用。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
appId
string
是
应用id
qzId
string
是
应用所属空间id
url
string
加载的当前页面
否
eclocal://开头，例如eclocal://index.html，如果没有传，则使用工作台的加载首页
appData
string
否
gzip的自定义参数值，可通过getGzipAppData桥接获取
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openGzipApp({
appId:'79',
'qzId':'5418',
'url':'eclocal://index.html',
'appData':'abc',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openPluginWithParams
<!-- anchor: openpluginwithparams -->

打开插件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
plugin_id
string
是
插件id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openPluginWithParams({
'plugin_id': '1',
success: function(res) {
console.log(res);
}
});

## openSearchAppList
<!-- anchor: opensearchapplist -->

打开应用搜索列表。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openSearchAppList({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openSignViewWithParams
<!-- anchor: opensignviewwithparams -->

打开专属化考勤应用。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
domainUrl
string
是
域名
cookieKey
string
是
cookie的key
cookieDomain
string
是
cookie的域名
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openSignViewWithParams({
domainUrl: 'a.yonyou.com',
cookieKey: 'key1',
cookieDomain: 'a.yonyou.com',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## setAppletCapsuleStyle
<!-- anchor: setappletcapsulestyle -->

设置小程序胶囊样式。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
capsuleStyle
number
0
是
胶囊样式，0浅色 1深色 2自定义颜色
customCapsuleBgColor
string
#BFBFBF
否
自定义胶囊背景色值 例:#00ff00
customCapsuleBgAlpha
number
0
否
自定义胶囊背景透明度 0-1，默认0-完全透明
customCapsuleImgColor
string
#111111
否
自定义胶囊图片色值 例:#00ff00
customCapsuleBorderColor
string
#BFBFBF
否
自定义胶囊边框色值 例:#00ff00
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.setAppletCapsuleStyle({
'capsuleStyle':2,
'customCapsuleBgColor':'#00ff00',
'customCapsuleBgAlpha':0.5,
'customCapsuleImgColor':'#00ff00',
'customCapsuleBorderColor':'#00ff00',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## shareApplet
<!-- anchor: shareapplet -->

分享小程序到im或动态。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
1
是
0-转发到im，1-分享到动态
params
string
否
共享的自定义参数值
customTitle
string
是
自定义标题
customSubTitle
string
是
自定义副标题
customShowImgUrl
string
是
自定义图标远程地址
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.shareApplet({
'type':1,
'params':'abc',
'customTitle':'标题',
'customSubTitle':'副标题',
'customShowImgUrl':'https://www.abc.com/abc.png',,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## config
<!-- anchor: config -->

全局鉴权配置。参考 鉴权说明
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
agentId
string
是
代理 id
signature
string
是
签名
timeStamp
string
是
当前的时间戳
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.config({
agentId: '',
signature: '',
timeStamp: '',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getOAuthCode
<!-- anchor: getoauthcode -->

获取免登授权码，实现单点登录。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
OAuthCode
string
免登授权码
示例代码
api.getOAuthCode({
success: function(res) {
console.log(res.OAuthCode);
}
});

## chooseChatFromContact
<!-- anchor: choosechatfromcontact -->

选取联系人进行单聊会话。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.chooseChatFromContact({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openChatByGroupId
<!-- anchor: openchatbygroupid -->

发起群聊会话。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
groupId
string
是
群组的ID
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openChatByGroupId({
groupId:'yy00256',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openChatByUserId
<!-- anchor: openchatbyuserid -->

直接发起和特定人员的单聊会话。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
userType
number
0
否
对方用户id的使用类型，0-使用友空间用户id；1-使用友互通用户id
userId
string
是
对方用户的唯一标示
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openChatByUserId({
userType:1,
userId:'yy00256',
success: function(res) {
console.log(res);
}
});

## sendImageMessages
<!-- anchor: sendimagemessages -->

向指定的个人或者群组发送图片消息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
userType
number
0
否
对方用户id的使用类型，0-使用友空间用户id；1-使用友互通用户id
chatId
string
是
对方的唯一标示
chatType
string
是
对方的类型(chat: 单聊 groupchat: 群聊)
filePaths
Array.< string >
是
发送图片的本地地址集合
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.sendImageMessages({
userType:1,
chatId:'yy00256',
chatType:'chat',
filePaths:[
"file://documents/image/1.jpg",
"file://documents/image/2.jpg",
"file://documents/image/3.jpg"
],
success: function(res) {
console.log(res);
}
});

## checkCloudAlarm
<!-- anchor: checkcloudalarm -->

查询云闹钟开关状态。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
id
string
是
事件id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为一个JSON数组，具体的字段说明如下：
参数
类型
说明
operate_type
number
开关，1开启，0关闭
id
string
事件id
success返回示例
[
{
'operate_type' : '0',
'id:''123432343'
},
{
'operate_type' : '0',
'id:''123432343'
}
]
示例代码
api.checkCloudAlarm({
id: "32423432",
success: function(res) {
console.log(res);
}
});

## operateCloudAlarm
<!-- anchor: operatecloudalarm -->

开关云闹铃。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
member_id
string
是
人员id
qz_id
number
否
空间id
operate_type
number
是
开关，1开启，0关闭 (开闹钟必须传)
id
string
是
事件id
remind_time
string
否
提醒时间（10位）(开闹钟必须传)
title
string
否
事件名称 (开闹钟必须传)
start_time
string
否
事件名称 事件开始时间（10位）
end_time
string
否
事件结束时间（10位）
from
number
否
事件来源（0考勤，1日程，2会议）(开闹钟必须传)
remind_mode
number
否
提醒模式（0只提醒一次，暂时不需要）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.operateCloudAlarm({
member_id: 'x',
operate_type: 1,
id: 0,
success: function(res) {
console.log(res.networkType);
}
});

## chooseAllContacts
<!-- anchor: chooseallcontacts -->

跨空间选择联系人，返回联系人基础信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
multiple
boolean
true
否
是否多选
selectedList
array.< string >
否
已选人员ID数组
navTitle
string
选择联系人
否
导航标题
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为一个JSON数组，其中各个字段说明如下
参数
类型
说明
userName
string
用户名
userId
string
用户Id
mobile
string
手机号
avatar
string
头像url
success返回示例
[{
"avatar": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1078/117504/201711/30/15120073548f4d2e18d000304bce33a8109b98e8a7.jpg.middle.jpg",
"mobile": "18201015239",
"userId": "117504",
"userName": "玫瑰二七"
}, {
"avatar": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/3035/153436/201607/15/146858148200523211a1c4d6d2f679fa236e60cee4.jpg.middle.jpg",
"mobile": "15889409765",
"userId": "153436",
"userName": "陆海鹏"
}]
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.chooseAllContacts({
success: function(res) {
console.log(res);
}
});

## chooseContacts
<!-- anchor: choosecontacts -->

选择联系人，返回联系人基础信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
multiple
boolean
true
否
是否多选
selectedList
array.< string >
否
已选用户数组
maxCount
number
否
最大选择人数
navTitle
string
选择联系人
否
导航标题
navColor
string
#ffffff
否
导航颜色值
qzId
string
当前登录空间ID
否
需要选择的空间id
canDelete
boolean
true
否
是否可以删除已选人员(IOS 已弃用)
canSelectDept
boolean
true
否
是否可以点部门选择（仅多选时有效）(true:可通过部门选择 false:不可以通过部门选择)
needYhtUserId
number
0
否
是否需要友户通ID(1:需要友户通ID 0:不需要友户通ID)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为一个JSON数组，其中各个字段说明如下
参数
类型
说明
userName
string
用户名
userId
string
用户Id
mobile
string
手机号
avatar
string
头像url
success返回示例
[
{
"avatar": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/41376/201610/19/1476862315a2000ba73eea106a76716bdd93f6104b.jpg.middle.jpg",
"mobile": "150-0230-5086",
"userId": "41376",
"userName": "马增盛"
}, {
"avatar": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1078/117504/201711/30/15120073548f4d2e18d000304bce33a8109b98e8a7.jpg.middle.jpg",
"mobile": "18201015239",
"userId": "117504",
"userName": "玫瑰二七"
}, {
"avatar": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/3035/153436/201607/15/146858148200523211a1c4d6d2f679fa236e60cee4.jpg.middle.jpg",
"mobile": "15889409765",
"userId": "153436",
"userName": "陆海鹏"
}
]
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.chooseContacts({
success: function(res) {
console.log(res);
}
});

## chooseDepartment
<!-- anchor: choosedepartment -->

选择部门，返回部门基础信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
multiple
boolean
true
否
是否多选
selectedList
array.< object >
否
已选部门数组
maxCount
number
否
最大选择组织数
selectedCount
number
否
已选择组织数
deptType
number
0
否
部门类型(0:所有 1:部门 2:组织)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为一个JSON数组，其中各个字段说明如下
参数
类型
说明
deptName
string
组织名
deptId
string
组织Id
subName
string
组织简称
type
string
组织类型
haveSub
number
是否存在下级
success返回示例
[{
"deptId": "147855",
"deptName": "人力资",
"subName": "人力资",
"type": "0",
"haveSub": 0,
"deptType": 1
}, {
"deptId": "147856",
"deptName": "财务部(2016)ddr",
"subName": "财务部(2016)ddr",
"type": "0",
"haveSub": 0,
"deptType": 1
}]
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.chooseDepartment({
success: function(res) {
console.log(res);
}
});

## chooseGroupContacts
<!-- anchor: choosegroupcontacts -->

群内选择联系人，支持单选和多选。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
qzId
string
是
需要选择的空间 id
groupId
string
是
已选用户数组
multiple
boolean
false
否
是否多选
maxCount
number
否
最大选择人数, 多选时用
navTitle
string
选择联系人
否
导航标题
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res (object array)
属性
类型
说明
userName
string
用户名
userId
string
用户 id
avatar
string
头像 url
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
11
用户取消操作
400
参数不合法
示例代码
api.chooseGroupContacts({
multiple: true,
qzId: '5',
groupId: '7',
title: '我是标题',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## chooseInsideGroup
<!-- anchor: chooseinsidegroup -->

选择内部群，返回内部群信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
multiple
boolean
true
否
是否多选
selectedList
array.< object >
否
已选内部群数组
groupType
number
1
否
内部群类型(0:已加入的内部群 1:所有内部群 2:未加入的内部群)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
groupId
string
内部群Id
groupName
string
内部群名称
success返回示例
[{
"groupId": "8366",
"groupName": "提醒我"
}]
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.chooseInsideGroup({
success: function(res) {
console.log(res);
}
});

## chooseUserOrGroupFromChat
<!-- anchor: chooseuserorgroupfromchat -->

通过会话列表，选择个人或者群组，返回个人的用户id或者群组id。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
navTitle
string
否
导航标题(ios有这个参数Android没有)
groupType
number
1
否
内部群类型(0:已加入的内部群 1:所有内部群 2:未加入的内部群)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
type
number
返回类型，0、用户；1、群组
userId
string
用户Id
groupId
string
群组Id
success返回示例
{
"type":0,
"userId":"117504",
"groupId":""
}
示例代码
api.chooseUserOrGroupFromChat({
'navTitle':'分享',
success: function(res) {
console.log(res);
}
});

## convertMemberIDs
<!-- anchor: convertmemberids -->

空间member_id和友户通user_id相互转换。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
string
是
转换类型(0:空间ID换友互通ID 1:友互通ID换空间ID)
idArray
array.< object >
是
需要转换的数组
groupType
number
1
否
内部群类型(0:已加入的内部群 1:所有内部群 2:未加入的内部群)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为一个key-valule存储的转换后数据
success返回示例
{
"7f819bfa-3f82-40d8-92ee-c5aed49f4248": "3311262",
"fffa795c-58ed-4ad0-bcae-1d274a3475b3": "3310170"
}
示例代码
api.convertMemberIDs({
'type': '1',
'idArray': ['7f819bfa-3f82-40d8-92ee-c5aed49f4248','fffa795c-58ed-4ad0-bcae-1d274a3475b3']
success: function(res) {
console.log(res);
}
});

## openCreateSpace
<!-- anchor: opencreatespace -->

选择空间类型，跳转到对应的原生创建页面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
type
string
0：企业类型空间 1：团队类型空间
source
string
打开URL时传入参数
success返回示例
{
"type": "0",
"source": "minespace"
}
示例代码
api.openCreateSpace({
success: function(res) {
console.log(res);
}
});

## viewUserInfo
<!-- anchor: viewuserinfo -->

打开人员详情界面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
memberId
number
是
人员id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
101
无查看权限
102
人员不存在
示例代码
api.viewUserInfo({
success: function(res) {
console.log(res);
}
});

## chooseLibraryFiles
<!-- anchor: chooselibraryfiles -->

从文库列表中选择文库文件，返回文件基础信息。
注：文件下载URL和预览URL要通过接口单独获取。预览URL有code失效值。下载URL中添加了密钥。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
type
number
0
否
文库选择类型(0:从文库列表和传输列表选择 1:从文库列表选择 2:从传输列表选择)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
回调值为JSON数组，具体的字段说明如下：
参数
类型
说明
fileName
string
文件名称
fileId
string
文件ID
fileSize
number
文件大小(字节)
fileType
string
文件扩展名
fileTypeFlag
number
扩展名分类(-1:"未知格式"; 0:"doc,docx,wps,dps,wpt";1: "pot,potx,ppt,pptx,dpt,pps,ppsx";2: "xls,xlsx";3: "txt";4: "pdf";5: "rar,zip"; 6: "avi,rmvb,rm,asf,divx,mpg,mpeg,mpe,wmv,mp4,mkv,vob,flv";7: "jpg,jpeg,bmp,psd,gif,png,tiff";8: "mp3,wav")
created
string
创建时间
qzId
string
文件所在圈子ID
userName
string
上传者名称
userId
string
上传者ID
success返回示例
[{
"is_delete": "0",
"crc32": "",
"feedcount": "0",
"powers": "1,2,10",
"filepath": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/203530/10623/201802/28/151979991214Q8.pdf",
"old_box_id": "0",
"extflag": 4,
"created": "1519800709",
"uname": "白宇宇fiona",
"firstext": "2",
"filename": "jason博士-26号数学公开课",
"org_name": "用友集团",
"selected": 1,
"title_keywords": "",
"bid": "79636",
"data_from": "1",
"filesize": "3359929",
"op_num": "0",
"upload_id": "",
"listType": "2",
"order_time": "1542330711",
"viewnum": "26",
"parent_path": "79635,79636,",
"title_first_letter_desc": "19",
"is_view": "1",
"from_type": "0",
"update_mid": "0",
"from_id": "0",
"file_source": "1",
"org_id": "0",
"download_type": "0",
"allowdown": "0",
"copy_mark": "0",
"avatar": "1/14627/201604/25/1461578986081804e807ce62e547cb94b813aaea3e.jpg",
"showSelect": 1,
"content": "",
"belongs": 1,
"fileext": "pdf",
"group_id": "0",
"crmtype": "1",
"qz_id": "917",
"data_type": "1",
"member_id": "14627",
"fid": "114770",
"title": "jason博士-26号数学公开课",
"title_first_letter": "j",
"updatetime": "1542330711",
"downnum": "4",
"muid": "14627",
"followcount": "5"
}]
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.chooseLibraryFiles({
'type': 1,
success: function(res) {
console.log(res);
}
});

## openLibraryFiles
<!-- anchor: openlibraryfiles -->

打开文库具体路径。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
firstCatalog
number
否
一级目录(企业文档：1；内部群文档：2；我的文档：3；项目文档：4)
secondCatalog
number
否
二级目录(企业文档：0；我的文档：0；我的文档(TA人共享)：-4；内部群文档：内部群ID；项目文档：项目ID；)
thirdCatalog
number
否
三级目录(文件夹id)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
枚举
类型
firstCatalog
secondCatalog
thirdCatalog ｜
企业文档
1
0
文件夹ID
内部群文档-一级目录
2
内部群ID
0
内部群文档-二级目录
2
0
文件夹ID
项目群文档-一级目录
4
项目群ID
0
项目群文档-二级目录
4
0
文件夹ID
我的文档-TA共享一级目录
3
-4
0
我的文档-TA共享二级目录
3
-4
文件夹ID
我的文档-非TA人共享目录
3
0
文件夹ID
示例代码
api.openLibraryFiles({
success: function(res) {
console.log(res);
}
});

## openLiveFlow
<!-- anchor: openliveflow -->

调用直播界面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
pushurl
string
是
推流URL
screenOrientation
boolean
false
否
默认竖屏, 是否需要横屏, true不需要, false需要
videoResolution
number
3
否
0 320p, 1 640p, 2 865p, 3 1280p
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openLiveFlow({
pushurl: "",
success: function(res) {
console.log(JSON.stringify(res));
}
});

## sendMiniMail
<!-- anchor: sendminimail -->

打开发送微邮界面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
users
array.< object >
是
收件人列表
spaceId
string
当前所在空间id
否
空间id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
users内部结构字段说明
值
类型
必填
说明
uid
string
是
用户id
name
string
是
用户名
avatar
string
是
头像url
mobile
string
是
手机号
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
11
用户取消操作
示例代码
api.sendMiniMail({
'users':[{
"uid":"54cbad",
"name":"小友",
"avatar":"http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/13722/3260120/201806/1/15278271217ZOr.jpg",
"mobile":"18888888888"
}],
success: function(res) {
console.log(res);
}
});

## checkMirrorStatus
<!-- anchor: checkmirrorstatus -->

检测投屏状态。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
status
string
状态 0投屏中；1未投屏
mirrorCode
string
投屏码
success返回示例
{
status："0" //0，投屏中；1未投屏
mirrorCode:"1234" //投屏码
}
示例代码
api.checkMirrorStatus({
success: function(res) {
console.log(res);
}
});

## closeMirrorScreen
<!-- anchor: closemirrorscreen -->

关闭投屏功能。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.closeMirrorScreen({
success: function(res) {
console.log(res);
}
});

## startMirrorScreen
<!-- anchor: startmirrorscreen -->

开启投屏功能。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
code
string
是
投屏码
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.startMirrorScreen({
'code':'1234',
success: function(res) {
console.log(res);
}
});

## collectionData
<!-- anchor: collectiondata -->

埋点。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
appId
string
是
应用ID
action
string
是
埋点事件
detailId
string
是
详情ID
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.collectionData({
'appId':'SI243499',
'action':'JUMP',
'detailId':'JI99900',
success: function(res) {
console.log(JSON.stringify(res));
}
});

## configSkinAndTabbar
<!-- anchor: configskinandtabbar -->

换肤功能，保存换肤数据到本地，用与显示用户的换肤数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
currentQzId
string
是
需要更换主题租户的空间 id
skinData
string
是
换肤主题色数据，json 字符串，用于取主题色
tabbarData
string
否
换肤下导航数据，json 字符串，用于下导航显示
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
var light = {
"mainColor":"#625CE0",
"supportColor":{
"c1":"#2B92FF",
"c2":"#F9A003",
"c3":"#67BA78",
"c4":"#FC7D49",
"c5":"#50C2E9"
},
"navColor":"#625CE0",
"appNavColor":"#625CE0",
"myImg":"https://ec.diwork.com/front/portal/images/setting/applyicon/matteImg01.png",
"navImg":"",
"appImg":"",
"matteImg":"https://ec.diwork.com/front/portal/images/setting/applyicon/matteImg02.png"
};
var dark = {
"mainColor":"#625CE0",
"supportColor":{
"c1":"#2B92FF",
"c2":"#F9A003",
"c3":"#67BA78",
"c4":"#FC7D49",
"c5":"#50C2E9"
},
"navColor":"#625CE0",
"appNavColor":"#625CE0",
"myImg":"https://ec.diwork.com/front/portal/images/setting/applyicon/matteImg01.png",
"navImg":"",
"appImg":"",
"matteImg":"https://ec.diwork.com/front/portal/images/setting/applyicon/matteImg02.png"
};
var skinData = {light:light, dark:dark};
api.configSkinAndTabbar({
currentQzId: '360997',
skinData: JSON.stringify(skinData),
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getComponentList
<!-- anchor: getcomponentlist -->

获取组件列表。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
isHybrid
number
1是混合，0是非混合
componentList
object array
组件列表
res 返回示例说明
{
isHybrid: 1,
componentList:[{
is_home : 1,
extendinfo : {},
id : 23,
apptype : 0,
open_appid : '',
componentsTyle : 0,
is_first : 0,
redirecturl : 'm_announce',
appid : 85,
name : '公告'
}]
}
示例代码
api.getComponentList({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getMultiDataCenterConfig
<!-- anchor: getmultidatacenterconfig -->

获取服务端API的多数据中心配置，包括集中部署、多数据中心部署的服务的域名、服务编码。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
domain
object
集中部署服务配置
multidata
object
多数据中心部署服务配置
domain 说明
属性
类型
说明
domainCode
object
集中部署配置的服务编码列表，key 是服务的唯一标志，见下面的服务标志表，value 是服务编码。服务编码不包含前后的斜杠，示例：yonbip-ec-base
domainUrl
string
集中部署配置的域名，包含 http 协议头，不包含后面的斜杠，示例： https://bip.diwork.com
multidata 说明
属性
类型
说明
multidataCode
object
多数据中心部署配置的服务编码列表，key 是服务的唯一标志，见下面的服务标志表，value 是服务编码。服务编码不包含前后的斜杠，示例：yonbip-ec-link
multidataUrl
object
多数据中心部署配置的域名，包含 http 协议头，不包含后面的斜杠，示例： https://bip.diwork.com
服务标志表
业务
服务标志
日程
yonbip-ec-schedule
res 返回示例
{
"data":{
"domain":{
"domainCode":{
"yonbip-ec-base":"yonbip-ec-base"
},
"domainUrl":"https://bip.diwork.com"
},
"multidata":{
"multidataCode":{
"yonbip-ec-link":"yonbip-ec-link",
"yonbip-ec-contact":"yonbip-ec-contact"
},
"multidataUrl":{
"zuhu1":"https://zuhu1.bip.diwork.com",
"zuhu2":"https://zuhu2.bip.diwork.com"
}
},
"currentTenantID":"rytunvbnzc"
}
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.getMultiDataCenterConfig({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## mdfIsLoad
<!-- anchor: mdfisload -->

返回预加载状态，用于 MDF 在线 H5 调用，预加载完成后打开 MDF 应用时使用预加载。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.mdfIsLoad({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## reloadWorkbenchPath
<!-- anchor: reloadworkbenchpath -->

通知客户端加载最新资源包。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.reloadWorkbenchPath({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## writeLocationLog
<!-- anchor: writelocationlog -->

写入本地日志。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
parameterDic
object
""
是
日志数据信息
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.writeLocationLog({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## gainUserInfo
<!-- anchor: gainuserinfo -->

获取个人信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
userId
string
用户id
muid
string
成员id
name
string
用户名
qzId
string
空间id
email
string
邮箱
mobile
string
手机号
loginName
string
登录用户名
isAdmin
string
是否管理员 0:管理 1:普通成员
qzName
string
空间名称
accessToken
string
登陆授权码
avatar
string
头像地址
success返回示例
{
"userId" : "1351411",
"muid" : "4369626",
"name":"xxxxx",
"qzId" : "25174",
"email" : "abc@gamil.com",
"mobile" : "18201222222",
"loginName" : "yy_6856857382445588480dMvvvW,
"isAdmin" : "1",
"qzName" : "0112灰度旗舰全自动化",
"accessToken" : "603bbc28592437e582376db5b73d3a5a54736f736",
"avatar" : "https://ykj-esn-test.obs.cn-north-4.myhuaweicloud.com/yonbip-ec-file/2022/01/14/17/01/d66b9373-59cf-44bc-9c5b-ffd0b271eb0e.png.middle.jpg"
}
示例代码
api.gainUserInfo({
success: function(res) {
console.log(res);
}
});

## getUserAgent
<!-- anchor: getuseragent -->

获取友空间自定义通用UserAgent信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
userAgent
string
自定义通用UserAgent信息
success返回示例
{
"userAgent" : "QYZone_1-6.2.7-1-1 EsnReimbursement esn:// youZoneLanguage=zh yht_access_token=xxxxx"
}
userAgent返回值说明
userAgent返回值以" "空格间隔
版本信息"QYZone_1-6.2.7-1-1"，"QYZone_"为友空间APP的特别标识，包含该字符串说明是友空间APP的浏览器，后面分为四部分，各部分使用"-"连接。
第一部分代表终端类型，1是Android，2是iOS；
第二部分代表应用的版本号，如 6.2.7；
第三部分代表环境，1是正式环境，2是测试环境；
第四部分代表应用类型，1是标准版。
差旅壹号使用"EsnReimbursement esn://"，特殊添加，iOS独有
语言类型"youZoneLanguage"，值为：zh简体中文，tw繁体中文，en英文。
友户通"yht_access_token"，用于与友户通对接获取友户通信息。
示例代码
api.getUserAgent({
success: function(res) {
console.log(res);
}
});

## getUserFontSize
<!-- anchor: getuserfontsize -->

获取个人在应用设置中设置的字体大小。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
level
number
用户设置的字体大小
level说明
level由小到大对应着字体由小到大。字体大小的说明值只是参考，不同场景下level对应的字体号有偏差，最终需要根据UI设计师确定具体页面的要求
level
说明
0
移动端字体14
1
移动端字体16，默认设置
2
移动端字体18
3
移动端字体20
4
移动端字体22
5
移动端字体24
success返回示例
{
"level" : 4,
}
示例代码
api.getUserFontSize({
success: function(res) {
console.log(res);
}
});

## getUserYHTInfo
<!-- anchor: getuseryhtinfo -->

获取个人友互通信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
tenant_id
string
当前租户空间id
yht_userid
string
当前用户友互通id
yhtToken
string
当前用户友互通token, 加密字段
success返回示例
{
"tenant_id" : "32b2j3b2kj3b2",
"yht_userid" : "nj1223",
"yhtToken":"xxxxx"
}
示例代码
api.getUserYHTInfo({
success: function(res) {
console.log(res);
}
});

## createFeedComponent
<!-- anchor: createfeedcomponent -->

新建发言。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
groupId
string
是
开放权限(是否能看到这条发言)的团队id
groupName
string
是
开放权限的团队id的名字
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
不传groupId和groupName,默认开放权限为所有人
示例代码
api.createFeedComponent({
'groupId':'092143',
'groupName':'移动应用开发部',
success: function(res) {
console.log(res);
}
});

## createNewSchedule
<!-- anchor: createnewschedule -->

提供新建日程功能，调用时端上会打开新建日程页面，用户可以在此完善日程信息，并新建日程。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
scheduleId
string
日程id
success返回示例
{
"scheduleId":"1234",
}
示例代码
api.createNewSchedule({
success: function(res) {
console.log(res);
}
});

## getSchedulesFromMobile
<!-- anchor: getschedulesfrommobile -->

提供时间区间，如果用户开启了同步手机日程的开关，返回该时间区间内的手机日程列表，否则返回空。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
startTime
long
0
是
开始时间戳
endTime
long
0
是
结束时间戳
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
scheduleList
object
日程信息
success返回示例
{
"scheduleList": [
{
"color": "#FF6B37",
"endTime": 1637157600,
"memberId": 152812,
"showEndTime": "22:00",
"showStartTime": "21:00",
"sid": 0,
"startTime": 1637154000,
"title": "Ggghh"
},
{
"color": "#FF6B37",
"endTime": 1637157600,
"memberId": 152812,
"showEndTime": "22:00",
"showStartTime": "21:00",
"sid": 0,
"startTime": 1637154000,
"title": "Ccc"
}
]
}
示例代码
api.getSchedulesFromMobile({
'startTime':1635739200000,
'endTime':1638244800000,
success: function(res) {
console.log(res);
}
});

## openScheduleDetail
<!-- anchor: openscheduledetail -->

打开日程查看详情界面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
scheduleId
number
1
是
日程id
currentDay
string
否
日程当前时间(20201112)
member_id
number
否
用户id(从哪个进入的，从共享人进行，就是共享人的id)
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openScheduleDetail({
'scheduleId': 1,
'member_id': 1122,
success: function(res) {
console.log(res);
}
});

## sendTodoReceipt
<!-- anchor: sendtodoreceipt -->

发送待办处理回执。
从待办中心跳转的业务方处理完业务后，发送待办处理回执，客户端会即时刷新待办中心的处理状态
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.sendTodoReceipt({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## viewScheduleDetail
<!-- anchor: viewscheduledetail -->

提供一个日程详情页面，根据传入的日程id以及用户id，展示出指定日程的详细信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
scheduleId
string
0
是
日程id
subId
string
0
否
日程子Id(只有重复日程存在子Id)
memberId
string
当前用户ID
否
用户ID
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.viewScheduleDetail({
'scheduleId':'100',
'memberId':'232722',
success: function(res) {
console.log(res);
}
});

## viewScheduleList
<!-- anchor: viewschedulelist -->

传入指定日期，展示指定日期的日程列表界面（展示界面包括月视图）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
time
number
当前时间戳
否
指定日期时间戳（10位）
memberId
string
否
人员id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.viewScheduleList({
'time' : 1545321600,
'memberId' : 421149,
success: function(res) {
console.log(res);
}
});

## getToken
<!-- anchor: gettoken -->

获取轻应用code。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
token
string
code
success返回示例
{
"token":"92819njsknbfjkshbfjankjdnjkwhr87y38ad"
}
示例代码
api.getToken({
success: function(res) {
console.log(res);
}
});

## getU8DeviceInfo
<!-- anchor: getu8deviceinfo -->

u8轻应用登录获取设备信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
appid
string
固定值
appversion
string
app 版本号
brand
string
设备类型 固定值
carrier
string
固定值
devicetype
string
固定值
devlanguage
string
app当前语言
imei
string
固定值
nettype
string
网络类型
os
string
固定值
osversion
string
IOS 系统版本
resolution
string
屏幕分辨率
screensi
string
屏幕物理尺寸
type
string
“P” ipad “M” iphone
wfaddress
string
设备唯一标识符UDID
示例代码
api.getU8DeviceInfo({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8DeleteAttachment
<!-- anchor: u8deleteattachment -->

u8删除附件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
fileid
string
是
文件id
filetype
string
是
文件名后缀
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
备注：根据fileid和filetype删除本地的缓存文件
示例代码
api.u8DeleteAttachment({
filetype:'jpg',
fileid: "8496b612-c4e8-4014-a2d6-5ab0d88495c5.txt",
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8DownLoadAttachment
<!-- anchor: u8downloadattachment -->

u8下载附件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
ispiece
boolean
是
true 是分片下载 false 不是分片下载
fileType
string
是
文件后缀
fileId
string
是
当前文件id
fileContent
string
是
Base64字符串
fileIdArray
string[]
是
文件id数组
isshowexif
boolean
否
false 不展示exif信息 true 展示exif信息
ftotalsize
number
否
分片时文件的总大小
piececount
number
否
分片时分片的数量
offset
number
否
分片时文件的总大小
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
备注：添加的exif信息为GPS的反地理编码以及拍摄的时间,拍照上传的时候才会有这个参数
示例代码
api.u8DownLoadAttachment({
ispiece: true,
fileType: ".png",
fileId: "xxxxxx",
fileContent: "xxxxx",
fileIdArray: ['x','y']
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8JudgeCacheAttachment
<!-- anchor: u8judgecacheattachment -->

u8上传附件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
fileid
numner
是
文件id
isaddexif
string
是
文件后缀
ispiece
boolean
false
否
false 不分片 true 分片
fileNameArray
string[]
否
true 只有图片才会有,传一组id
isshowexif
boolean
否
false 不展示exif信息 true 展示exif信息
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
判断如果有缓存,会直接打开图片或者其他支持的附件格式
示例代码
api.u8JudgeCacheAttachment({
fileid:'xx',
isaddexif: ".png",
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8PreviewVoucherDetail
<!-- anchor: u8previewvoucherdetail -->

u8预览单据详情。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
title
string
是
标题
content
string
是
单据内容（base64字符串）
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.u8PreviewVoucherDetail({
"title": "单据详情",
"content":"12312123123",
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8ScanCode
<!-- anchor: u8scancode -->

u8销售订单打开连续扫码页面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.u8ScanCode({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## u8UploadAttachment
<!-- anchor: u8uploadattachment -->

u8上传附件。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
filetype
number
是
文件类型(0:相机 1:相册 2:录音 3:本地文件)
isaddexif
boolean
否
false 不添加exif信息 true 添加exif信息
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
备注：添加的exif信息为GPS的反地理编码以及拍摄的时间,拍照上传的时候才会有这个参数
示例代码
api.u8UploadAttachment({
filetype: 0,
success: function(res) {
console.log(JSON.stringify(res));
}
});

## setGesturePassword
<!-- anchor: setgesturepassword -->

设置手势密码。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.setGesturePassword();

## verifyGesturePassword
<!-- anchor: verifygesturepassword -->

验证手势密码。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
未设置手势密码
-1
手势密码输入错误次数已达上限
示例代码
api.verifyGesturePassword({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## verifyLoginPassword
<!-- anchor: verifyloginpassword -->

弹出密码验证对话框，验证用户身份。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
title
string
否
弹窗标题，若不传，显示默认的文案：为了确保数据安全，需要验证您的登录密码
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.verifyLoginPassword({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getWatermarkInfo
<!-- anchor: getwatermarkinfo -->

获取空间水印信息。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
qzId
string
是
圈子ID，若为空，返回app当前空间水印信息
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
isWatermark
number
是否显示水印 （0 不显示 1 显示 ）
success返回示例
{
isWatermark: 1
}
示例代码
api.getWatermarkInfo({
qzId: "1234",
success: function(res) {
console.log(res);
}
});

## closeXYChatView
<!-- anchor: closexychatview -->

关闭小友页面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.closeXYChatView({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## getXYVersion
<!-- anchor: getxyversion -->

获得小友版本号。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
属性
类型
说明
version
string
版本号
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
1
失败
示例代码
api.getXYVersion({
success: function(res) {
console.log(JSON.stringify(res));
}
});

## openXYChatView
<!-- anchor: openxychatview -->

打开小友页面。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
xiaoyou_params
JSON
是
业务方自定义参数
autoClose
boolean
否
NCC订单定制功能，在订单确定后自动关闭页面
callback
function
否
NCC订单定制功能，在订单确定后回调的函数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.openXYChatView({
xiaoyou_params:{
aaa:111,
bbb:222
},
autoClose:false,
callback: function(res) {
console.log(JSON.stringify(res));
}
});

## faceCollect
<!-- anchor: facecollect -->

采集当前面部信息并与当前登录用户绑定。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
spaceId
string
当前空间id
否
空间id
faceGroupId
string
yongyou
否
存放人脸信息的库id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
当前用户已经采集过人脸
-2
人脸识别超时
示例代码
api.faceCollect({
success: function(res) {
console.log(res);
}
});

## faceCompare
<!-- anchor: facecompare -->

提供当前采集的面部信息与人脸库内的面部信息进行比对，返回匹配的用户id和分数，以及微笑值（可选）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
spaceId
string
当前空间id
否
空间id
faceGroupId
string
yongyou
否
存放人脸信息的库id
needSmile
boolean
false
否
是否需要返回微笑分数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
userId
string
匹配度最高的用户id
faceScore
string
当前采集到的人脸与人脸库中面部匹配分数
smileScore
string
微笑分数
faceLiveness
string
活体分数
success返回示例
{
"faceLiveness": "1",
"userId": "d522e892-c9ea-4fbd-acd5-b472e125e69c",
"faceScore": "97.292373657227"
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
当前用户已经采集过人脸
-2
人脸识别超时
示例代码
api.faceCompare({
success: function(res) {
console.log(res);
}
});

## faceDetect
<!-- anchor: facedetect -->

提供当前采集到的人脸信息与当前账号录入的人脸信息进行识别，返回对比分数以及微笑值（可选）。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
spaceId
string
当前空间id
否
空间id
faceGroupId
string
yongyou
否
存放人脸信息的库id
needSmile
boolean
false
否
是否需要返回微笑分数
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
参数
类型
说明
faceScore
string
当前采集到的人脸与人脸库中面部匹配分数
smileScore
string
微笑分数
faceLiveness
string
活体分数
success返回示例
{
"faceScore":"96.95407867431599",
"faceLiveness":"1"
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
当前用户已经采集过人脸
-2
人脸识别超时
示例代码
api.faceDetect({
success: function(res) {
console.log(res);
}
});

## smileDetect
<!-- anchor: smiledetect -->

提供检测目标微笑值的功能。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
spaceId
string
当前空间id
否
空间id
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
smileScore
string
微笑分数
success返回示例
{
"smilescore": "51"
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
-1
当前用户已经采集过人脸
-2
人脸识别超时
示例代码
api.smileDetect({
success: function(res) {
console.log(res);
}
});

## startSpeechSyn
<!-- anchor: startspeechsyn -->

提供文字合成语音的功能,如果在合成期间再次调用合成返回错误。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
text
string
是
需要合成的字符串
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.startSpeechSyn({
'text':'XXXXXXXXXXXXXXXXXXXXX',
success: function(res) {
console.log(res);
}
});

## stopSpeechSyn
<!-- anchor: stopspeechsyn -->

提供结束语音合成的功能，如果没有在合成调用此方法会返回错误。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
示例代码
api.stopSpeechSyn({
success: function(res) {
console.log(res);
}
});

## translateVoice
<!-- anchor: translatevoice -->

提供实时语音数据转文字的功能,结束调用后会返回相应转换完成的文字。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
bytes
string
是
base64数据音频数据字符串
isShowUI
boolean
true
否
是否提供UI界面
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
text
string
语音转换文字的结果
success返回示例
{"text":"这是成功的返回示例"}
示例代码
api.translateVoice({
'bytes': 'XXXXXXXXXXXXXXXXX',
'isShowUI':false,
success: function(res) {
console.log(res);
}
});

## voiceToText
<!-- anchor: voicetotext -->

提供实时语音转文字的功能,结束调用后会返回相应转换完成的文字。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
可用性
isShowUI
boolean
true
否
是否提供UI界面
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
text
string
语音转换文字的结果
success返回示例
{"text":"这是成功的返回示例"}
示例代码
api.voiceToText({
success: function(res) {
console.log(res);
}
});

## decryptData
<!-- anchor: decryptdata -->

使用可逆算法解密指定数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
data
string
是
需要解密的数据
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
result
string
解密后的数据
success返回示例
{
'result': '123'
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
1
解密失败
示例代码
api.decryptData({
'data': '73EB26B0FFECD541D50B996D99472A03',
success: function(res) {
console.log(res);
}
});

## encryptData
<!-- anchor: encryptdata -->

使用可逆算法加密指定数据。
可用性
App
H5
微信小程序
友空间
OK
参数
Object object
属性
类型
默认值
必填
说明
data
string
是
需要加密的数据
success
function
否
接口调用成功的回调函数
fail
function
否
接口调用失败的回调函数
complete
function
否
接口调用结束的回调函数（调用成功、失败都会执行）
object.success 回调函数
参数
Object res
参数
类型
说明
result
string
加密后的数据
success返回示例
{
'result':'LDLFDFFLDWLJXIVCVNSNEWENWQEM'
}
object.fail 回调函数
参数
Object res
属性
类型
说明
code
string
错误码
errMsg
string
错误描述
code 取值
值
说明
400
参数不合法
1
加密失败
示例代码
api.encryptData({
'data': '测试数据',
success: function(res) {
console.log(res);
}
});

## pageUp
<!-- anchor: pageup -->

页面向上滚动一页
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.0.0及更高版本
可提供的1.0.0及更高版本
pageUp({params}, callback(ret, err))
参数
top：
类型：布尔
默认值：false
描述：（可选项）是否直接滚动到最顶部
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
scrolled:true //是否滚动，为false时说明当前页面已经到达顶部了
}
示例代码
api.pageUp(function(ret, err) {
if (!ret.scrolled) {
//已经滚动到顶部
}
});

## pageDown
<!-- anchor: pagedown -->

页面向下滚动一页
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.1.0及更高版本
可提供的1.1.0及更高版本
pageDown({params}, callback(ret, err))
参数
bottom：
类型：布尔
默认值：false
描述：（可选项）是否直接滚动到最底部
callback(ret, err)
ret：
类型：JSON 对象
内部字段：
{
scrolled:true //是否滚动，为false时说明当前页面已经到达底部了
}
示例代码
api.pageDown(function(ret, err) {
if (!ret.scrolled) {
//已经滚动到底部
}
});

## setFocus
<!-- anchor: setfocus -->

设置input是否获取焦点
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.3.35及更高版本
可提供的1.3.35及更高版本
setFocus({params})
参数
inputId：
类型：字符串
默认值：无
描述：input标签id
focus：
类型：布尔
默认值：无
描述：是否获取焦点
示例代码
api.setFocus({
inputId: 'test',
focus: true
});

## agreedPrivacy
<!-- anchor: agreedprivacy -->

当在 config.xml 中配置了使用自定义隐私政策弹框时，在用户同意协议后，需调用此方法通知应用，应用会记录用户已同意隐私政策，然后执行之前因隐私政策弹框而延后的操作。
可用性
Android
iOS
H5
微信小程序
友空间
OK
OK
OK
可提供的1.3.46及更高版本
可提供的1.3.46及更高版本
agreedPrivacy()
示例代码
api.agreedPrivacy();
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->
