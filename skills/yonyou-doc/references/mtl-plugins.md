# MTL.js 原生插件 · 离线正文

> 来源：`https://developer.yonyou.com/docs/Client-API/MTL/*`（原生插件模块文档）
> 快照：2026-10-22，共 **28** 个模块，由 `scripts/sync_docs.py` 生成，请勿手工编辑。

---

## MTL对象
<!-- source: /docs/Client-API/MTL/mtl -->

MTL对象
常用基础API
常用插件
常用业务能力
智能套件
移动设备能力
多媒体
文件
界面组件
参照
网络能力
扫码
用户交互行为反馈
数据处理
数据安全
映美打印机
其他
IM功能
分享
支付
推送
阿里推送
PDA
小友
用户插件
选人
VR图片
OCR
语音能力
手势解锁
人脸识别
touchID
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 人脸识别
<!-- source: /docs/Client-API/MTL/renlian -->

人脸识别
mtl支持版本6.0.11及以上
插件名称：百度人脸识别(带界面)
封装了百度人脸识别SDK，此版SDK包含人脸检测、活体识别等功能
添加插件所需参数
字段
类型
必填
说明
file_license文件
文件
是
用于SDK离线功能使用，在您的申请人脸SDK的 后台页面 ，全局->产品服务->人脸识别->离线采集SDK管理
iOS人脸license后缀
string
是
上传文件后缀(face-ios)
iOS人脸license文件名
string
是
上传文件名称(idl-license)
应用名称(appname)+「-face-ios」后缀
string
是
iOS license ID名称
android人脸licenseID
string
是
安卓 license ID名称
android配置license文件 步骤中配置的文件名称
string
是
上传文件名称(idl-license.face-android)
封装百度License插件
ios配置license文件：
下载 UIBdFaceAppendix 插件 zip 包并解压，把 zip 包内 target 目录下的 license文件替换为自己申请的license文件。然后重新压缩为 zip 包文件上传自定义插件，打包时勾选该插件。
android配置license文件：
下载 bdFaceAppendix 插件zip包并解压(解压后会看到一个UIBdFaceAppendix文件夹) (2) 将文件夹中的source目录下的license.jar解压(会看到一个\assets\目录) (3) 从百度 后台 下载license文件替换掉第(2)步解压出来的\assets\目录中文件，并重新将assets打成jar包(命名成license.jar)，替换掉之前的jar包。 (4)UIBdFaceAppendix文件夹重新打包为zip文件，以自定义插件方式加入项目
人脸功能配置
configuration
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
minFaceSize
number
200
否
最小检测人脸阈值
cropFaceSizeWidth
number
400
否
截取人脸图片大小
occluThreshold
number
0.5
否
人脸遮挡阀值
blurThreshold
number
0.7
否
图像模糊阀值
eulurAngle
string
否
头部姿态角度
timeout
number
10
否
超时时间
threshold
number
0.6
否
人脸检测精度阀值
maxCropImageNum
number
1
否
照片采集张数
sound
boolean
true
否
是否开启提示音
eulurAngle参数
字段
类型
默认值
必填
说明
pitch
number
10
否
三维旋转之俯仰角度[-90(上), 90(下)]
yaw
number
10
否
三维旋转之左右旋转角[-90(左), 90(右)]
roll
number
10
否
平面内旋转角[-180(逆时针), 180(顺时针)]
示例
mtl.ai.configuration({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开活体检测页面
openLivenessView
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
actions
array
否
活体检测动作
0/眨眼，1/张嘴，2/向右摇头，3/向左摇头，
4，抬头，5，低头，
6/摇头（1.0.2以及以后版本不再支持），
7/没有动作
isByOrder
boolean
true
否
是否按顺序进行活体动作
numOfLiveness
number
3
否
活体动作数目（actions为空时起作用）
示例
mtl.ai.openLivenessView({
success: function(res) {
status:0, //数字类型；检测结果
bestImagePaths:[], //数组类型；status为0返回（1.0.2以及之后版本插件 android不支持）
liveEyePath:'', //字符类型；status为0返回（1.0.2以及之后版本插件 android不支持）
liveMouthPath:'', //字符类型；status为0返回（1.0.2以及之后版本插件 android不支持）
yawRightPath:'', //字符类型；status为0返回（1.0.2以及之后版本插件 android不支持）
yawLeftPath:'', //字符类型；status为0返回 （1.0.2以及之后版本插件 android不支持）
pitchUpPath:'', //字符类型；status为0返回 （1.0.2以及之后版本插件 android不支持）
pitchDownPath:'', //字符类型；status为0返回 （1.0.2以及之后版本插件 android不支持）
bestImageStr:'', //字符串类型，status为0返回 质量最优的图片base64字符串 （1.0.2以及之后版本插件 android返回）
imageStrs:[ //数组类型；status为0返回 所有图片base64字符串（1.0.2以及之后版本插件 android返回）
{key:'', //字符串类型
value:'',}, //字符串类型；图片base64字符串
],
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
检测结果参考
0：成功 1：头部偏低 2：头部偏高 3：头部偏左 4：头部偏右 5：光照不足 6：没有检测到人脸 9：图像模糊 10：左眼有遮挡 11：右眼有遮挡 12：鼻子有遮挡 13：嘴巴有遮挡 14：左脸颊有遮挡 15：右脸颊有遮挡 16：下颚有遮挡 17：太近 18：太远 19：出框 20：眨眨眼 21：张大嘴 22：向左摇头 23：向右摇头 24：向上抬头 25：向下低头 26：摇摇头 27：完成一个活体动作 28：verifyInitError 29：verifyDecryptError 30：verifyInfoFormatError 31：verifyExpired 32：verifyMissRequiredInfo 33：verifyInfoCheckError 34：verifyLocalFileError 35：verifyRemoteDataError 36：超时 37：conditionMeet
打开人脸图像采集页面
openDetectionView
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.ai.openDetectionView({
success: function(res) {
status:0, //数字类型；检测结果
bestImagePaths:[], //数组类型；status为0返回 (1.0.2以及以后版本 android不支持)
bestImageStr:'', //字符串类型，status为0返回 质量最优的图片base64字符串 （1.0.2以及之后版本插件 android返回）
imageStrs:[ //数组类型；status为0返回 所有图片base64字符串（1.0.2以及之后版本插件 android返回）
{key:'', //字符串类型
value:'',}, //字符串类型；图片base64字符串
],
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 用友推送
<!-- source: /docs/Client-API/MTL/yonyoutuisong -->

用友推送
插件名称：用友推送
设置deviceToken
setDeviceToken
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
appkey
string
是
应用key
appSecret
string
是
应用secret
userid
string
是
用户名
certificateName
stirng
是
证书名称
baseUrl
stirng
否
域名
示例
mtl.push.setDeviceToken({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
删除用户推送
removePush
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
appkey
string
是
应用key
userid
string
是
用户名
示例
mtl.push.removePush({
appkey:'',
userid: '',
success: function(res) {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取点击通知消息
getNotice
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
notice
array[]
通知
示例
mtl.push.getNotice({
success: function(res) {
// 成功回调
var notice = res.notice
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
在线消息
receiveNotice
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
registerCallback
function
是
数据回调方法
callbaseName
stirng
是
方法名称
返回参数说明
字段
类型
说明
notice
array[]
消息
示例
mtl.push.receivePush({
callbaseName: '',
success: function(res) {
},
registerCallback： function(res) {
var notice = res.notice
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设置角标数
setBadgeNumber
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
默认值
说明
count
int
否
0
角标数量
示例
mtl.push.receivePush({
callbaseName: '',
success: function(res) {
},
registerCallback： function(res) {
var notice = res.notice
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 阿里推送
<!-- source: /docs/Client-API/MTL/alituisong -->

阿里推送
插件名称：阿里云推送
receivePush
阿里云推送
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
registerCallback
function
是
数据回调方法
callbaseName
stirng
是
方法名称
示例
mtl.aliPush.receivePush({
callbaseName: '',
registerCallback： function(res) {
var notice = res.notice
},
success: function (res) {
},
fail: function (err) {
var message = err.message; // 错误信息
}
})
返回数据格式
{
"action": "message",//消息：message，通知：notify
"title": "标题",
"content": "内容"
}
getOffLinePush
获取离线推送数据
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
type
int
是
离线消息：0，离线通知：1，所有离线数据：2
返回参数说明
字段
类型
说明
message
array[]
消息
notify
array[]
通知
示例
mtl.aliPush.getOffLinePush({
type: 0,
success: function (res) {
},
fail: function (err) {
var message = err.message; // 错误信息
}
})
返回数据格式
{
"message":[ //离线消息
{
"action": "message",
"title": "标题",
"content": "内容"
}
],
"notify":[ //离线通知
{
"action": "notify",
"title": "标题",
"content": "内容"
}
],
}
getDeviceId
获取deviceId
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
返回参数说明
字段
类型
说明
deviceId
string
设备ID
示例
mtl.aliPush.getDeviceId({
success: function (res) {
var deviceId = res.deviceId;
},
fail: function (err) {
var message = err.message; // 错误信息
}
})
getDeviceToken
获取deviceToken
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
返回参数说明
字段
类型
说明
deviceToken
string
deviceToken
示例
mtl.aliPush.getDeviceToken({
success: function (res) {
var deviceToken = res.deviceToken;
},
fail: function (err) {
var message = err.message; // 错误信息
}
})
setBadgeAutoIncrement
设置角标
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
badgeNum
int
是
badge数，取值范围[0,99999]
示例
mtl.aliPush.setBadgeAutoIncrement({
badgeNum: 1,
success: function (res) {
},
fail: function (err) {
var message = err.message; // 错误信息
}
})
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 参照
<!-- source: /docs/Client-API/MTL/canzhao -->

参照
城市选择
showCityPicker (6.0.0及以上)
chooseCity (即将废弃)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
province
string
否
默认选择省份（严格按照国家命名传入）
成功回调返回
字段
类型
说明
province
string
选择的省信息
city
string
选择的市信息
示例
mtl.showCityPicker({
province: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
日期选择
showDateTimePicker (6.0.0及以上)
dateTimePicker (即将废弃)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
format
string
否
返回的日期格式 1. yyyy-MM-dd 2. HH:mm 3. yyyy-MM-dd HH:mm 4.yyyy-MM 5.yyyy
currentDate
string
否
控件默认选择的日期时间(格式yyyy-MM-dd)
成功回调返回
字段
类型
说明
time
string
选择的日期时间
示例
mtl.showDateTimePicker({
format:'yyyy-MM-dd',
currentData:'2019-01-15',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 多媒体
<!-- source: /docs/Client-API/MTL/duomeiti -->

多媒体
调用相机/相册
注意：
微信上 chooseImage 接口用户点击"取消"不会触发任何回调。
chooseImage
拍照或从手机相册中选图接口
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
名称
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
String Array
['album', 'camera']
否
选择图片的来源
watermark
object
否
照片添加水印，只有拍照功能下生效
returnThumbnail
boolen
false
否
是否需要返回缩略图
sourceType的合法值
值
说明
album
从相册选择图片(H5不支持此设置)
camera
使用相机
watermark的参数说明
名称
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
水印的位置，0-正下方;1-正上方;2-正左方;3-正右方;4-左上方;5-左下方;6-右上方;7-右下方;
font
number
0
否
水印的文字大小,0-正常;1-大;2-小
color
string
#FFFFFF
否
水印的文字颜色
alpha
number
0.5
否
水印的文字的透明度，0-1之间的
示例
mtl.chooseImage({
sourceType: ['album','camera'],
returnThumbnail: true,
watermark: {
text:'我的水印',
position:0,
font:1,
color:'#FF00FF',
alpha:0.9
},
success: function(res) {
// 返回选定照片的本地ID列表
var localIds = res.localIds; // ['wxLocalResource://imageid123456789', ...]
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选取图片并上传友空间服务器
chooseImageToServer
从本地相册选择图片或使用相机拍照，并把文件上传到友空间服务器，返回视频链接地址和信息。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
名称
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
String Array
['album', 'camera']
否
选择图片的来源
watermark
object
否
照片添加水印，只有拍照功能下生效(wx不支持)
sourceType的合法值
值
说明
album
从相册选择图片
camera
使用相机
watermark的参数说明
名称
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
水印的位置，0-正下方;1-正上方;2-正左方;3-正右方;4-左上方;5-左下方;6-右上方;7-右下方;
font
number
0
否
水印的文字大小,0-正常;1-大;2-小
color
string
#FFFFFF
否
水印的文字颜色
alpha
number
0.5
否
水印的文字的透明度，0-1之间的
返回参数说明
1.pictures
参数
类型
说明
pictures
array
返回结果对象数组
2.picture对象
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
示例
mtl.chooseImageToServer({
sourceType: ['album','camera'],
watermark: {
text:'我的水印',
position:0,
font:1,
color:'#FF00FF',
alpha:0.9
},
success: function(res) {
// 返回选定照片的本地ID列表
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
{
"data": {
"pictures": [{
"originalUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/1556176647078315ad8b5d860dd8a7e5205b6e2c11.jpg",
"originalSize": 199024,
"thumbUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/1556176647078315ad8b5d860dd8a7e5205b6e2c11.jpg.square.thumb.jpg"
}, {
"originalUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/15561766509e302539914a6b43cb4d875c0a8123fa.jpg",
"originalSize": 312553,
"thumbUrl": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/15561766509e302539914a6b43cb4d875c0a8123fa.jpg.square.thumb.jpg"
}]
}
}
预览图片
previewImage
跳转到图片预览界面
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
current
string
否
当前显示图片的 url
urls
Array.
是
需要预览的图片 url 列表
示例
mtl.previewImage({
current: "https://wx2.sinaimg.cn/mw690/70396e5agy1g0leayhrhoj211418gq9q.jpg",
urls: [
"https://wx3.sinaimg.cn/mw690/70396e5agy1g0leax4owvj211418gk2j.jpg",
"https://wx4.sinaimg.cn/mw690/70396e5agy1g0leay2ymtj211418gk11.jpg",
"https://wx2.sinaimg.cn/mw690/70396e5agy1g0leayhrhoj211418gq9q.jpg",
"https://wx3.sinaimg.cn/mw690/70396e5agy1g0leazeikxj211418gqdc.jpg"
],
success: function(res){
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
保存图片到相册
saveImageToPhotoAlbum
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
否
图片的文件服务器地址
示例
mtl.saveImageToPhotoAlbum({
url：''
success: function(res) {
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取本地图片的base64编码
getLocalImgData
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
localId
string
是
图片的localID
返回参数说明
名称
类型
默认值
localData
string
base64字符串
示例
mtl.getLocalImgData({
localId: "",
success: function(res) {
var localData = res.localData; // localData是图片的base64数据，可以用 img 标签显示
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
保存图片到本地
saveImageToLocal
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
是
图片的文件服务器地址
示例
mtl.saveImageToLocal({
url: "",
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
读取本地图片
loadImageFromLocal
读取本地已保存的图片，以BASE64流的形式返回。（场景为弱网情况下需要展示图片，服务器图片请求超时则取本地图片）
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
是
图片的文件服务器地址
返回参数说明
名称
类型
默认值
imageData
string
base64字符串
示例
mtl.loadImageFromLocal({
url: "",
success: function(res) {
let imageData = res.imageData
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选取视频
chooseVideo
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
sourceType
array
否
选择视频来源，默认二者都有。['album', 'camera']
maxDuration
number
否
最长视频时间。最长60秒，默认15秒
返回参数说明
字段
类型
说明
filePath
string
视频临时文件路径，最大支持100MB
duration
number
视频时间长度,单位(秒)
size
number
视频数据大小,单位(字节)
height
number
视频高度
width
number
视频宽度
示例
mtl.chooseVideo({
maxDuration: 15,
sourceType: ["album", "camera"],
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选取视频并上传友空间服务器
chooseVideoToServer
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
sourceType
array
否
选择视频来源，默认二者都有。['album', 'camera']
maxDuration
number
否
最长视频时间。最长60秒，默认15秒
返回参数说明
字段
类型
说明
filePath
string
视频临时文件路径，最大支持100MB
duration
number
视频时间长度,单位(秒)
size
number
视频数据大小,单位(字节)
height
number
视频高度
width
number
视频宽度
示例
mtl.chooseVideoToServer({
maxDuration: 15,
sourceType: ["album", "camera"],
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
{
"data": {
"size": 2390479,
"duration": 11,
"height": 1280,
"width": 720,
"filePath": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/153424/201904/25/1556176994a5cdfb266614c59b1f27fd022e62f40f.mp4"
}
}
音频-开始录音
startRecord
开始录音(友空间5.22.0及以上版本)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.startRecord({
fail: function(err) {
var message = err.message; // 错误信息
}
});
音频-结束录音
stopRecord
结束录音(友空间5.22.0及以上版本)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
localId
string
微信音频的本地ID,用空间是BASE64加密处理后的音频数据字符串
示例
mtl.stopRecord({
success: function(res) {
var localId = res.localId; // 微信音频的本地ID,用空间是BASE64加密处理后的音频数据字符串
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
监听录音自动停止
onVoiceRecordEnd
监听录音自动停止，录音时间超过一分钟没有停止的时候会执行 complete 回调
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
localId
string
微信音频的本地ID,用空间是BASE64加密处理后的音频数据字符串
示例
mtl.onVoiceRecordEnd({
success: function(res) {
var localId = res.localId; // 微信音频的本地ID,用空间是BASE64加密处理后的音频数据字符串
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
音频-播放录音
playVoice
播放录音(友空间5.22.0及以上版本)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
localId
string
是
需要播放的音频的本地ID，由 stopRecord 接口获得
注意
1、播放localId必传；
2、继续播放：友空间端localId必须为空，微信端localId必传。
示例
mtl.playVoice({
localId: "",
fail: function(err) {
var message = err.message; // 错误信息
}
});
音频-暂停播放录音
pauseVoice
暂停播放录音，继续播放请调用 playVoice方法(友空间5.22.0及以上版本)
如果当前不再播放状态，友空间返回错误，微信返回成功
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
localId
string
是
需要暂停的音频的本地ID，由 stopRecord 接口获得
示例
mtl.pauseVoice({
localId: "",
fail: function(err) {
var message = err.message; // 错误信息
}
});
音频-结束播放
stopVoice
结束播放(友空间5.22.0及以上版本)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
localId
string
是
需要停止的音频的本地ID，由 stopRecord 接口获得
示例
mtl.stopVoice({
localId: "",
fail: function(err) {
var message = err.message; // 错误信息
}
});
监听录音播放完毕
onVoicePlayEnd
监听录音播放完毕
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.onVoicePlayEnd({
success: function(res) {
var localId = res.localId; // 音频的本地ID
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
录音（含UI）
showRecordAudio (6.0.0及以上)
recordAudio (即将废弃)
提供录音界面以及功能，支持最长60s录音，返回经过BASE64加密处理后的音频数据字符串。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
bytes
string
经过BASE64加密处理后的音频数据字符串
示例
mtl.showRecordAudio({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 分享
<!-- source: /docs/Client-API/MTL/fenxiang -->

分享
分享
doShare
分享功能，支持分享到友空间、微信、QQ
**需要选择插件： **QQ分享登录，微信登录、分享
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
type
number
是
分享的平台 ID(ios、安卓不支持0和1类型)
title
string
是
文本标题
desc
string
是
文本内容
imgUrl
string
是
分享图标
link
string
是
分享链接
type合法值
值
说明
0
友空间消息(仅支持友空间)
1
友空间动态(仅支持友空间)
2
微信好友
3
微信朋友圈
4
QQ好友
5
QQ空间
示例
mtl.doShare({
type:0,
title:'',
desc:'',
imgUrl:'',
link:'',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 手势解锁
<!-- source: /docs/Client-API/MTL/shoushi -->

手势解锁
mtl支持版本6.0.11及以上
插件名称：手势解锁
本插件封装了手势解锁功能。支持打开设置手势密码页面，设置不符合规范会给出相应提示。亦支持打开一个解锁界面。注意设置手势密码界面和解锁界面都是 open 的一个 window。可以在相应事件的监听里做自己需求的逻辑处理。
打开设置密码页面
gestureCreate
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.ai.gestureCreate({
success: function(res) {
const status = res.evnetType:''//字符串类型；交互事件类型；取值范围：
//back:用户点击返回按钮
//complete:用户设置完成手势密码
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取手势密码
gesture Password
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.ai.gesturePassword({
success: function(res) {
const status = res.status, //布尔类型 true|false
const password = password:'' //字符串类型；当前设置的手势密码
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
清空设置的手势密码
gesture Delete
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.ai.gestureDelete({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开验证手势密码视图
gesture Validate
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
track
boolean
true
否
是否显示手势轨迹
user
obj
否
用户信息，不传则不显示(仅支持iOS)
user数据结构
字段
类型
默认值
必填
说明
avatar
string
否
头像地址，不传显示默认头像
name
string
否
用户名，不传则不显示
示例
mtl.ai.gestureValidate({
track: true,
user:{
avatar:'',
name:''
}
success: function(res) {
const evnetType = res.evnetType:'' //字符串类型；交互事件类型；取值范围：
//back:用户点击返回按钮
//error:用户设置四次密码均错误
//other:用户点击其他账号登陆按钮 （暂仅支持iOS）
//forget:用户点击忘记密码按钮
//notSet:尚未设置手势密码
//success:尚未设置手势密码
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 选人
<!-- source: /docs/Client-API/MTL/xuanren -->

选人
选人、选员工
selectContacts （mtl-js-sdk 5.5.33 版本以上）
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
名称
类型
必填
说明
说明
success
function
是
无
回调函数
tenantId
String
否
无
租户id
tenantName
String
否
无
租户名称
yhtToken
String
否
无
友互通token
wbAt
String
否
无
wb_at
fail
function
否
无
回调
baseUrl
String
否
默认获取当前环境局
联系人baseurl
maxCount
Int
否
100
最大选人数
navTitle
String
否
选择联系人
导航标题
lang
string
否
多语言
默认简体中文
hiddenNav
bool
否
隐藏导航栏
默认不隐藏
selectUserNumber
int
否
已选择的人员个数
默认0
selectUserList
arry
否
已选择的人员列表
[]
selectDeptList
arry
否
已选择的部门及人员列表
[]
multiple
bool
否
true
单选/多选;默认多选
filterList
array
否
无
根据范围选择人员
isemployee
String
否
不传递或者传递""的时候，调用人员页面， 传递 isemployee: "isemployee", 调用员工页面
选择员工还是人员
示例
加载js
FILE_PATH = 'selectcontacts/mobile.contacts.min.js'
日常：https://mdf-mobile-daily.yyuap.com/runtime-mobile/{FILE_PATH}
预发：https://mdf-mobile-runtime-pre.diwork.com/runtime-mobile/{FILE_PATH}
正式：https://mdf-mobile-runtime.diwork.com/runtime-mobile/{FILE_PATH}
环境地址说明 环境+FILE_PATH
已内置日常（DAILY_URL）、预发（PRE_URL）、生产（DIWORK_URL）。
其他专属化自己拼接 （环境+FILE_PATH）
var url = mtl.contacts.DAILY_URL;
mtl.contacts.init({
url, success: () => {
console.log("success->", window.selectContacts)
}
})
选人调用api
mtl.contacts.selectContacts({
baseUrl: 'https://build.yyuap.com',
success: function callBack(res) {
console.log('callBack: ', res)
},
maxCount: 200,
})
选员工调用api
mtl.contacts.selectPersonnel({
baseUrl: 'https://build.yyuap.com',
success: function callBack(res) {
console.log('callBack: ', res)
},
maxCount: 200,
})
使用：
mtl.contacts.init({
url, success: () => {
console.log("success->", window.selectContacts)
mtl.contacts.selectContacts({ // 只传递回调函数
success: function callBack(res) {
console.log('callBack: ', res)
},
maxCount: 200,
filterList: ["87e551be-0037-4bfd-ad38-8fbb6ca974cc","891e5335-04e9-45e7-9914-e467f05ac153"],
})
}
})
第三方调用:
// 需要在打开选人组件之前存储 key_mobile_app_url 到mtl
const mobileAppUrl = "https://yonbip.diwork.com/iuap-yonbuilder-mobile" // 生产环境地址
mtl.setStorage({ key: "key_mobile_app_url", data: mobileAppUrl })
返回格式
{
code: 0,
data: {
selectUserNumber: 0, // 选择的人员总数
selectUserList: [{ // 勾选的人员个数，每一个人员为一个对象
"yhtUserId": "70d4e960-389b-433e-b74c-30e8f766b0a1",
"userName": "z0080",
"avatar": null,
"orgName": "cc1234",
"deptName": "财务部",
"deptId": "2167854006456576",
"positionDutyName": null,
"mobile": "13423230079",
"checked": true
}],
selectDeptList: [{ // 勾选的部门/组织,如果改组织下面有人员，会有users该数组，且数组中是该部门（及下级）的所有人员
"deptId": "2177968263483648",
"deptName": "0304组织部门1",
"type": 2,
"haveSub": false,
"number": 0,
"orgName": "新增组织1",
"textMap": {
"zh_TW": "繁体-繁体",
"en_US": "0304组织部门1",
"zh_CN": "0304组织部门1",
"fr_FR": ""
},
"checked": true,
users: [{
"yhtUserId": "70d4e960-389b-433e-b74c-30e8f766b0a1",
"userName": "z0080",
"avatar": null,
"orgName": "cc1234",
"deptName": "财务部",
"deptId": "2167854006456576",
"positionDutyName": null,
"mobile": "13423230079",
"checked": true
}]
}]
}
}
参数说明
名称
类型
说明
code
Int
0 成功
message
String
描述
data
Object
正确返回数据格式
selectUserList
名称
类型
说明
code
Int
0 成功
message
String
描述
data
Object
正确返回数据格式
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 用户插件
<!-- source: /docs/Client-API/MTL/yonghuchajian -->

用户插件
设置语言
setExclusiveLanguage
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
language
int
0
是
多语言类别： 0:跟随系统， 1:英文， 2:简体， 3:繁体
示例
mtl.setExclusiveLanguage({
language: 0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取应用加载本地H5路径
getExclusiveAppH5LocationPath
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
path
string
应用加载本地H5路径
示例
mtl.getExclusiveAppH5LocationPath({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取认证code---调用接口
getExclusiveCode
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
code
string
认证code
示例
mtl.getExclusiveCode({
success: function(res) {
// 成功回调
var code = res.code;
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
保存友互通信息---保存到请求头
saveExclusiveYhtInfo
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
yht_access_token
sting
无
是
当前用户友互通长token
wb_at
sting
无
是
单点认证凭证
示例
mtl.saveExclusiveYhtInfo({
yht_access_token: '',
wb_at:'',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
保存用户基本信息---保存到本地
saveExclusiveUserInfo
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
userId
sting
无
是
用户唯一标识符
tenantId
sting
无
是
用户当前租户id
示例
mtl.saveExclusiveYhtToken({
userId: '',
tenantId:'',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
保存接口域名信息---保存到本地
saveExclusiveDomain
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
domain
sting
无
是
接口请求域名
示例
mtl.saveExclusiveDomain({
domain: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
当前空间是否预加载MDF应用
isExclusivePreloadMDF
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
isPreload
sting
否
是
是否预加载mdf应用
mdfUrl
sting
无
否
mdf应用预加载的URL
示例
mtl.isExclusivePreloadMDF({
isPreload: '',
mdfUrl: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 界面组件
<!-- source: /docs/Client-API/MTL/jiemianzujian -->

界面组件
导航栏配置
setNavBar (6.0.0及以上)
settingNavBar (即将废弃)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
hide
int
0
否
是否隐藏导航栏，1隐藏 0 不隐藏，【iOS需要注意修改的是全局导航，遵循谁修改谁负责还原】
backgroundColor
string
否
导航条背景色
tintColor
string
否
导航栏上按钮、标题等的颜色统一设置
fullScreen
number
0
否
是否调整webview内边距(仅iOS)
hideShadowImage
number
0
否
是否显示导航栏底部线(仅iOS)
statusBarStyle
number
0
否
状态栏样式(仅iOS)
leftItems
array.
否
导航栏左边的菜单项
centerItems
array.
否
导航栏中间的菜单项
rightItems
array.
否
导航栏右边的菜单项
leftItems、centerItems、rightItems的内部结构字段说明
名称
类型
默认值
必填
说明
title
string
否
按钮文字
subTitle
string
否
副标题
titleColor
string
tintColor颜色
否
文字颜色
subTitleColor
string
tintColor颜色
否
副标题颜色
fontSize
number
1
否
字体大小类型（0：小 1：中 2：大）
iconColor
string
tintColor颜色
否
按钮颜色
titlePosition
number
0
否
文字与图片位置（iOS：仅值为0或1时可同时配置副标题）
icon
string
否
按钮图片
callback
string
否
菜单项回调 （为空不需要回调）
入参说明
参数
类型
说明
backgroundColor
string
颜色需要6位16进制格式（例如：#ffffff)
tintColor
string
颜色需要6位16进制格式（例如：#ffffff)
fullScreen
number
0调整webview内边距，1关闭调整webview内边距属性
hideShadowImage
number
导航栏底部线：0:显示 1:不显示 (仅iOS)
statusBarStyle
number
状态栏样式：0:黑色 1:白色
参数
类型
说明
titleColor
string
颜色需要6位16进制格式（例如：#ffffff)
iconColor
string
颜色需要6位16进制格式（例如：#ffffff)
titlePosition
number
文字与图片同时存在，0:文字在icon右边 1:文字在icon左边
icon
string
若是网络图片，需要传背景透明的图片，否则图片整体会为灰色
示例
mtl.setNavBar({
hide: 0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取原生导航信息
getNavBarInfo
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
成功回调返回
字段
类型
说明
isNativeNavBar
bool
false 否， true 是
height
number
导航高度
示例
mtl.getNavBarInfo({
success: function(res) {
// 成功回调
var isNativeNavBar = res.isNativeNavBar;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
信息提示框
showToast
注：android系统只支持固定的长提示（3.5s）和短提示（2s）两种。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
content
string
是
需要显示的文本内容
duration
number
否
显示时长
示例
mtl.showToast({
content: '文本',
duration: 2,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
警告框
showAlert
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
type
string
否
弹窗类型。
|
| title | string | 否 | alert框的标题 |
| content | string | 是 | alert框的内容 |
| confirmButtonText | string | 否 | 左侧按钮的文字 |
| cancelButtonText | string | 否 | 右侧按钮的文字 |
type参数说明
值
说明
alert
只有一个按钮的弹窗，只显示confirmButtonText（cancelButtonText不用传参）
confirm
显示两个按钮的弹窗，左侧按钮文本：confirmButtonText
右侧按钮文本：cancelButtonText
成功回调返回
字段
类型
说明
selectButton
string
点击 confirm 返回 "confirm"，点击 cancel 返回"cancel"
示例
mtl.showAlert({
type: 'alert',
title: '温馨提示',
content:'消息已发出',
confirmButtonText: '我知道了',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开新的浏览窗体
navigateTo
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
是
新浏览器窗体加载的url
orientation
number
否
0 强制竖屏; 1 跟随系统; 2 强制横屏(微信不支持)
navShow
number
否
0：不显示顶部导航栏 1：显示顶部导航栏(微信不支持)，默认1
title
sting
否
导航标题(微信不支持)
示例
mtl.navigateTo({
url: 'https://www.***.com',
orientation: 1,
navShow:0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
关闭当前浏览窗体
navigateBack
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.navigateBack({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开新的浏览窗体，并关闭当前页面
redirectTo
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
默认
说明
url
string
是
新浏览器窗体加载的url
orientation
number
否
1
0 强制竖屏; 1 跟随系统; 2 强制横屏(微信不支持)
isClearCookie
number
否
0
是否清除cookie。0 否；1 是(微信不支持)
navShow
number
否
1
0：不显示顶部导航栏 1：显示顶部导航栏(微信不支持)
title
sting
否
导航标题(微信不支持)
示例
mtl.redirectTo({
url: 'https://www.***.com',
orientation: 1,
navShow:0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开新的浏览窗体，关闭前面所有页面
reLaunch
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
默认
说明
url
string
是
新浏览器窗体加载的url
orientation
number
否
1
0 强制竖屏; 1 跟随系统; 2 强制横屏(微信不支持)
isClearCookie
number
否
0
是否清楚cookie。0 否；1 是(微信不支持)
navShow
number
否
1
0：不显示顶部导航栏 1：显示顶部导航栏(微信不支持)
title
sting
否
导航标题(微信不支持)
示例
mtl.reLaunch({
url: 'https://www.***.com',
orientation: 1,
navShow:0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
当前页面打开url
webviewLoadUrl
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
url
sting
无
是
接口请求域名
示例
mtl.webviewLoadUrl({
url: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开应用
openExclusiveApp
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
appletExtId
sting
无
否
小程序与MDF小程序资源包id
appletVersion
sting
无
否
小程序与MDF小程序资源包版本号
extId
sting
无
否
gzip资源包id
gzipVersion
sting
无
否
gzip资源包版本号
serviceCode
sting
无
是
应用编码
app_type
int
无
是
应用类型
serviceIcon
sting
无
是
应用icon
serviceName
sting
无
是
应用名
tenantId
sting
无
是
要打开应用所在的租户id
serviceId
sting
无
是
应用唯一标识符
appUrl
sting
无
是
应用打开URL
appletPackageType
sting
无
是
应用类型
packageType
sting
无
是
应用类型
appletUrl
sting
无
否
小程序拼接URL
navShow
sting
无
否
是否显示导航栏，1显示，2不显示
supportHorizontal
int
无
否
横竖屏，0竖屏，1横竖屏均支持，2横屏
tintColor
sting
无
否
导航条颜色
titleColor
sting
无
否
导航条字体颜色
statusBarStyle
int
无
0
状态栏颜色
isbrowser
sting
无
否
是否使用外部浏览器打开
微信仅支持 appUrl
示例
mtl.openExclusiveApp({
appletExtId: '',
...
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取字体大小
getUserFontSize
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
默认值
说明
level
int
1
字体大小
0:移动端字体14；1:移动端字体16；2:移动端字体18；
3:移动端字体20；4:移动端字体22；5:移动端字体24
示例
mtl.getUserFontSize({
success: function(res) {
// 成功回调
ver level = res.level
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设置字体大小
setUserFontSize
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
默认值
说明
level
int
1
字体大小
0:移动端字体14；1:移动端字体16；2:移动端字体18；
3:移动端字体20；4:移动端字体22；5:移动端字体24
示例
mtl.setUserFontSize({
level: 1,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
webView配置
configureWebView
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
pullDownRefresh
bool
否
是否开启下拉刷新
pullUpRefresh
bool
否
是否开启上拉刷新|
scrollViewBounces
bool
否
是否允许WebView弹簧效果，true允许，false不允许，如果设置了上拉或下拉，则强制允许（友空间iOS特有，友空间7.0.5及以上版本）
示例
mtl.configureWebView({
pullDownRefresh: false,
pullUpRefresh: false,
scrollViewBounces: false,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 小友
<!-- source: /docs/Client-API/MTL/xiaoyou -->

小友
mtl支持版本6.0.11及以上
插件名称：小友
初始化
initXiaoYou
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
默认值
说明
bodyDomainId
string
是
body中的领域区分标识
tenantid
string
是
租户ID
domain
string
是
VPA服务地址
token
string
是
VPA机器人token
robotid
string
否
机器人ID，指定意图
userid
string
是
用户ID
yhtAccessToken
string
是
友互通token
domainid
string
是
yonapppro
极速版APP标识
robotVersion
string
否
v2
机器人版本
isDialog
boolean
否
false
是否半屏显示
locale
string
否
zh_cn
语种
sessionid
string
否
会话id
msgtype
string
否
text
消息类型
devicetype
string
否
app
设备类型
location
obj
否
null
用户所处位置说明
type
number
否
0
showModel
boolean
否
true
是否移动端适配的卡片格式返回数据
testFlag
boolean
否
false
标记是否是测试状态
isShowInputBox
boolean
否
true
是否使用输入框
isShowHelpBox
boolean
否
true
是否显示帮助入口
bosTime
number
否
3000
静音超时时间（1--10000ms）
eosTime
number
否
1000
停止说话检测时间（1--10000ms）
示例
mtl.vui.initXiaoYou({
domain: '',
domainid: '',
...
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开小友页面
openXiaoYou
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
registerCallback
function
是
数据回调方法
callbackName
stirng
是
方法名称
注意： 6.0.6及以上去掉改registerCallback和callbackName, 数据会在success返回。
示例
mtl.vui.openXiaoYou({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
关闭小友页面
closeXY
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.vui.closeXY({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 语音能力
<!-- source: /docs/Client-API/MTL/yuyin -->

语音能力
语音播报
startSpeechSyn
语音合成
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
text
string
是
合成内容
示例
mtl.startSpeechSyn({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
停止语音播报
stopSpeechSyn
停止语音合成
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.stopSpeechSyn({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
语音文件转文字
translateVoice
语音文件转文字
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
localId
string
是
需要播放的音频的字符串，由 stopRecord 接口获得
isShowProgressTips
number
否
默认1。1显示加载框，0 不显示加载框。
成功回调返回
字段
类型
说明
translateResult
string
识别返回的文字
示例
mtl.translateVoice({
success: function(res) {
var translateResult = res.translateResult;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
语音转文字
voiceToText
语音转文字，带录音UI。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
成功回调返回
字段
类型
说明
text
string
识别返回的文字
示例
mtl.voiceToText({
success: function(res) {
var text = res.text;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## OCR
<!-- source: /docs/Client-API/MTL/OCR -->

OCR
mtl支持版本6.0.11及以上
OCR 接口调用 APILINK 的API，需要用户自己到平台上申请 appCode。
发票
scanInvoice
打开相机拍摄发票并返回识别结果（APILINK所选择服务名称： 增值税发票识别OCRV2 ）
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
示例
mtl.scanInvoice({
appCode: "",
success: function(res) {
var result = res.data; // 返回识别结果
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
返回数据格式
{
"发票代码": "032001500XXX",
"发票号码": "25272XXX",
"开票日期": "2017年XX月XX日",
"校验码": "15922733756000XXXXXX",
"发票金额": "XXX.00",
"发票税额": "XXX.43",
"不含税金额": "XXX.57",
"受票方名称": "XXX",
"受票方税号": "XXXX",
"受票方地址、电话": "XXX",
"受票方开户行、账号": "XXX",
"销售方名称": "XXX",
"销售方税号": "913201043023368XXX",
"销售方地址、电话": "XXX",
"销售方开户行、账号": "XXX"
}
recognizeInvoice
配合[图像接口]( https://mtldev.yuque.com/docs/share/3427a90b-57f0-4f77-b556-2575c3a07a44?# 《多媒体》)使用，直接识别已选择(或下载)的图片。
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
image
string
是
图片，支持 localId/base64
示例
mtl.recognizeInvoice({
appCode: "",
image: "",
success: function(res) {
var result = res.data; // 返回识别结果，同 scanInvoice
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
身份证
scanIDCard
打开相机扫描身份证并返回识别结果 （APILINK所选择服务名称： 身份证OCRV2 ）
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
side
string
是
身份证正反面；face/back
示例
mtl.scanIDCard({
appCode: "",
side: "face",
success: function(res) {
var result = res.data;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
返回的数据格式
{
address: "浙江省杭州市余杭区文一西路969号", // 地址信息
config_str: '{"side":"face"}', // 配置信息，同输入configure
face_rect: {
// 人脸位置
angle: -90, // angle 表示矩形顺时针旋转的度数
center: {
// center 表示人脸矩形中心坐标
x: 952,
y: 325.5
},
size: {
// size表示人脸矩形长宽
height: 181.99,
width: 164.99
}
},
face_rect_vertices: [
// 人脸位置，四个顶点表示
{
x: 1024.6600341796875,
y: 336.629638671875
},
{
x: 906.66107177734375,
y: 336.14801025390625
},
{
x: 907.1590576171875,
y: 214.1490478515625
},
{
x: 1025.157958984375,
y: 214.63067626953125
}
],
name: "张三", // 姓名
nationality: "汉", // 民族
num: "1234567890", // 身份证号
sex: "男", // 性别
birth: "20000101", // 出生日期
nationality: "汉", // 民族
success: true // 识别结果，true表示成功，false表示失败
};
{
config_str: '{"side":"back"}', // 配置信息，同输入configure
start_date: "19700101", // 有效期起始时间
end_date: "19800101", // 有效期结束时间
issue: "杭州市公安局", // 签发机关
success: true // 识别结果，true表示成功，false表示失败
}
recognizeIDCard
配合[图像接口]( https://mtldev.yuque.com/docs/share/3427a90b-57f0-4f77-b556-2575c3a07a44?# 《多媒体》)使用，直接识别已选择(或下载)的图片。
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
side
string
是
身份证正反面；face/back
image
string
是
图片，支持 localId/base64
示例
mtl.recognizeIDCard({
appCode: "",
image: "",
side: "",
success: function(res) {
var result = res.data; // 返回识别结果，同上
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
银行卡
scanBankCard
打开相机扫描银行卡并返回识别结果 （APILINK所选择服务名称： 银行卡识别OCRV2 ）
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
示例
mtl.scanBankCard({
appCode: "",
success: function(res) {
var result = res.data; // 返回识别结果
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
返回数据格式
{
"card_num" : "1234567890123456", // 银行卡卡号，可能为空
"request_id" : "2017...b865d2973", // 请求唯一标识，用于错误追踪
"success" : true // 识别成功与否 true/false
}
recognizeBankCard
配合[图像接口]( https://mtldev.yuque.com/docs/share/3427a90b-57f0-4f77-b556-2575c3a07a44?# 《多媒体》)使用，直接识别已选择(或下载)的图片。
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
appCode
string
是
apiLink申请的 appcode
image
string
是
图片，支持 localId/base64
示例
mtl.recognizeBankCard({
appCode: "",
image: "",
success: function(res) {
var result = res.data; // 返回识别结果，同上
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 其他
<!-- source: /docs/Client-API/MTL/qita -->

其他
获取状态栏高度
getStatusBarHeight
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
statusBarHeight
float
状态栏高度
safeAreaBottom
float
底部安全区域高度
示例
mtl.getStatusBarHeight({
success: function(res) {
res.statusBarHeight
res.safeAreaBottom
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
状态栏配置
setStatusBar
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
isScreenEdge
string
否
“1”：通栏 “0” :不通栏
isStatusBarDefault
string
否
“1”：默认样式 “0” :高亮
示例
mtl.setStatusBar({
isScreenEdge: '1',
isStatusBarDefault：'1',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
长按手势
switchLongPress
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
enabled
int
0
是
0-禁用长按事件 1-启用长按事件
示例
mtl.switchLongPress({
enabled: 0,
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设置cookie
setCookie
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
url
stirng
是
需要注入cookie的地址
cookie
stirng
是
cookie数据
示例
mtl.setCookie({
url: 'xxx',
cookie: 'a=b;key=value',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
申请隐私权限
requestPermission(6.0.11及以上)
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
list
array
是
需要申请权限数组
权限列表
camera
相机/拍照/录像
contacts
联系人读取/写入
contacts-r
仅联系人读取。iOS中等同于contacts
contacts-w
仅联系人写入。iOS中等同于contacts
microphone
使用麦克风录制音频
photos
访问相册|本地存储空间。Android上等同于storage
photos-w
仅写入相册|本地存储空间。Android上等同于storage-w
location
定位
locationAlways
后台定位，只支持iOS
locationFullAccuracy
临时精确定位，请求时需传入purposeKey参数，申请的临时精确定位只在App生命周期内有效。注意：仅当location、locationAlways权限返回的reducedAccuracy字段为true时才请求临时精确定位，若用户继续选择关闭精确定位时回调方法不会被执行，所以此权限应和其它权限分开进行请求。只支持iOS 14及以上系统
notification
状态栏通知
calendar
日历读取/写入。只支持Android
calendar-r
仅日历读取
calendar-w
仅日历写入
phone
直接拨打电话/获取手机号码|IMEI。只支持Android
phone-call
仅直接拨打电话
phone-r
仅获取手机号码|IMEI
phone-r-log
读取通话记录
phone-w-log
写入通话记录
sensor
传感器.只支持Android
sms
读取短信/后台发送短信。只支持Android
sms-s
仅后台发送短信
sms-r
仅读取短信
storage
读取/写入|相册|多媒体|本地存储空间。只支持Android
storage-r
仅读取|相册|多媒体|文件|本地存储空间
storage-w
仅写入|相册|多媒体|文件|本地存储空间
示例
mtl.requestPermission({
list: ['camera', 'photos'],
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
调用mtl未封装api
execPluginBridge(6.0.0及以上)
execUpesnBridge(即将取消)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
method
stirng
是
方法名称
requireName
stirng
否
需要加载插件名称
...
调用方法需要额外参数
示例
mtl.execPluginBridge({
method: 'xxx',
requireName: 'yyy',
xxx: 'xxx',
xxx1: 'xxx1',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
调用mtl未封装同步api
execPluginSyncBridge
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
method
stirng
是
方法名称
requireName
stirng
否
需要加载插件名称
...
调用方法需要额外参数
示例
mtl.execPluginSyncBridge({
method: 'xxx',
requireName: 'yyy',
xxx: 'xxx',
xxx1: 'xxx1',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
连接RFID设备，并监听标签数据
rfidConnect (6.0.6及以后)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✘
✘
参数
字段
类型
必填
说明
callback
function
是
监听事件回调
示例
mtl.rfidConnect({
callback: function(res) {
},
success: function(res) {
var result = res;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
断开连接RFID设备，并监听标签数据
rfidDisconnect (6.0.6及以后)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✘
✘
参数
-无-
示例
mtl.rfidDisconnect({
success: function(res) {
var result = res;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 阿里支付
<!-- source: /docs/Client-API/MTL/zhifu -->

阿里支付
阿里支付
alipayPayment
**需要选择插件： **支付宝支付
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
parameters
obj
是
包含支付信息，后台生成，包含参数orderInfo(支付的详细信息)
示例
mtl.pay.alipayPayment({
parameters: {orderInfo: ''},
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
微信支付
wxpayPayment
**需要选择插件： **微信支付
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
parameters
obj
是
包含支付信息，后台生成(支付的详细信息)
示例
mtl.pay.wxpayPayment({
parameters: {},
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## IM功能
<!-- source: /docs/Client-API/MTL/IM -->

IM功能
mtl支持版本6.0.11及以上
插件名称：IM聊天
添加插件所需参数
字段
类型
必填
说明
APP_ID
string
是
应用ID
ETP_ID
string
是
租户ID
server
string
是
长链接地址
restServer
string
是
短链接地址
resourceUploadServer
string
否
资源上传服务地址
resourceDownloadServer
string
否
资源下载服务地址
serverPort
number
是
服务器端口
serverSSLPort
number
是
SSL端口
serverHttps
string
否
默认http。https, http
serverEnableSSL
boolean
否
是否开启SSL端口，默认true
注意：该插件依赖于地图插件<高德地图(带界面)>
登陆
loginIM
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
userId
string
是
用户ID
paswword
string
是
密码
imToken
sting
是
token
expiration
string
是
token过期时间
**示例 ** <数据格式>
mtl.im.loginIM({
userId: '',
paswword: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
退出
logoutIM
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
**示例 ** <数据格式>
mtl.im.logoutIM({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开聊天页面
openChat
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
聊天ID
chatType
string
是
单聊或群聊。chat、groupchat
messagePid
string
否
搜索时需要此参数
bundle
obj
是
头像跳转和设置跳转的数据类
{
avatar:'xxxx', //跳转时需要传chatId
setting: 'xxxx' //跳转时需要传chatId和chatType
}
**示例 ** <数据格式>
mtl.im.openChat({
chatId:'xxx',
chatType: 'chat';
success: function(res) {
// 成功回调
...
const data = res.data,
const action = res.action,// setting设置页面、forward转发、avatar头像
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取消息未读书
getUnreadMsgCount
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
**示例 ** <数据格式>
mtl.im.getUnreadMsgCount({
success: function(res) {
// 成功回调
const count = res.count
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取消息列表
getRecentMessage
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
**示例 ** <数据格式>
mtl.im.getRecentMessage({
success: function(res) {// 数组列表
// 成功回调
const list = res.list
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取更新消息
getReceiveMessage
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
**示例 ** <数据格式>
mtl.im.getReceiveMessage({
success: function(res) {// 消息对象
// 成功回调
const data = res.data;
const count = data.count;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
搜索人员、群组和消息
doSearch
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
默认值
说明
text
string
是
搜索内容
searchType
int
是
3
搜索类型。1: 消息搜索；2:群组搜索；3:消息+群组搜索；
类型为3时，超过三条数据只返回三条数据， loadMore:true
chatId
string
否
消息ID。 (在此消息内搜索聊天内容)
**示例 ** <数据格式>
mtl.im.doSearch({
text: "123",
searchType: 3,
success: function(res) {// 消息对象
// 成功回调
const data = res.data;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
创建群聊
createChatGroup
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
groupName
string
是
群组名称
userIds
obj
是
群组人员(用户ID列表)
groupPhoto
string
否
群头像 base64格式
**示例 ** <数据格式>
mtl.im.createChatGroup({
groupName：'ssss',
userIds:['userids','userids1'],
success: function(res) {
// 成功回调
const chatid = res.data.chatId
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取全部群成员
getGroupMembers
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
默认值
说明
chatId
string
是
群组ID
limit
int
否
0
指定个数(默认全部)
示例 ** <数据格式>**
mtl.im.getGroupMembers({
chatId：'ssss',
limit:10,
success: function(res) {
// 成功回调。
const data = res.data
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
修改群名称
renameChatGroupName
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
groupName
string
是
群组名称
示例 ** <数据格式>**
mtl.im.renameChatGroupName({
chatId：'ssss',
groupName:'123',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设置群公告
modifyChatGroupAnnounce
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
announce
string
是
公告内容
示例 ** <数据格式>**
mtl.im.modifyChatGroupAnnounce({
chatId：'ssss',
announce:'123',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
添加群成员
inviteRosterIntoChatGroup
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
userIds
obj
是
人员(用户ID列表)
示例 ** <数据格式>**
mtl.im.inviteRosterIntoChatGroup({
chatId：'ssss',
userIds:['123','234'],
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
删除群成员
kickGroupMember
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
userIds
obj
是
人员(用户ID列表)
示例 ** <数据格式>**
mtl.im.kickGroupMember({
chatId：'ssss',
userIds:['123','234'],
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
删除并退出群聊
leaveChatGroup
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
**示例 ** <数据格式>
mtl.im.leaveChatGroup({
chatId：'ssss',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
转让群组
changeChatGroupAdmin
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
userId
string
是
人员(用户ID)
示例 ** <数据格式>**
mtl.im.changeChatGroupAdmin({
chatId：'ssss',
userId:'123',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
解散群组
dismissChatGroup
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
群组ID
**示例 ** <数据格式>
mtl.im.dismissChatGroup({
chatId：'ssss',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
消息置顶
updateStickTop
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
聊天ID
chatType
string
是
单聊或群聊。chat、groupchat
stickTop
boolean
是
是否置顶
**示例 ** <数据格式>
mtl.im.updateStickTop({
chatId：'ssss',
chatType：'chat',
stickTop：true,
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
消息免打扰
updateNoDisturb
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
聊天ID
chatType
string
是
单聊或群聊。chat、groupchat
noDisturb
boolean
是
是否免打扰
示例 ** <数据格式>**
mtl.im.updateNoDisturb({
chatId：'ssss',
chatType：'chat',
noDisturb：true,
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
删除消息
deleteMessage
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
聊天ID
chatType
string
是
单聊或群聊。chat、groupchat
示例 ** <数据格式>**
mtl.im.deleteMessage({
chatId：'ssss',
chatType：'chat',
success: function(res) {
// 成功回调。
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
转发消息
forwardMessage
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
聊天ID
chatType
string
是
单聊或群聊。chat、groupchat
messagePid
string
是
消息ID
**示例 ** <数据格式>
mtl.im.forwardMessage({
chatId:'',
chatType:'caht',
pid:'',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取用户、群组信息
getContactInfo
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
chatId
string
是
用户、群组ID
chatType
string
是
单聊或群聊。chat、groupchat
**示例 ** <数据格式>
mtl.im.getContactInfo({
chatId:'',
chatType:'',
success: function(res) {
// 成功回调
...
const group = res.data
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 扫码
<!-- source: /docs/Client-API/MTL/saoma -->

扫码
二维码扫码
注意：
微信扫描二维码，点击取消会进入成功回调，返回 undefined。
scanQRCode
调起扫一扫
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
scanType
string[]
否
可以指定扫二维码还是条形码，可选值为 qrCode 和 barCode，默认二维码['qrCode']。
needResult
number
否
默认为0，扫描结果由端上处理，1则直接返回扫描结果。
返回参数说明
字段
类型
必填
说明
resultStr
string
否
扫描数据
示例
mtl.scanQRCode({
scanType: ["qrCode", "barCode"],
needResult: 1,
success: function(res) {
var result = res.resultStr;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
生成二维码
generateQRCode
生成二维码
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
str
string
是
用于生成二维码的字符串
size
string
否
生成图片大小，默认 100 * 100
返回参数说明
字段
类型
必填
说明
imgSrc
string
是
二维码图片
示例
mtl.generateQRCode({
str: "", // 用于生成二维码的字符串
size: 200, // 生成图片大小，默认 100 * 100
success: function(res) {
// imgSrc 为 base64 字符串
var src = res.imgSrc;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
自定义扫描
customScanQRCode
调用扫一扫功能，对二维码或者条码进行扫描。(友空间5.18.0及以上版本)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
type
number
1
否
扫描方式
0: 单次，扫描出结果后自动关闭页面
1: 连续，扫描出结果后不自动关闭页面
url
string
是
扫码页面内部扫描结果浏览器的网址
callback
string
是
扫描完成后的回调方法名 注册方式
customNavi
number
否
1: 自定义导航 0: 默认导航
leftItems
array[object]
否
导航栏左边的菜单项 (点击默认关闭页面)
rightItems
array[object]
否
导航栏右边的菜单项
centerItems
array[object]
否
导航栏中间的菜单项
leftItems内部结构字段说明
名称
类型
默认值
必填
说明
title
string
是
按钮文字
callback
string
否
菜单项回调 注册方式
点击后自动关闭页面。
centerItems内部结构字段说明
名称
类型
默认值
必填
说明
title
string
是
按钮文字
rightItems内部结构字段说明**
名称
类型
默认值
必填
说明
title
string
是
按钮文字
callback
string
否
菜单项回调 注册方式
isClose
number
0
否
0: 点击菜单项不关闭页面
1: 点击菜单项关闭页面
isClose生效必须调用callback
注意
url页面需要 注册按钮事件和扫描回调事件，用于接收事件回调。
必填：
typeof responseCallback === 'function' && responseCallback({name:'FromJS name'})
按钮事件和扫描事件调用试例：
mtl.registerCommonCallback("scanResultCallback", function(res,responseCallback) {
// res 为返回数据 responseCallback原生回调
console.log("scanResultCallback：",JSON.stringify(res));
// 必填
//要使连续扫码生效，必须调用callback原生回调，原生会发起下一次扫码。
//要使isClose生效，必须调用callback原生回调，原生会判断是否关闭页面。
typeof responseCallback === 'function' && responseCallback({msg:'FromJS scanResultCallback'});
});
返回参数
字段
说明
qrString
识别结果
示例
mtl.customScanQRCode({
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
mdf悬浮扫描
suspendScanQRCode (6.0.0及以上)
webViewCustomScanQRCode(mtl支持版本5.5.63)(即将废弃)
调用扫一扫功能，对二维码或者条码进行扫描，可定制扫描框的位置和大小。
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
type
number
1
否
扫描方式
0: 单次，扫描出结果后自动关闭页面
1: 连续，扫描出结果后不自动关闭页面
hide
number
0
否
是否隐藏悬浮扫描框 0:显示 1:隐藏
callback
function
是
扫描结果的回调方法
scanLeftRatio
number
0
否
扫描框左边与屏幕左边的间距占屏幕宽度的比例，范围[0,1]
scanTopRatio
number
0.1
否
扫描框顶部与屏幕顶部的间距占屏幕高度的比例，范围[0,1]
scanWidthRatio
number
1
否
扫描框宽度占屏幕宽度的比例，范围(0, 1]
scanHeightRatio
number
0.4
否
扫描框高度占屏幕高度的比例，范围[0, 1]
返回参数
字段
说明
qrString
识别结果
示例
mtl.suspendScanQRCode({
callback：function(res) {
var qrString = res.qrString
},
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## touchID
<!-- source: /docs/Client-API/MTL/touchID -->

touchID
mtl支持版本6.0.11及以上
插件名称：指纹/面部识别
在苹果某些机型上没有 Touch ID，取而代之的是 Face ID，使用 Face ID 需要在云编译时勾选 Face ID，填写提示语（最好不要少于12字符）申请访问 Face ID 权限。
Android 端注意事项：
(1)Android使用本插件需要支持指纹识别的硬件和Android 6.0 及以上
(2)你的设备必须是使用屏幕锁保护的，这个屏幕锁可以是password，PIN或者图案都行
(3)用户必须首先在setting中注册至少一个指纹才行，否则是不能使用的
(4)指纹识别的失败次数因手机厂商不同可能会不同,当返回失败次数过多,请稍后在尝试时,一段时间是不可以进行指纹识别.
是否支持指纹识别
isValid
当前设备是否支持指纹识别功能
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.ai.isValid({
success: function(res) {
const status = res.status, //布尔类型；是否支持，true|false
const code = res.code, //数字类型:Android在status为false时返回此字段:
取值如下: 1:手机版本不是6.0及以上版本手机不能使用
2:没有指纹识别权限;
3:手机硬件不支持指纹识别
4:没有开启屏幕锁功能请先在手机设置中进行开启
5:普通app要想使用指纹识别功能的话，用户必须首先在手机setting中注册至少一个指纹才行，
否则是不能使用的。所以这里我们需要检查当前系统中是不是已经有注册的指纹信息了
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
验证faceID
verify
弹出验证界面，验证用户指纹(android无UI界面)
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
title
stirng
验证指纹密码
否
验证弹框的标题(安卓不支持此参数)
示例
mtl.ai.verify({
success: function(res) {
const status = res.status, //布尔类型；验证是否支持，true|false
},
fail: function(err) {
var message = err.message; // 错误信息
var code = err.code;//（iOS端本参数废弃，推荐使用errorCode）数字类型；返回验证未通过信息，取值范围如下：
0： //用户选择手动输入(ios)
1： //用户取消验证
2： //验证三次失败
3： //(ios)多次验证失败,(android)多次验证失败 ,请稍后重试,
4： //验证失败，未知错误
5： //用户未开启指纹验证设备
}
});
取消验证
cancelVerify
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✘
参数
-无-
示例
mtl.ai.cancelVerify({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## PDA
<!-- source: /docs/Client-API/MTL/PDA -->

PDA
*需要勾选PDA扫描插件
pda开启扫描监听
startPDAScan
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
必填
说明
callback
string
是
监听事件回调名称
示例
// 注册事件
mtl.registerCommonCallback("pdaStartCallback",
function (res, responseCallback) {
console.log('pad callback ', JSON.stringify(res))
typeof responseCallback === 'function' && responseCallback({msg:'FromJS pdaStartCallback'});
}
);
// mtl调用
mtl.mobile.startPDAScan({
callback: 'pdaStartCallback',
success: function(res) {
var result = res;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
pda停止扫描监听
stopPDAScan
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.mobile.stopPDAScan({
success: function(res) {
var result = res;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
向原生注册JS事件
registerCommonCallback
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
示例
mtl.registerCommonCallback(
'back', // 方法名称 必填
function(res, responseCallback) {// 方法回调
...
}
);
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 数据安全
<!-- source: /docs/Client-API/MTL/shujuanquan -->

数据安全
信息加密
encryptData
对数据进行加密处理
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
data
string
是
需要加密的数据
成功回调返回
字段
类型
说明
result
string
加密后数据
示例
mtl.encryptData({
data:'xxxxxxxx',
success: function(res) {
var result = res.result;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
信息解密
decryptData
对加密数据进行解密处理
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
data
string
是
需要解密的数据
成功回调返回
字段
类型
说明
result
string
解密后数据
示例
mtl.decryptData({
success: function(res) {
var result = res.result;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## VR图片
<!-- source: /docs/Client-API/MTL/VR -->

VR图片
mtl支持版本6.0.11及以上
插件名称：得图全景播放器
打开页面
vrOpen
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
rect
obj
否
页面的位置及长宽
type
string
sphere
否
展示类型。sphere： 360度全景图，video： vr视频
device
number
0
否
播放的资源类型。
0 代表资源是标准的2:1 数据；
11 代表资源是单鱼眼数据——即SphereS 拍摄出来的数据；
2002 代表资源是双鱼眼数据——即twin相机拍摄出来的数据；
path
string
是
要展示的 360 度全景图片、vr视频的路径
gyroEnable
booblean
true
否
陀螺仪是否开启
zoomEnable
booblean
true
否
是否要缩放
fixedOn
string
否
插件视图添加到指定 frame 的名字（ios：只指 frame，传 window 无效）(android可以是frame或者Window，但是在全屏的时候，需要挂在Window上或者frame是全屏)
fixed
booblean
true
否
插件是否随所属 window 或 frame 滚动
showBackBtn
booblean
true
否
是否展示关闭按钮
rect参数
字段
类型
默认值
必填
说明
x
number
0
否
页面 x 坐标（相对于所属的 Window 或 Frame
y
number
0
否
页面y 坐标（相对于所属的 Window 或 Frame）
w
number
屏幕宽度
否
页面宽度（相对于所属的 Window 或 Frame）
h
number
屏幕宽度
否
页面高度（相对于所属的 Window 或 Frame）
示例
mtl.ai.vrOpen({
success: function(res) {
const status = res.status;////数字类型；播放器状态；videoOnStatusChanged返回；
// 0：PLAYING，1：PAUSE，2：STOP，3：FINISH，4：BUFFER_EMPTY
const status = res.evenType:'', //字符串类型；事件类型
//取值取下：
//panoPlayOnEnter：进入场景
//panoPlayOnLoaded：加载结束
//panoPlayOnLoading：加载中
//panoPlayonLeave：离开场景
//videoOnSeekFinished：播放结束
//videoOnPlayerError：视频播放异常
//videoOnStatusChanged：视频播放状态改变
},
fail: function(err) {
var message = err.message; // 错误信息
var code = err.code
}
});
关闭页面
vrClose
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
-无-
示例
mtl.ai.vrClose({
success: function(res) {
const status = res.status, //布尔类型；验证是否支持，true|false
},
fail: function(err) {
var message = err.message; // 错误信息
var code = err.code
}
});
设置模式
vr SetViewMode
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
默认值
必填
说明
mode
number
1
是
模式类型；1:默认模式，2:鱼眼模式，3:小行星模式，4:VR 模式水平，8:VR 模式竖直 9:平面模式
示例
mtl.ai.vrSetViewMode({
mode: 1,
success: function(res) {
const status = res.status, //布尔类型；验证是否支持，true|false
},
fail: function(err) {
var message = err.message; // 错误信息
var code = err.code
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 数据处理
<!-- source: /docs/Client-API/MTL/shujuchuli -->

数据处理
存储数据
注意：
目前其它端 mtl.getStorage 值为空时返回 null，友空间上走 fail 回调
setStorage
存储缓存数据
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
domain
string
否
缺省时使用默认的域
key
string
是
存储数据用的 key
data
any
是
存储的数据，支持 number、string、及能够通过 JSON.stringify 序列化的对象。
示例
mtl.setStorage({
domain: "a",
key: "key",
data: "value",
success: function() {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取数据
getStorage
获取缓存数据
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
domain
string
否
缺省时使用默认的域
key
string
是
存储数据用的 key
返回参数说明
字段
类型
说明
data
string
数据
示例
mtl.getStorage({
domain: "a",
key: "key",
success: function(res) {
var value = res.data; // 没取到值时 value 为 null
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
同步获取数据
getStorageSync
获取缓存数据
支持平台
微信
友空间
安卓
iOS
✔︎
✘
✔︎
✔︎
参数
字段
类型
必填
说明
domain
string
否
缺省时使用默认的域
key
string
是
存储数据用的 key
示例
const result = mtl.getStorageSync({domain: "a",key: "key"});
移除数据
removeStorage
移除缓存数据
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
domain
string
否
缺省时使用默认的域
key
string
是
存储数据用的 key
示例
mtl.removeStorage({
domain: "a",
key: "key",
success: function() {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
清除所有数据
clearStorage
清除所有缓存
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
domain
string
否
缺省时使用默认的域
示例
mtl.clearStorage({
domain: "a",
success: function() {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
DB数据库操作
executeDBOperate
执行数据库操作、建表、增删改查，SQL语句业务方操作。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
executeType
string
是
执行SQL类型
0:建表；1:删表；2:新增数据；3:删除数据；4:更新数据；5:查询数据
executeSql
string
是
执行SQL语句
业务方控制该sql安全性，创建表格要求表名字前缀为NCC_
返回数据说明
字段
类型
说明
data
string
1.建表、删表、增删改：返回为成功失败，data无数据，成功；data有错误码，失败 2.查询，返回数据数组
示例
mtl.executeDBOperate({
'executeType':'5',
'executeSql':'select * form NCC_TABLE_INFO',
success: function() {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 网络能力
<!-- source: /docs/Client-API/MTL/wangluonengli -->

网络能力
网络请求
request
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
是
开发者服务器接口地址
params
object
否
请求参数
headers
Object
否
设置请求的 headers， content-type
默认为 application/json
method
string
否
默认为 GET
paramsType
number
否
请求参数的类型
method的合法值
值
说明
GET
使用GET方式
POST
使用POST方式
paramsType的合法值
值
说明
0
键值对
1
json格式，只支持POST请求，会在header中自动添加content-type:application/json
成功回调返回
字段
类型
说明
status
number
响应码
headers
object
响应头
data
string
响应数据
错误码说明
错误码
说明
400
参数不合法
401
用户无访问权限
500
请求错误
501
服务器错误
1001
无网络
1002
解析错误
1003
用户取消
-1
位置错误
-2
页面超时
示例
mtl.request({
url: "https://some-domain.com/api/user",
method: "GET",
headers: { "X-Requested-With": "XMLHttpRequest" },
params: {
ID: 12345
},
paramsType: 0,
success: function(res) {
var data = res.data; // 返回数据
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
文件上传
uploadFile
文件上传 ， 将本地文件上传到指定服务器。客户端发起一个 HTTPS POST 请求，其中 content-type 为 multipart/form-data 。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
url
string
是
指定服务器地址
filePath
string
是
文件路径
header
Object
否
HTTP 请求 Header
formData
Object
否
HTTP 请求中其他额外的 form data
返回参数说明
参数
类型
说明
data
string
服务器返回的数据
statusCode
number
服务器返回的 HTTP 状态码
示例
mtl.uploadFile({
url: "",
filePath: "",
success: function(res) {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
文件下载
downloadFile
从网络下载到手机本地并返回本地url
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
url
string
是
需要下载资源的url
fileType
string
是
文件格式jpg,txt,pdf等
fileName
string
否
文件名 如abc.jpg等
autoPreview
int
否
是否自动打开预览界面，0不打开，1打开，默认0
header
object
否
http请求头部参数
formBody
object
否
http请求额外body参数-表单形式。
参数非空为post请求，否则为get请求。
jsonBody
string
否
http请求额外参数-json形式
返回参数说明
参数
类型
说明
filePath
string
存储到手机本地的url
示例
mtl.downloadFile({
url: "",
fileType: "",
fileName: "",
autoPreview: 0,
header: {},
formBody: {},
jsonBody: "",
success: function(res) {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 文件
<!-- source: /docs/Client-API/MTL/wenjian -->

文件
打开本地文件
openLocalFile
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
filePath
string
是
文件的本地地址（通过下载文件获取的本地路径）
fileType
string
是
文件格式jpeg,txt,pdf等
返回参数说明
字段
类型
说明
error_code
number
返回的状态码
tip_level
number
提示级别
error_description
string
提示信息
示例
mtl.openLocalFile({
filePath:'/var/mobile/Containers/Data/Caches/e61190ef76c6a7efab37ba85fdfaaf51f3de667b.jpg',
fileType:'jpg',
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选择本地文件
chooseLocalFiles
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
必填
说明
maxNumber
number
否
可以选择文件的最大数量默认是5，不能超过5或者小于等于0，这种情况默认是5个
成功回调返回
字段
类型
说明
localfiles
array
文件描述列表
file参数
字段
类型
说明
fileName
string
文件名称
filePath
string
文件路径
fileSize
long
文件大小
示例
mtl.chooseLocalFiles({
maxNumber:3,
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选取本地文件并上传友空间服务器
chooseLocalFileToServer
选取本地文件，上传到友空间服务器，并返回文件名称、路径、类型等信息。 android：最大可选数为5，所选文件不大于100MB、且不能为空。 IOS：选择iCloud文件，仅支持单选文件，所选文件不大于100MB、且不能为空。（友空间5.19.0及以上版本）
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
参数
类型
说明
files
array
文件描述列表
files内部结构字段说明
参数
类型
说明
fileId
number
文件id
fileName
string
文件名称
filePath
string
文件路径
fileSize
long
文件大小
示例
mtl.chooseLocalFileToServer({
success: function(res) {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
})
{
"data": {
"files": [
{
"fileId": 147813,
"fileName": "65a13e61b00be098e0ce3cf11a23ea55.png",
"filePath": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/1/3274608/201904/23/155598836793295aa4940b600da0102d89fd2f69f5.png",
"fileSize": 8293,
},
{
"fileId": 147814,
"fileName": "一种图元属性定制机制.doc",
"filePath": "http://ykj-esn-test.oss-cn-beijing.aliyuncs.com/17164/3274608/201904/12/1555050649bd86effaced8a184b1779cdabfd7e89d.doc",
"fileSize": 222720,
}
]
}
}
文件预览
previewDoc
提供文件下载url或者文件fid，实现文件的预览，界面可包含下载等功能。(友空间5.18.0及以上版本)
注:
有文件fid传入文件fid，传参参考-参数 1 ；
没有文件fid必须传入下载url，传参参考-参数 2 ；
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✘
✘
参数1（文件有fid）
字段
类型
默认值
必填
说明
fileId
string
是
文件ID
fromType
number
0
否
文件来源
返回参数说明1
参数
类型
说明
fromType
number
0：来自文库，1：IM，2：web，3：项目，4：旧IM，6：公告附件，7：新NC预览，8：任务预览
参数2（文件有下载地址）
字段
类型
默认值
必填
说明
downloadUrl
string
是
文件下载url
fromType
number
5
是
文件来源
fileName
string
是
文件名，且文件名必须带后缀名
needDownload
number
否
是否需要下载按钮
0 不需要，1需要
金格编辑时此参数不起作用
upload_url
string
是
上传的文件服务器地址，只有金格编辑才必须要传此参数。否则不用传
返回参数说明2
参数
类型
说明
fromType
number
5：下载地址预览，9：金格编辑
金格编辑只支持pdf格式
示例
mtl.previewDoc({
// 参数1
fileId: '130423',
fromType: 0,
// 参数2
downloadUrl: 'http://ykj-esn-test.oss-cn-beijing.aliyuncs.com//153437/1/201811/1/1541052859669H.jpg',
fromType: 5,
fileName: '金田一1.jpg',
needDownload: 1,
upload_url: '',
success: function(res) {
// 成功回调
let first = res[0];
let fileName = first.fileName;
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 移动设备能力
<!-- source: /docs/Client-API/MTL/ydshebei -->

移动设备能力
设备信息-获取网络状态
getNetworkType
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
networkType
string
返回网络类型，fail
networkType合法值说明
参数
类型
说明
wifi
string
wifi 网络
2g
string
2g 网络
3g
string
3g 网络
4g
string
4g 网络
wwan
string
无法具体识别的移动网络
unknown
string
Android 下不常见的网络类型
none
string
无网络
示例
mtl.getNetworkType({
success: function(res) {
var networkType = res.networkType;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设备信息-获取系统信息
getSystemInfo
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
brand
string
手机厂商
model
string
手机型号
platform
string
系统名称：Android/iOS
system
string
系统版本
screenWidth
number
屏幕宽度
screenHeight
number
屏幕高度
pixelRatio
number
设备像素比
YZVersion
string
友空间版本号/独立app版本号
YZLanguage
string
友空间当前设置的语言/独立app当前系统语言
deviceId
string
设备唯一标识
示例
mtl.getSystemInfo({
success: function(res) {
var YZVersion = res.YZVersion;
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
设备信息-获取设备唯一标识
getUniqueId (6.0.0及以上)
getMac (即将废弃)
获取设备唯一标识
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
macAddress
string
设备唯一标识
示例
mtl.getUniqueId({
success: function(res) {
var macAddress = res.macAddress;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
地图-获取位置信息
getLocation
获取当前坐标,需要引入upesn-plugin-map插件并在project.json文件中替换用户自己的高德地图key
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
type
string
否
默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
返回参数说明
字段
类型
说明
latitude
string
纬度，浮点数，范围为90 ~ -90
longitude
string
经度，浮点数，范围为180 ~ -180
address
string
地址
示例
mtl.getLocation({
type: "wgs84",
success: function(res) {
var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
var address = res.address; //地址
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
地图-打开地图
openMap (6.0.0及以上)
openLocation (即将废弃)
打开地图查看指定坐标位置,需要引入upesn-plugin-map插件并在project.json文件中替换用户自己的高德地图key
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
latitude
number
是
纬度，浮点数，范围为90 ~ -90
longitude
number
是
经度，浮点数，范围为180 ~ -180。
searchRaidus
number
否
查询半径（单位：米），小于0时不限制(微信不支持)
name
string
否
位置名，如 "用友软件园"，缺省时显示 "[位置]"（仅微信支持）
address
string
否
地址详情说明（仅微信支持）
scale
number
否
地图缩放级别,整形值,范围从1~28。默认为28（仅微信支持）
示例
mtl.openMap({
latitude: 0,
longitude: 0,
name: "用友软件园",
address: "北清路68号",
scale: 28,
success: function (res) {
var addrstr = res.addrstr;
var latitude = res.latitude;
var longitude = res.longitude;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
地图打点(导航)
markAndNavigationDestination
在地图中展示目标点以及跳转第三方地图进行导航
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
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
目标地区纬度
longitude
string
否
目标地区经度
userInfo
object
否
用户信息
infomation
string
否
客户信息
navigation
bool
否
是否需要导航
userInfo的合法值
名称
类型
默认值
必填
说明
header
string
否
目标头像(如果为空则根据名称自动生成)
userId
string
否
目标userId
userName
string
否
目标名称
示例
mtl.markAndNavigationDestination({
...
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开第三方地图导航
openMapToNavi
打开第三方地图app进行导航
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✘
✘
✔︎
✔︎
参数
字段
类型
必填
说明
type
enum
是
导航类型，
mtl.NAVITYPE.GAODE：高德地图;
mtl.NAVITYPE.BAIDU：百度地图;
mtl.NAVITYPE.TENCENT：腾讯地图
latitude
string
是
目的地纬度
longitude
string
是
目的地经度
示例
mtl.openMapToNavi({
type:mtl.NAVITYPE.GAODE,
latitude:39.872851,
longitude:116.586559
});
开启持续定位
startContinuousLocation (6.0.0及以上)
continuousLocationStart (即将废弃)
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.startContinuousLocation({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取持续定位信息
getContinuousLocation (6.0.0及以上)
continuousLocationGet (即将废弃)
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
参数
类型
说明
latitude
string
纬度
longitude
string
经度
address
string
地址描述
city
string
城市名称
cityCode
string
城市编码
accuracy
string
获取定位精度
speed
string
速度
province
string
省信息
time
string
定位时间
示例
mtl.getContinuousLocation({
success: function(res) {
const {latitude, longitude, ...} = res
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
关闭持续定位
stopContinuousLocation (6.0.0及以上)
continuousLocationStop (即将废弃)
**需要选择插件： **高德地图(带界面)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.stopContinuousLocation({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
权限查询
getAuthorizationStatus
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
type
number
是
授权类型。0相册权限开关；1相机权限开关；2麦克风权限开关；3位置权限开关；4通讯录权限开关
返回参数说明
字段
类型
说明
authStatus
number
授权状态：0，未授权 1，已授权
示例
mtl.getAuthorizationStatus({
type : 0,
success: funtion(res) {
let authStatus = res.authStatus
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
监听网络状态变化
onNetworkStatusChange
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
callback
function
是
网络变化是的回调函数
返回参数说明
字段
类型
说明
isConnected
boolean
是否连接网络
networkType
String
网络类型（WIFI, 4G,3G,2G,unknown,none）
示例
mtl.onNetworkStatusChange({
callback : function(res) {
},
success: function(res) {
let authStatus = res.authStatus
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
监听摇一摇
onShake (6.0.0及以上)
watchShake (即将废弃)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
callback
function
是
回调函数
示例
mtl.onShake({
callback：function(res){
},
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
截屏
screenShot
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
type
number
否
0 只截取当前webview的图像
1 截取整个友空间APP的图像（包含导航条）
resultType
number
否
0 返回截图的base字符串
1 返回截图的存储路径
返回参数说明
字段
类型
说明
picStr
String
图片base64编码字符串
picPath
String
图片的存储路径
示例
mtl.screenShot({
type: 0,
resultType: 1,
success: function(res) {
const {picStr,picPath} = res
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
监听用户截屏
onUserCaptureScreen
监听用户主动截屏事件，用户使用系统截屏按键截屏时触发
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
callback
function
是
用户截屏时的回调函数
示例
mtl.onUserCaptureScreen({
callback：function(res){
},
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
拨打电话
dail
支持平台
微信
友空间
安卓
iOS
✔︎
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
number
string
是
电话号码
示例
mtl.dail({
number：'xxx',
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
拦截返回事件
onInterceptBack (6.0.0及以上)
backIntercept (即将废弃)
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
callback
function
是
返回事件回调函数
示例
mtl.onInterceptBack({
callback：function(res){
},
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
震动
vibrateOnce
使手机发生一次短暂震动。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
示例
mtl.vibrateOnce({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
强制横竖屏
changeScreenOrientation
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
字段
类型
必填
说明
orientation
boolean
是
横屏 false, 竖屏 true
示例
mtl.changeScreenOrientation({
orientation: true,
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
恢复默认横竖屏
restoreScreenOrientation
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.restoreScreenOrientation({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打开系统浏览器
openSchema
打开系统浏览器。
支持平台
安卓
iOS
✔︎
✔︎
参数
字段
说明
url
页面的url
示例
mtl.openSchema({
url: '',
success: function(res) {
// 成功回调
...
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 映美打印机
<!-- source: /docs/Client-API/MTL/yingmei -->

映美打印机
mtl支持版本6.0.6及以上
封装映美CFP-820BW针式云打印机局域网wifi、蓝牙打印的相关操作，支持打印html、图片，使用前请先按照说明书配置网络。图片仅支持jpg、png格式，大小不能超过600K。打印html仅支持本地静态htlm通过局域网wifi链接打印。手机系统支持Android 7.0以上手机，ios暂不支持。
搜索可用的映美打印设备
searchDevices
搜索可用的映美打印设备，需要手机开启蓝牙和位置；使用局域网wifi,需要先扫描打印机上的二维码，配置网络
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
默认值
必填
说明
time
number
10
是
搜索超时时间，默认10秒，超出时间后没有搜索到可用设备时需要重新搜索
type
string
all
是
搜索类型，参考值：
"wifi":局域网wifi;
"classic":蓝牙经典版；
"ble":蓝牙低功耗版;
"all":包括全面三种全部
callback
function
是
搜索数据回调函数
注意：
注意：打印效果wifi>classic>ble;使用ble打印图片数据量较大会出现数据丢包进而出现打印乱码的现象；搜索不到打印机wifi的时候需要扫描打印机上的二维码重新配网
示例
mtl.ymPrinter.searchDevices({
time:10,
type:'all',
callback: function(res){
const status = res.status,//布尔类型：true：表示扫描到设备，false
const eventType = res.eventType, //字符串类型：//startDevices 表示开始搜索； //stopDevices 表示结束搜索；//findDevices表示发现设备，只要搜索到新的就会一直回调，直到搜索结束
const deviceInfos = res.deviceInfos, //JSonArray,eventType为"findDevices"时返回搜索到的打印设备信息
},
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否支持蓝牙BLE
isSupportedBLE
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.isSupportedBLE({
success: function(res) {
const isSupportedBLE = res.isSupportedBLE,//布尔类型：布尔类型：true：支持，false：不支持
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
蓝牙是否开启
isBluetoothOpen
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.isBluetoothOpen({
success: function(res) {
const isBluetoothOpen = res.isBluetoothOpen,//布尔类型：布尔类型：true：支持，false：不支持
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
获取已链接设备信息
getConnectedDevice
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.getConnectedDevice({
success: function(res) {
const status = res.status,//布尔类型：true:表示有设备链接；false表示无设备链接
const deviceInfo = res.deviceInfo//JSon对象，status为 true 时返回，内部字段如下：
//wifi搜索: address为ip地址, did为打印机编号, pstatus为打印机状态:(0 空闲 1 忙碌 2 异常), mdl为打印机型号. (作为打印参数时:则必须有address和did)
//蓝牙搜索: address 为mac地址, did为蓝牙名 (做为打印参数时:则必须有address)
//transType:打印类型（BLE/CLASSIC/WIFI），打印时必须有该参数
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打印图片
printPicture
打印图片, 注意图片仅支持png和jpg格式的，大小有限制，不能超过600K
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
默认值
必填
说明
deviceInfo
obj
是
searchDevices方法中返回的deviceInfos中的任意一个都可以选择
path
string
是
本地图片的路径，支持fs、绝对路径
示例
mtl.ymPrinter.printPicture({
deviceInfo:{"address":"DC:E9:94:8B:4B:8A","did":"DESKTOP-1MPSR34","mdl":null,"progress":0,"pstatus":0,"status":0,"taskid":null,"tp":0,"transType":"TRANS_CLASSIC"},
path:'https://pic2.ntimg.cn/pic/20220520/25297851_161452446108_4.jpg',
success: function(res) {
const status = res.status,//布尔类型：true：数据发送成功，false：数据发送失败
const msg = res.msg //字符串类型： status为 false 时返回错误信息
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
打印html
printHTML
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
默认值
必填
说明
deviceInfo
obj
是
searchDevices方法中返回的deviceInfos中的任意一个都可以选择
path
string
是
本地html的路径，支持fs、绝对路径
注意： CFP-820BW只支持wifi链接打印；支持标准规范的html标签，样式只能支持到IE11内核，可以打印表格数据以及标准规范排版页面，html页面的body宽度不大于打印机的纸张宽度值，Body宽度的像素最大值等于纸张宽度*打印机dpi/25.4打印机的dpi值。CFP-820BW的dpi值为180。
示例
mtl.ymPrinter.printHTML({
deviceInfo:{"address":"DC:E9:94:8B:4B:8A","did":"DESKTOP-1MPSR34","mdl":null,"progress":0,"pstatus":0,"status":0,"taskid":null,"tp":0,"transType":"TRANS_CLASSIC"},
path:'/storage/emulated/0/Android/data/com.yongyou.youpu.debug/files/ymprinter/25297851_161452446108_4.jpg',
success: function(res) {
const status = res.status,//布尔类型：true：数据发送成功，false：数据发送失败
const msg = res.msg //字符串类型： status为 false 时返回错误信息
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
选择一个文件打印
printFile
打开系统的文件选择器，选择一个文件打印，只支持图片、html文件；pdf需要转成图片后才能打印。打印图片大小不能超过600K,图片格式为jpg、png。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
字段
类型
默认值
必填
说明
deviceInfo
obj
是
searchDevices方法中返回的deviceInfos中的任意一个都可以选择
示例
mtl.ymPrinter.printFile({
deviceInfo:{"address":"DC:E9:94:8B:4B:8A","did":"DESKTOP-1MPSR34","mdl":null,"progress":0,"pstatus":0,"status":0,"taskid":null,"tp":0,"transType":"TRANS_CLASSIC"},
path:'/storage/emulated/0/Android/data/com.yongyou.youpu.debug/files/ymprinter/25297851_161452446108_4.jpg',
success: function(res) {
const status = res.status,//布尔类型：true：数据发送成功，false：数据发送失败
const msg = res.msg //字符串类型： status为 false 时返回错误信息
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
停止搜索
stopSearch
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.stopSearch({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
关闭链接
closeConnect
关闭链接，调用该方法会关闭与打印机的通信，未发送完的数据会丢失，应当在不需要连接的时候使用。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.closeConnect({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
释放资源
release
释放资源，调用该方法会关闭与打印机的通信，日志写入也会停止。可以在APP退出或页面关闭时调用。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✘
参数
-无-
示例
mtl.ymPrinter.release({
success: function(res) {
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->

## 用户交互行为反馈
<!-- source: /docs/Client-API/MTL/jiaohu -->

用户交互行为反馈
浏览器当前网页是否可返回上一级
canWebviewBack (6.0.0及以上)
isWebviewCanGoBack (即将废弃)
浏览器当前网页是否可返回上一级。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-
返回参数说明
字段
类型
说明
result
booleam
是否可返回
示例
mtl.canWebviewBack({
success: function(res) {
// 成功回调
let result = res.result;
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
浏览器当前网页返回上一级
webviewBack (6.0.0及以上)
onWebviewGoBack (即将废弃)
浏览器当前网页返回上一级。
支持平台
微信
友空间
安卓
iOS
✘
✔︎
✔︎
✔︎
参数
-无-** 示例
mtl.webviewBack({
success: function() {
// 成功回调
},
fail: function(err) {
var message = err.message; // 错误信息
}
});
是否仍需要帮助？ 请保持联络！
最后更新于 2026/04/24
Copyright © 2026 - Powered by Yonbuilder
-->
